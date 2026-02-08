"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import {
    createAuthRequestMessage,
    createAuthVerifyMessageFromChallenge,
    createAppSessionMessage,
    createSubmitAppStateMessage,
    createCloseAppSessionMessage,
    parseAnyRPCResponse,
    RPCProtocolVersion,
    RPCAppStateIntent,
    type RPCAppSessionAllocation,
    type RPCAppDefinition,
    type MessageSigner,
    RPCData,
    NitroliteClient,
    WalletStateSigner,
    createPingMessageV2, 
} from '@erc7824/nitrolite';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { type Hex, type Address, toHex } from 'viem';
import { YELLOW_CONFIG, BASE_SEPOLIA_YELLOW } from '@/lib/yellow/config';

// Use centralized config
const YELLOW_WS_URL = YELLOW_CONFIG.wsUrl;
const HOUSE_ADDRESS = YELLOW_CONFIG.houseAddress;
const APPLICATION = YELLOW_CONFIG.application;

interface NitroliteContextType {
    connect: () => Promise<void>;
    createSession: (depositAmount?: bigint) => Promise<void>;
    sendPayment: (amount: bigint) => Promise<void>;
    closeSession: () => Promise<{ allocations: RPCAppSessionAllocation[] } | null>;
    disconnect: () => void;
    reconnect: () => Promise<void>;
    depositToCustody: (amount: bigint) => Promise<Hex | null>;
    status: 'disconnected' | 'connecting' | 'authenticated' | 'session_active';
    sessionId: Hex | null;
    stateVersion: number;
    currentAllocations: RPCAppSessionAllocation[];
    logs: string[];
    addLog: (msg: string) => void;
    isConnected: boolean;
    isAuthenticated: boolean;
    isSessionActive: boolean;
}

const NitroliteContext = createContext<NitroliteContextType | null>(null);

