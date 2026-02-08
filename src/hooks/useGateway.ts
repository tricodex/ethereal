"use client";

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useSignTypedData, useChainId } from 'wagmi';
import { parseUnits, formatUnits, erc20Abi, pad, maxUint256, zeroAddress, type Hex } from 'viem';
import {
    GATEWAY_CONFIG,
    SUPPORTED_CHAINS,
    arcContracts,
    type ChainConfig,
} from '@/lib/gateway/contracts';

// Gateway Wallet ABI (deposit function)
const gatewayWalletAbi = [
    {
        type: 'function',
        name: 'deposit',
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'value', type: 'uint256' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;

// Gateway Minter ABI (mint function)
const gatewayMinterAbi = [
    {
        type: 'function',
        name: 'gatewayMint',
        inputs: [
            { name: 'attestationPayload', type: 'bytes' },
            { name: 'signature', type: 'bytes' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;

// EIP-712 Types for burn intent
const eip712Types = {
    TransferSpec: [
        { name: 'version', type: 'uint32' },
        { name: 'sourceDomain', type: 'uint32' },
        { name: 'destinationDomain', type: 'uint32' },
        { name: 'sourceContract', type: 'bytes32' },
        { name: 'destinationContract', type: 'bytes32' },
        { name: 'sourceToken', type: 'bytes32' },
        { name: 'destinationToken', type: 'bytes32' },
        { name: 'sourceDepositor', type: 'bytes32' },
        { name: 'destinationRecipient', type: 'bytes32' },
        { name: 'sourceSigner', type: 'bytes32' },
        { name: 'destinationCaller', type: 'bytes32' },
        { name: 'value', type: 'uint256' },
        { name: 'salt', type: 'bytes32' },
        { name: 'hookData', type: 'bytes' },
    ],
    BurnIntent: [
        { name: 'maxBlockHeight', type: 'uint256' },
        { name: 'maxFee', type: 'uint256' },
        { name: 'spec', type: 'TransferSpec' },
    ],
};

const eip712Domain = {
    name: 'GatewayWallet',
    version: '1',
};

interface GatewayBalance {
    domain: number;
    chainName: string;
    balance: string;
    depositor: string;
}

interface UseGatewayReturn {
    // State
    isLoading: boolean;
    error: string | null;
    balances: GatewayBalance[];
    totalBalance: string;

    // Actions
    fetchBalances: () => Promise<void>;
    depositToGateway: (amount: string, chainConfig?: ChainConfig) => Promise<boolean>;
    transferToArc: (amount: string, sourceChainConfig: ChainConfig) => Promise<boolean>;
    withdrawFromGateway: (amount: string) => Promise<boolean>;
}

function randomHex32(): Hex {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return ('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')) as Hex;
}

function addressToBytes32(address: Hex): Hex {
    return pad(address.toLowerCase() as Hex, { size: 32 });
}

/**
 * Hook for Circle Gateway cross-chain USDC operations
 *
 * Enables:
 * - Unified USDC balance across all supported chains
 * - Deposit USDC from any chain to Gateway
 * - Transfer USDC to Arc for gameplay
 * - Near-instant cross-chain settlements
 */
export function useGateway(network: 'mainnet' | 'testnet' = 'testnet'): UseGatewayReturn {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChainAsync } = useSwitchChain();
    const { signTypedDataAsync } = useSignTypedData();
    const { writeContractAsync } = useWriteContract();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [balances, setBalances] = useState<GatewayBalance[]>([]);

    // Calculate total balance
    const totalBalance = balances.reduce((sum, b) => {
        return (parseFloat(sum) + parseFloat(b.balance)).toFixed(6);
    }, '0');

    // Fetch balances from RPCs directly (API replacement)
    const fetchBalances = useCallback(async () => {
        if (!address) return;

        setIsLoading(true);
        setError(null);

        try {
            const newBalances: GatewayBalance[] = [];
            const networks = network === 'mainnet' ? 'mainnet' : 'testnet';

            // Iterate all supported chains and fetch USDC balance
            await Promise.all(SUPPORTED_CHAINS.map(async (chainConfig) => {
                const config = chainConfig[networks];
                if (!config) return;

                try {
                    // Create temporary client for read
                    const { createPublicClient, http } = await import('viem');
                    const client = createPublicClient({
                        chain: config.ViemChain,
                        transport: http()
                    });

                    const balance = await client.readContract({
                        address: config.USDCAddress,
                        abi: erc20Abi,
                        functionName: 'balanceOf',
                        args: [address]
                    });

                    if (balance > 0n) {
                        newBalances.push({
                            domain: chainConfig.domain,
                            chainName: chainConfig.name,
                            balance: formatUnits(balance, 6), // USDC is 6 decimals
                            depositor: address
                        });
                    }
                } catch (e) {
                    // Ignore chain errors (rpc down etc)
                    console.warn(`Failed to fetch balance for ${chainConfig.name}`, e);
                }
            }));

            setBalances(newBalances);
        } catch (err) {
            console.error('Failed to fetch Gateway balances:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch balances');
        } finally {
            setIsLoading(false);
        }
    }, [address, network]);

    // Deposit USDC to Gateway from current chain
    const depositToGateway = useCallback(async (amount: string, chainConfig?: ChainConfig): Promise<boolean> => {
        if (!address) {
            setError('Wallet not connected');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Default to Arc if no chain specified
            const config = chainConfig || arcContracts;
            const networkConfig = config[network];

            if (!networkConfig) {
                throw new Error(`${config.name} not available on ${network}`);
            }

            // Switch chain if needed
            if (chainId !== networkConfig.ViemChain.id) {
                await switchChainAsync({ chainId: networkConfig.ViemChain.id });
            }

            const amountBaseUnits = parseUnits(amount, 6);

            // Step 1: Approve USDC spending
            await writeContractAsync({
                address: networkConfig.USDCAddress,
                abi: erc20Abi,
                functionName: 'approve',
                args: [networkConfig.GatewayWallet, amountBaseUnits],
            });

            // Step 2: Deposit to Gateway Wallet
            await writeContractAsync({
                address: networkConfig.GatewayWallet,
                abi: gatewayWalletAbi,
                functionName: 'deposit',
                args: [networkConfig.USDCAddress, amountBaseUnits],
            });

            // Refresh balances
            await fetchBalances();

            return true;
        } catch (err) {
            console.error('Deposit failed:', err);
            setError(err instanceof Error ? err.message : 'Deposit failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [address, chainId, network, switchChainAsync, writeContractAsync, fetchBalances]);

    // Transfer USDC from any chain to Arc via Gateway
    const transferToArc = useCallback(async (amount: string, sourceChainConfig: ChainConfig): Promise<boolean> => {
        if (!address) {
            setError('Wallet not connected');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const sourceConfig = sourceChainConfig[network];
            const destConfig = arcContracts[network];

            if (!sourceConfig || !destConfig) {
                throw new Error('Chain configuration not available');
            }

            const transferAmount = parseUnits(amount, 6);

            // Build burn intent
            const burnIntent = {
                maxBlockHeight: maxUint256,
                maxFee: BigInt(2010000), // 2.01 USDC max fee
                spec: {
                    version: 1,
                    sourceDomain: sourceChainConfig.domain,
                    destinationDomain: arcContracts.domain,
                    sourceContract: sourceConfig.GatewayWallet,
                    destinationContract: destConfig.GatewayMinter,
                    sourceToken: sourceConfig.USDCAddress,
                    destinationToken: destConfig.USDCAddress,
                    sourceDepositor: address,
                    destinationRecipient: address,
                    sourceSigner: address,
                    destinationCaller: zeroAddress,
                    value: transferAmount,
                    salt: randomHex32(),
                    hookData: '0x' as Hex,
                },
            };

            // Format for EIP-712 signing
            const messageForSigning = {
                maxBlockHeight: burnIntent.maxBlockHeight.toString(),
                maxFee: burnIntent.maxFee.toString(),
                spec: {
                    version: burnIntent.spec.version,
                    sourceDomain: burnIntent.spec.sourceDomain,
                    destinationDomain: burnIntent.spec.destinationDomain,
                    sourceContract: addressToBytes32(burnIntent.spec.sourceContract),
                    destinationContract: addressToBytes32(burnIntent.spec.destinationContract),
                    sourceToken: addressToBytes32(burnIntent.spec.sourceToken),
                    destinationToken: addressToBytes32(burnIntent.spec.destinationToken),
                    sourceDepositor: addressToBytes32(burnIntent.spec.sourceDepositor as Hex),
                    destinationRecipient: addressToBytes32(burnIntent.spec.destinationRecipient as Hex),
                    sourceSigner: addressToBytes32(burnIntent.spec.sourceSigner as Hex),
                    destinationCaller: addressToBytes32(burnIntent.spec.destinationCaller as Hex),
                    value: burnIntent.spec.value.toString(),
                    salt: burnIntent.spec.salt,
                    hookData: burnIntent.spec.hookData,
                },
            };

            // Sign the burn intent
            const signature = await signTypedDataAsync({
                types: eip712Types,
                domain: eip712Domain,
                primaryType: 'BurnIntent',
                message: messageForSigning,
            });

            // Submit to Gateway API
            const gatewayUrl = network === 'mainnet'
                ? GATEWAY_CONFIG.MAINNET_URL
                : GATEWAY_CONFIG.TESTNET_URL;

            const response = await fetch(`${gatewayUrl}/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([{ burnIntent: messageForSigning, signature }]),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gateway API error: ${errorText}`);
            }

            const { attestation, signature: apiSignature } = await response.json();

            // Switch to Arc for minting
            if (chainId !== destConfig.ViemChain.id) {
                await switchChainAsync({ chainId: destConfig.ViemChain.id });
            }

            // Mint on Arc
            await writeContractAsync({
                address: destConfig.GatewayMinter,
                abi: gatewayMinterAbi,
                functionName: 'gatewayMint',
                args: [attestation, apiSignature],
            });

            // Refresh balances
            await fetchBalances();

            return true;
        } catch (err) {
            console.error('Transfer failed:', err);
            setError(err instanceof Error ? err.message : 'Transfer failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [address, chainId, network, switchChainAsync, signTypedDataAsync, writeContractAsync, fetchBalances]);

    // Withdraw from Gateway to wallet
    const withdrawFromGateway = useCallback(async (amount: string): Promise<boolean> => {
        // Implementation would involve closing the Gateway position
        // For hackathon, keeping funds in Gateway for gameplay
        setError('Withdrawal not implemented - use in-game balance');
        return false;
    }, []);

    // Fetch balances on mount and when address changes
    useEffect(() => {
        if (isConnected && address) {
            fetchBalances();
        }
    }, [isConnected, address, fetchBalances]);

    return {
        isLoading,
        error,
        balances,
        totalBalance,
        fetchBalances,
        depositToGateway,
        transferToArc,
        withdrawFromGateway,
    };
}
