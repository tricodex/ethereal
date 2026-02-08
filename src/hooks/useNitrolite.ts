import { useState, useRef, useCallback } from 'react';
import { createAppSessionMessage, parseAnyRPCResponse } from '@erc7824/nitrolite';
import { useAccount, useWalletClient } from 'wagmi';

// Sandbox Endpoint
const YELLOW_WS_URL = 'wss://clearnet-sandbox.yellow.com/ws';
// Game House Address (The entity receiving payments)
const HOUSE_ADDRESS = "0x0996c2e70E4Eb633A95258D2699Cb965368A3CB6";

export function useNitrolite() {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const wsRef = useRef<WebSocket | null>(null);

    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 50));

    // Connect to Web Socket
    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        setStatus('connecting');
        addLog(`Connecting to ${YELLOW_WS_URL}...`);

        const ws = new WebSocket(YELLOW_WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setStatus('connected');
            addLog('✅ Connected to Yellow Network (Sandbox)');
        };

        ws.onmessage = (event) => {
            try {
                const message = parseAnyRPCResponse(event.data);
                handleMessage(message);
            } catch (e) {
                console.error("Parse error", e);
            }
        };

        ws.onclose = () => {
            setStatus('disconnected');
            // addLog('Disconnected from Yellow');
        };

        ws.onerror = (err) => {
            console.error(err);
            setStatus('disconnected');
            addLog('❌ Connection Error');
        };
    }, []);

    const handleMessage = (message: any) => {
        console.log("RX:", message);

        switch (message.type) {
            case 'session_created':
                setSessionId(message.sessionId);
                addLog(`✅ Session Confirmed: ${message.sessionId.slice(0, 10)}...`);
                break;
            case 'payment':
                addLog(`💰 Payment RX: ${message.amount}`);
                break;
            case 'error':
                addLog(`❌ Error: ${message.error || JSON.stringify(message)}`);
                break;
            default:
                if (message.result) {
                    // generic RPC success
                    addLog(`RPC OK: ${JSON.stringify(message.result)}`);
                }
        }
    };

    // Create Session
    const createSession = async () => {
        if (!walletClient || !address || status !== 'connected') {
            addLog("❌ Wallet or WS not ready");
            return;
        }

        try {
            addLog("Creating App Session...");

            // 1. Define App (Payment V1)
            const appDefinition = {
                application: HOUSE_ADDRESS as `0x${string}`, // Required by SDK type
                protocol: 'payment-app-v1' as const, // Strict type
                participants: [address, HOUSE_ADDRESS],
                weights: [50, 50],
                quorum: 100, // Unanimous consent required
                challenge: 0,
                nonce: Date.now()
            };

            // 2. Define Allocations (Initial State)
            const allocations = [
                { participant: address as `0x${string}`, asset: 'usdc', amount: '800000' }, // 0.8 USDC
                { participant: HOUSE_ADDRESS as `0x${string}`, asset: 'usdc', amount: '200000' } // 0.2 USDC
            ];

            // 3. Authenticate & Sign
            // Nitrolite implies we sign the session message
            // We use walletClient to sign
            const messageSigner = async (msg: any) => {
                const messageString = typeof msg === 'string' ? msg : JSON.stringify(msg);
                return await walletClient.signMessage({ message: messageString });
            };

            const sessionMessage = await createAppSessionMessage(
                messageSigner as any,
                { definition: appDefinition as any, allocations }
            );

            // 4. Send
            wsRef.current?.send(sessionMessage);
            addLog("📤 Sent Session Create Request");

        } catch (e: any) {
            console.error(e);
            addLog(`❌ Session Create Failed: ${e.message}`);
        }
    };

    const sendPayment = async (amount: bigint) => {
        if (!walletClient || !address || !sessionId) {
            addLog("❌ Check session or wallet");
            return;
        }

        try {
            const paymentData = {
                type: 'payment',
                amount: amount.toString(),
                recipient: HOUSE_ADDRESS,
                timestamp: Date.now(),
                sessionId: sessionId // Include session context
            };

            // Sign
            const signature = await walletClient.signMessage({ message: JSON.stringify(paymentData) });

            const payload = JSON.stringify({
                ...paymentData,
                signature,
                sender: address
            });

            wsRef.current?.send(payload);
            addLog(`💸 Sending Payment: ${amount.toString()} (Off-Chain)`);

        } catch (e: any) {
            addLog(`❌ Payment Failed: ${e.message}`);
        }
    };

    return {
        connect,
        createSession,
        sendPayment,
        status,
        sessionId,
        logs,
        addLog // Expose for manual logging if needed
    };
}