export function NitroliteProvider({ children }: { children: React.ReactNode }) {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient({ chainId: BASE_SEPOLIA_YELLOW.chainId });
    const wsRef = useRef<WebSocket | null>(null);

    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'authenticated' | 'session_active'>('disconnected');
    const [sessionId, setSessionId] = useState<Hex | null>(null);
    const [stateVersion, setStateVersion] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [currentAllocations, setCurrentAllocations] = useState<RPCAppSessionAllocation[]>([]);

    const addLog = useCallback((msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    }, []);

    // Message signer for SDK functions - signs RPCData payload
    const createSigner = useCallback((): MessageSigner | null => {
        if (!walletClient) return null;
        return async (payload: RPCData): Promise<Hex> => {
            // Convert RPCData to string for signing (matching SDK's ECDSA signer approach)
            const message = toHex(JSON.stringify(payload, (_, v) =>
                (typeof v === 'bigint' ? v.toString() : v)
            ));
            return await walletClient.signMessage({ message });
        };
    }, [walletClient]);

    // Handle auth verification after receiving challenge
    const handleAuthVerify = useCallback(async (params: any) => {
        const signer = createSigner();
        if (!signer || !wsRef.current) return;

        try {
            // Server sends params: { challenge_message: "..." }
            // SDK types might expect challengeMessage. We handle both.
            const challengeStr = params.challenge_message || params.challengeMessage || params.challenge;
            
            if (!challengeStr) {
                 addLog(`❌ Auth failed: Missing challenge string in ${JSON.stringify(params)}`);
                 return;
            }

            addLog("🔐 Verifying auth...");
            // Use specific function for string challenge to avoid object shape mismatch
            const verifyMessage = await createAuthVerifyMessageFromChallenge(signer, challengeStr);
            
            wsRef.current.send(verifyMessage);
            setStatus('authenticated');
            addLog("✅ Authenticated with Yellow Network");
        } catch (e: any) {
            console.error("Auth Verify Error:", e);
            addLog(`❌ Auth verify failed: ${e.message}`);
        }
    }, [createSigner, addLog]);

    // Handle incoming WebSocket messages
    const handleMessage = useCallback((data: string) => {
        try {
            const message = parseAnyRPCResponse(data);
            console.log("RX:", JSON.stringify(message, null, 2));

            // Check if it's an error response
            if (message && typeof message === 'object' && 'error' in message) {
                addLog(`❌ Error: ${JSON.stringify(message.error)}`);
                return;
            }

            // Handle different response types based on result
            if (message && typeof message === 'object' && 'result' in message) {
                const result = message.result as any;

                // Auth challenge response
                if (result?.challenge) {
                    addLog(`🔐 Auth challenge received`);
                    handleAuthVerify(result);
                    return;
                }

                // Session created response
                if (result?.app_session_id) {
                    setSessionId(result.app_session_id);
                    setStateVersion(0);
                    setStatus('session_active');
                    addLog(`✅ Session Created: ${result.app_session_id.slice(0, 10)}...`);
                    return;
                }

                // State update acknowledgment
                if (result?.version !== undefined) {
                    setStateVersion(result.version);
                    addLog(`📊 State v${result.version} confirmed`);
                    return;
                }

                // Session closed
                if (result?.closed || result?.status === 'closed') {
                    addLog(`✅ Session Closed Successfully`);
                    setSessionId(null);
                    setStatus('authenticated');
                    return;
                }

                // Generic success
                addLog(`✓ RPC OK`);
                return;
            }

            // Handle Server Requests (Method calls)
            if (message && typeof message === 'object' && 'method' in message) {
                const method = (message as any).method;
                const params = (message as any).params;

                if (method === 'auth_challenge') {
                    addLog(`🔐 Auth challenge received (Method)`);
                    handleAuthVerify(params);
                    return;
                }

                if (method === 'error') {
                    addLog(`❌ Server Error: ${JSON.stringify(message)}`);
                    console.error("Server Error details:", message);
                    return;
                }
            }
        } catch (e) {
            console.error("Parse error", e);
            addLog(`⚠️ Parse error: ${e}`);
        }
    }, [addLog, handleAuthVerify]);

    // Disconnect WebSocket
    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setStatus('disconnected');
        setSessionId(null);
        setCurrentAllocations([]);
    }, []);

    // Connect to WebSocket and authenticate
    const connect = useCallback(async () => {
        if (!address || !walletClient) {
            addLog("❌ Wallet not connected");
            return;
        }

        // Retry / Reconnect logic
        if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) return;

        setStatus('connecting');
        addLog(`Connecting to ${YELLOW_WS_URL}...`);
        
        try {
            const ws = new WebSocket(YELLOW_WS_URL);
            wsRef.current = ws;

            ws.onopen = async () => {
                addLog('✅ WebSocket Connected');

                // Start authentication flow
                try {
                    const authMessage = await createAuthRequestMessage({
                        address: address as Address,
                        session_key: address as Address, // Using main wallet as session key for simplicity
                        application: APPLICATION,
                        allowances: [
                            { asset: BASE_SEPOLIA_YELLOW.usdc, amount: '10000000' }, // 10 USDC allowance
                        ],
                        expires_at: BigInt(Math.floor(Date.now() / 1000) + 86400), // 24 hours
                        scope: 'game',
                    });

                    console.log("Auth Message Payload:", authMessage);
                    ws.send(authMessage);
                    addLog(`📤 Auth sent (Asset: ${BASE_SEPOLIA_YELLOW.usdc.slice(0,6)}...)`); 
                } catch (e: any) {
                    console.error("Auth generation error:", e);
                    addLog(`❌ Auth request failed: ${e.message}`);
                }
            };

            ws.onmessage = (event) => {
                handleMessage(event.data);
            };

            ws.onclose = (event) => {
                console.log("WS Close:", event.code, event.reason);
                // Only clean up if this is still the current socket
                if (wsRef.current === ws) {
                    wsRef.current = null;
                    setStatus('disconnected');
                    setSessionId(null);
                }
                addLog(`WebSocket Disconnected (Code: ${event.code})`);
            };

            ws.onerror = (err) => {
                console.error("WS Error:", err);
                addLog('❌ Connection Error - Retrying in 3s...');
            };
        } catch (err) {
             addLog(`❌ Socket Init Failed: ${err}`);
        }
    }, [address, walletClient, handleMessage, addLog]);

    // Force Reconnect Helper
    const reconnect = useCallback(async () => {
        disconnect();
        // Wait a bit for cleanup
        setTimeout(connect, 500);
    }, [disconnect, connect]);

    // Deposit to Yellow Custody on Base Sepolia
    const depositToCustody = useCallback(async (amount: bigint) => {
        if (!walletClient || !publicClient || !address) {
            addLog("❌ Wallet not ready for deposit");
            return null;
        }

        try {
            addLog(`💰 Depositing ${amount.toString()} USDC to Custody...`);

            const stateSigner = new WalletStateSigner(walletClient);
            const client = new NitroliteClient({
                publicClient: publicClient as any, // Cast/Ensure compatibility
                walletClient: walletClient as any,
                stateSigner,
                addresses: {
                    adjudicator: BASE_SEPOLIA_YELLOW.adjudicator,
                    custody: BASE_SEPOLIA_YELLOW.custody,
                },
                chainId: BASE_SEPOLIA_YELLOW.chainId,
                challengeDuration: 86400n, // Minimum 3600s required. Using 24h.
            });

            // Manual Approve-Wait-Deposit Flow to prevent race conditions
            const allowance = await client.getTokenAllowance(BASE_SEPOLIA_YELLOW.usdc);
            
            if (allowance < amount) {
                addLog(`🔐 Approving USDC... (Please sign)`);
                const approveTx = await client.approveTokens(BASE_SEPOLIA_YELLOW.usdc, amount);
                addLog(`⏳ Waiting for Approval: ${approveTx.slice(0, 10)}...`);
                
                await publicClient.waitForTransactionReceipt({ hash: approveTx });
                addLog(`✅ Approval Confirmed`);
            }

            addLog(`💰 Signing Deposit...`);
            const txHash = await client.deposit(BASE_SEPOLIA_YELLOW.usdc, amount);

            addLog(`✅ Deposit Tx: ${txHash.slice(0, 10)}...`);
            return txHash;

        } catch (e: any) {
            console.error(e);
            addLog(`❌ Deposit failed: ${e.message}`);
            return null;
        }
    }, [walletClient, publicClient, address, addLog]);

    // Create App Session (after authentication + deposit)
    const createSession = useCallback(async (depositAmount: bigint = 800000n) => {
        const signer = createSigner();
        if (!signer || !address || !wsRef.current || status !== 'authenticated') {
            addLog("❌ Not authenticated or wallet not ready");
            return;
        }

        try {
            addLog("Creating App Session...");

            // Define the app session
            const definition: RPCAppDefinition = {
                application: HOUSE_ADDRESS,
                protocol: RPCProtocolVersion.NitroRPC_0_4,
                participants: [address as Hex, HOUSE_ADDRESS as Hex],
                weights: [50, 50],
                quorum: 100, // Unanimous consent
                challenge: 0,
                nonce: Date.now(),
            };

            // Allocations based on deposit
            // Player gets what they deposited. House gets a base liquidity (e.g., 0.2 USDC or matching)
            // Asset must be the actual USDC contract address (matching auth allowances)
            const allocations: RPCAppSessionAllocation[] = [
                { participant: address as Address, asset: BASE_SEPOLIA_YELLOW.usdc, amount: depositAmount.toString() },
                { participant: HOUSE_ADDRESS, asset: BASE_SEPOLIA_YELLOW.usdc, amount: '200000' }, // House liquidity
            ];

            // Save initial allocations for state tracking
            setCurrentAllocations(allocations);

            const sessionMessage = await createAppSessionMessage(signer, {
                definition,
                allocations,
            });

            wsRef.current.send(sessionMessage);
            addLog("📤 Session create request sent");

        } catch (e: any) {
            console.error(e);
            addLog(`❌ Session create failed: ${e.message}`);
        }
    }, [address, status, createSigner, addLog]);

    // Send payment via state channel (proper SDK state update)
    const sendPayment = useCallback(async (amount: bigint) => {
        const signer = createSigner();
        if (!signer || !address || !sessionId || !wsRef.current) {
            addLog("❌ Session not active");
            return;
        }

        try {
            // Calculate new allocations (transfer from player to house)
            const amountStr = amount.toString();
            const playerAmount = BigInt(currentAllocations[0]?.amount || '0') - amount;
            const houseAmount = BigInt(currentAllocations[1]?.amount || '0') + amount;

            if (playerAmount < 0n) {
                addLog("❌ Insufficient channel balance");
                return;
            }

            const newAllocations: RPCAppSessionAllocation[] = [
                { participant: address as Address, asset: BASE_SEPOLIA_YELLOW.usdc, amount: playerAmount.toString() },
                { participant: HOUSE_ADDRESS, asset: BASE_SEPOLIA_YELLOW.usdc, amount: houseAmount.toString() },
            ];

            const newVersion = stateVersion + 1;

            // Create state update using SDK
            const stateMessage = await createSubmitAppStateMessage<typeof RPCProtocolVersion.NitroRPC_0_4>(
                signer,
                {
                    app_session_id: sessionId,
                    intent: RPCAppStateIntent.Operate,
                    version: newVersion,
                    allocations: newAllocations,
                }
            );

            wsRef.current.send(stateMessage);

            // Optimistically update local state
            setCurrentAllocations(newAllocations);
            setStateVersion(newVersion);

            addLog(`💸 Payment: ${amountStr} units (v${newVersion})`);

        } catch (e: any) {
            addLog(`❌ Payment failed: ${e.message}`);
        }
    }, [address, sessionId, stateVersion, currentAllocations, createSigner, addLog]);

    // Close session and prepare for on-chain settlement
    const closeSession = useCallback(async (): Promise<{ allocations: RPCAppSessionAllocation[] } | null> => {
        const signer = createSigner();
        if (!signer || !sessionId || !wsRef.current) {
            addLog("❌ No active session to close");
            return null;
        }

        try {
            addLog("Closing session...");

            const closeMessage = await createCloseAppSessionMessage(signer, {
                app_session_id: sessionId,
                allocations: currentAllocations,
            });

            wsRef.current.send(closeMessage);
            addLog("📤 Close request sent");

            // Return final allocations for on-chain settlement
            return { allocations: currentAllocations };

        } catch (e: any) {
            addLog(`❌ Close failed: ${e.message}`);
            return null;
        }
    }, [sessionId, currentAllocations, createSigner, addLog]);

    // Keep-Alive Heartbeat
    useEffect(() => {
        const interval = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                // Send a lightweight ping to keep the connection alive
                const ping = createPingMessageV2();
                wsRef.current.send(ping);
            }
        }, 15000); // 15 seconds (well under the 60s timeout)

        return () => clearInterval(interval);
    }, []);

    const value = {
        connect,
        createSession,
        sendPayment,
        closeSession,
        disconnect,
        depositToCustody,
        status,
        sessionId,
        stateVersion,
        currentAllocations,
        logs,
        addLog,
        reconnect,
        isConnected: status !== 'disconnected' && status !== 'connecting',
        isAuthenticated: status === 'authenticated' || status === 'session_active',
        isSessionActive: status === 'session_active',
    };

    return (
        <NitroliteContext.Provider value={value}>
            {children}
        </NitroliteContext.Provider>
    );
}

export function useNitrolite() {
    const context = useContext(NitroliteContext);
    if (!context) {
        throw new Error('useNitrolite must be used within a NitroliteProvider');
    }
    return context;
}
