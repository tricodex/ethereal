"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAccount, useSignTypedData, useWalletClient } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import type { ChannelState, GameSession, OffChainGameState } from '@/lib/yellow/types';

// Yellow Network ClearNode endpoints
const CLEARNODE_ENDPOINTS = {
    MAINNET: 'wss://clearnet.yellow.com/ws',
    SANDBOX: 'wss://clearnet-sandbox.yellow.com/ws',
} as const;

// EIP-712 Domain for Yellow Network signing
const EIP712_DOMAIN = {
    name: 'YellowNetwork',
    version: '1',
};

// EIP-712 Types for game state signing
const GAME_STATE_TYPES = {
    GameState: [
        { name: 'channelId', type: 'string' },
        { name: 'score', type: 'uint256' },
        { name: 'moves', type: 'uint256' },
        { name: 'level', type: 'uint256' },
        { name: 'timestamp', type: 'uint256' },
    ],
};

interface UseYellowChannelOptions {
    network?: 'mainnet' | 'sandbox';
    autoConnect?: boolean;
}

interface UseYellowChannelReturn {
    // Connection state
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;

    // Channel state
    channel: ChannelState | null;
    session: GameSession | null;

    // Actions
    connect: () => Promise<void>;
    disconnect: () => void;
    createGameSession: (stakeAmount: string) => Promise<GameSession | null>;
    submitGameState: (state: OffChainGameState) => Promise<boolean>;
    endSession: (finalScore: number) => Promise<boolean>;
    withdrawBalance: (amount: string) => Promise<boolean>;

    // Utilities
    formatBalance: (amount: string) => string;
}

/**
 * Hook for managing Yellow Network state channels in CrushETH
 *
 * This enables:
 * - Gasless in-game transactions (score updates, moves)
 * - Instant settlement without blockchain confirmations
 * - Session-based gameplay with USDC staking
 */
