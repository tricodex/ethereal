import { useState, useRef, useCallback } from 'react';
import {
    createAuthRequestMessage,
    createAuthVerifyMessage,
    createAppSessionMessage,
    createSubmitAppStateMessage,
    createCloseAppSessionMessage,
    parseAnyRPCResponse,
    RPCProtocolVersion,
    RPCAppStateIntent,
    type RPCAppSessionAllocation,
    type RPCAppDefinition,
    type MessageSigner,
    type RPCData,
    NitroliteClient,
    WalletStateSigner,
} from '@erc7824/nitrolite';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { type Hex, type Address, toHex } from 'viem';
import { YELLOW_CONFIG, BASE_SEPOLIA_YELLOW } from '@/lib/yellow/config';

// Use centralized config
const YELLOW_WS_URL = YELLOW_CONFIG.wsUrl;
const HOUSE_ADDRESS = YELLOW_CONFIG.houseAddress;
const APPLICATION = YELLOW_CONFIG.application;

export function useNitrolite() {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const wsRef = useRef<WebSocket | null>(null);

    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'authenticated' | 'session_active'>('disconnected');
    const [sessionId, setSessionId] = useState<Hex | null>(null);
    const [stateVersion, setStateVersion] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    // Track current allocations for state updates
    const [currentAllocations, setCurrentAllocations] = useState<RPCAppSessionAllocation[]>([]);

    const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 50));

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

    // Handle incoming WebSocket messages
    const handleMessage = useCallback((data: string) => {
        try {
            const message = parseAnyRPCResponse(data);
            console.log("RX:", message);

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
            }
        } catch (e) {
            console.error("Parse error", e);
            addLog(`⚠️ Parse error: ${e}`);
        }
    }, []);

    // Handle auth verification after receiving challenge
    const handleAuthVerify = useCallback(async (challengeResponse: any) => {
        const signer = createSigner();
        if (!signer || !wsRef.current) return;

        try {
            addLog("🔐 Verifying auth...");
            const verifyMessage = await createAuthVerifyMessage(signer, challengeResponse);
            wsRef.current.send(verifyMessage);
            setStatus('authenticated');
            addLog("✅ Authenticated with Yellow Network");
        } catch (e: any) {
            addLog(`❌ Auth verify failed: ${e.message}`);
        }
    }, [createSigner]);

    // Connect to WebSocket and authenticate
    const connect = useCallback(async () => {
        if (!address || !walletClient) {
            addLog("❌ Wallet not connected");
            return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        setStatus('connecting');
        addLog(`Connecting to Yellow Network...`);

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
                        { asset: 'usdc', amount: '10000000' }, // 10 USDC allowance
                    ],
                    expires_at: BigInt(Math.floor(Date.now() / 1000) + 86400), // 24 hours
                    scope: 'game',
                });

                ws.send(authMessage);
                addLog("📤 Auth request sent");
            } catch (e: any) {
                addLog(`❌ Auth request failed: ${e.message}`);
            }
        };

        ws.onmessage = (event) => {
            handleMessage(event.data);
        };

        ws.onclose = () => {
            setStatus('disconnected');
            setSessionId(null);
            addLog('WebSocket Disconnected');
        };

        ws.onerror = (err) => {
            console.error(err);
            setStatus('disconnected');
            addLog('❌ Connection Error');
        };
    }, [address, walletClient, handleMessage]);

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
                challengeDuration: 60n, // 1 minute for testnet
            });

            // client.deposit handles approve + deposit logic internally if implemented,
            // or we might need to approve manually first. Assuming client.deposit does standard checks.
            const txHash = await client.deposit(BASE_SEPOLIA_YELLOW.usdc, amount);

            addLog(`✅ Deposit Tx: ${txHash.slice(0, 10)}...`);
            return txHash;

        } catch (e: any) {
            console.error(e);
            addLog(`❌ Deposit failed: ${e.message}`);
            return null;
        }
    }, [walletClient, publicClient, address]);

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
            const allocations: RPCAppSessionAllocation[] = [
                { participant: address as Address, asset: 'usdc', amount: depositAmount.toString() },
                { participant: HOUSE_ADDRESS, asset: 'usdc', amount: '200000' }, // House liquidity
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
    }, [address, status, createSigner]);

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
                { participant: address as Address, asset: 'usdc', amount: playerAmount.toString() },
                { participant: HOUSE_ADDRESS, asset: 'usdc', amount: houseAmount.toString() },
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
    }, [address, sessionId, stateVersion, currentAllocations, createSigner]);

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
    }, [sessionId, currentAllocations, createSigner]);

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

    return {
        connect,
        createSession,
        sendPayment,
        closeSession,
        disconnect,
        depositToCustody, // New function
        status,
        sessionId,
        stateVersion,
        currentAllocations,
        logs,
        addLog,
        isConnected: status !== 'disconnected' && status !== 'connecting',
        isAuthenticated: status === 'authenticated' || status === 'session_active',
        isSessionActive: status === 'session_active',
    };
}