export function useYellowChannel(options: UseYellowChannelOptions = {}): UseYellowChannelReturn {
    const { network = 'sandbox', autoConnect = false } = options;
    const { address, isConnected: walletConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { signTypedDataAsync } = useSignTypedData();

    // WebSocket connection
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Channel state
    const [channel, setChannel] = useState<ChannelState | null>(null);
    const [session, setSession] = useState<GameSession | null>(null);

    // Message queue for pending responses
    const pendingRequests = useRef<Map<string, { resolve: Function; reject: Function }>>(new Map());

    // Generate unique request ID
    const generateRequestId = () => `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Send message to ClearNode
    const sendMessage = useCallback((method: string, params: object): Promise<any> => {
        return new Promise((resolve, reject) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                reject(new Error('Not connected to Yellow Network'));
                return;
            }

            const requestId = generateRequestId();
            const message = JSON.stringify({
                jsonrpc: '2.0',
                id: requestId,
                method,
                params,
            });

            pendingRequests.current.set(requestId, { resolve, reject });
            wsRef.current.send(message);

            // Timeout after 30 seconds
            setTimeout(() => {
                if (pendingRequests.current.has(requestId)) {
                    pendingRequests.current.delete(requestId);
                    reject(new Error('Request timeout'));
                }
            }, 30000);
        });
    }, []);

    // Handle incoming messages
    const handleMessage = useCallback((event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);

            // Handle RPC responses
            if (data.id && pendingRequests.current.has(data.id)) {
                const { resolve, reject } = pendingRequests.current.get(data.id)!;
                pendingRequests.current.delete(data.id);

                if (data.error) {
                    reject(new Error(data.error.message || 'Unknown error'));
                } else {
                    resolve(data.result);
                }
                return;
            }

            // Handle channel events
            if (data.method === 'channel_update') {
                setChannel(prev => prev ? { ...prev, ...data.params } : null);
            } else if (data.method === 'session_update') {
                setSession(prev => prev ? { ...prev, ...data.params } : null);
            }
        } catch (err) {
            console.error('Error parsing Yellow message:', err);
        }
    }, []);

    // Connect to ClearNode
    const connect = useCallback(async () => {
        if (!address || !walletClient) {
            setError('Wallet not connected');
            return;
        }

        if (isConnected || isConnecting) return;

        setIsConnecting(true);
        setError(null);

        try {
            const endpoint = network === 'mainnet'
                ? CLEARNODE_ENDPOINTS.MAINNET
                : CLEARNODE_ENDPOINTS.SANDBOX;

            const ws = new WebSocket(endpoint);

            ws.onopen = async () => {
                console.log('Connected to Yellow Network ClearNode');

                // Authenticate with the node
                try {
                    // Request auth challenge
                    const authRequest = JSON.stringify({
                        jsonrpc: '2.0',
                        id: 'auth-request',
                        method: 'auth_request',
                        params: { wallet: address },
                    });
                    ws.send(authRequest);
                } catch (authError) {
                    console.error('Auth error:', authError);
                    setError('Authentication failed');
                    ws.close();
                }
            };

            ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);

                // Handle auth challenge
                if (data.id === 'auth-request' && data.result?.challenge) {
                    try {
                        // Sign the challenge with EIP-712
                        const signature = await signTypedDataAsync({
                            domain: EIP712_DOMAIN,
                            types: {
                                AuthChallenge: [
                                    { name: 'challenge', type: 'string' },
                                    { name: 'wallet', type: 'address' },
                                ],
                            },
                            primaryType: 'AuthChallenge',
                            message: {
                                challenge: data.result.challenge,
                                wallet: address,
                            },
                        });

                        // Verify auth
                        ws.send(JSON.stringify({
                            jsonrpc: '2.0',
                            id: 'auth-verify',
                            method: 'auth_verify',
                            params: { signature },
                        }));
                    } catch (signError) {
                        console.error('Signing error:', signError);
                        setError('Failed to sign auth challenge');
                        ws.close();
                    }
                } else if (data.id === 'auth-verify' && data.result?.authenticated) {
                    setIsConnected(true);
                    setIsConnecting(false);

                    // Fetch existing channel state
                    const channelData = await sendMessage('get_channel', { wallet: address });
                    if (channelData) {
                        setChannel(channelData);
                    }
                } else {
                    handleMessage(event);
                }
            };

            ws.onerror = (err) => {
                console.error('WebSocket error:', err);
                setError('Connection error');
                setIsConnecting(false);
            };

            ws.onclose = () => {
                console.log('Disconnected from Yellow Network');
                setIsConnected(false);
                setIsConnecting(false);
                wsRef.current = null;
            };

            wsRef.current = ws;
        } catch (err) {
            console.error('Failed to connect:', err);
            setError('Failed to connect to Yellow Network');
            setIsConnecting(false);
        }
    }, [address, walletClient, network, isConnected, isConnecting, signTypedDataAsync, sendMessage, handleMessage]);

    // Disconnect from ClearNode
    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
        setChannel(null);
        setSession(null);
    }, []);

    // Create a new game session with USDC stake
    const createGameSession = useCallback(async (stakeAmount: string): Promise<GameSession | null> => {
        if (!channel || !address) {
            setError('No active channel');
            return null;
        }

        try {
            const stakeBaseUnits = parseUnits(stakeAmount, 6).toString();

            // Check balance
            if (BigInt(channel.balance) < BigInt(stakeBaseUnits)) {
                setError('Insufficient channel balance');
                return null;
            }

            const result = await sendMessage('create_session', {
                channelId: channel.channelId,
                stakeAmount: stakeBaseUnits,
                protocol: 'gaming-app-v1',
                appId: 'crusheth-game',
            });

            const newSession: GameSession = {
                sessionId: result.sessionId,
                channelId: channel.channelId,
                stakeAmount: stakeBaseUnits,
                playerAddress: address,
                startTime: Date.now(),
                status: 'active',
            };

            setSession(newSession);

            // Update channel locked amount
            setChannel(prev => prev ? {
                ...prev,
                lockedAmount: stakeBaseUnits,
            } : null);

            return newSession;
        } catch (err) {
            console.error('Failed to create session:', err);
            setError('Failed to create game session');
            return null;
        }
    }, [channel, address, sendMessage]);

    // Submit off-chain game state update
    const submitGameState = useCallback(async (state: OffChainGameState): Promise<boolean> => {
        if (!session || !channel) {
            return false;
        }

        try {
            // Sign the game state
            const signature = await signTypedDataAsync({
                domain: EIP712_DOMAIN,
                types: GAME_STATE_TYPES,
                primaryType: 'GameState',
                message: {
                    channelId: channel.channelId,
                    score: BigInt(state.score),
                    moves: BigInt(state.moves),
                    level: BigInt(state.level),
                    timestamp: BigInt(state.timestamp),
                },
            });

            // Send to ClearNode (instant, gasless)
            await sendMessage('update_state', {
                sessionId: session.sessionId,
                state: { ...state, signature },
            });

            return true;
        } catch (err) {
            console.error('Failed to submit game state:', err);
            return false;
        }
    }, [session, channel, signTypedDataAsync, sendMessage]);

    // End session and settle on-chain
    const endSession = useCallback(async (finalScore: number): Promise<boolean> => {
        if (!session) {
            return false;
        }

        try {
            // Request session close
            await sendMessage('close_session', {
                sessionId: session.sessionId,
                finalScore,
            });

            setSession(prev => prev ? { ...prev, status: 'completed' } : null);

            // Update channel balance (unlock stake + winnings)
            setChannel(prev => prev ? {
                ...prev,
                lockedAmount: '0',
            } : null);

            return true;
        } catch (err) {
            console.error('Failed to end session:', err);
            return false;
        }
    }, [session, sendMessage]);

    // Withdraw USDC from channel to wallet
    const withdrawBalance = useCallback(async (amount: string): Promise<boolean> => {
        if (!channel) {
            return false;
        }

        try {
            const amountBaseUnits = parseUnits(amount, 6).toString();

            await sendMessage('resize_channel', {
                channelId: channel.channelId,
                resizeAmount: `-${amountBaseUnits}`,
            });

            // Update local balance
            setChannel(prev => prev ? {
                ...prev,
                balance: (BigInt(prev.balance) - BigInt(amountBaseUnits)).toString(),
            } : null);

            return true;
        } catch (err) {
            console.error('Failed to withdraw:', err);
            setError('Withdrawal failed');
            return false;
        }
    }, [channel, sendMessage]);

    // Format balance for display
    const formatBalance = useCallback((amount: string): string => {
        return formatUnits(BigInt(amount || '0'), 6);
    }, []);

    // Auto-connect if enabled
    useEffect(() => {
        if (autoConnect && walletConnected && !isConnected && !isConnecting) {
            connect();
        }
    }, [autoConnect, walletConnected, isConnected, isConnecting, connect]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        isConnecting,
        error,
        channel,
        session,
        connect,
        disconnect,
        createGameSession,
        submitGameState,
        endSession,
        withdrawBalance,
        formatBalance,
    };
}
