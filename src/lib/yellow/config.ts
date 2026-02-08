// Yellow Network / Nitrolite Configuration
// https://github.com/erc7824/nitrolite

import { baseSepolia } from 'viem/chains';
import type { Address, Chain } from 'viem';

// Yellow Network WebSocket endpoints
export const YELLOW_ENDPOINTS = {
    MAINNET: 'wss://clearnet.yellow.com/ws',
    SANDBOX: 'wss://clearnet-sandbox.yellow.com/ws',
} as const;

// Yellow Network contract addresses per chain
export interface YellowContracts {
    chainId: number;
    chain: Chain;
    custody: Address;
    adjudicator: Address;
    // USDC address on this chain
    usdc: Address;
}

// Base Sepolia - Primary settlement layer for Yellow Network
export const BASE_SEPOLIA_YELLOW: YellowContracts = {
    chainId: 84532,
    chain: baseSepolia,
    custody: '0x019B65A265EB3363822f2752141b3dF16131b262',
    adjudicator: '0x7c7ccbc98469190849BCC6c926307794fDfB11F2',
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
};

// Default Yellow config for the app
export const YELLOW_CONFIG = {
    // Network mode
    network: 'sandbox' as const,

    // WebSocket URL
    wsUrl: process.env.NEXT_PUBLIC_YELLOW_WS_URL || YELLOW_ENDPOINTS.SANDBOX,

    // Game house address (receives payments)
    houseAddress: (process.env.NEXT_PUBLIC_YELLOW_HOUSE_ADDRESS ||
        '0x0996c2e70E4Eb633A95258D2699Cb965368A3CB6') as Address,

    // Application identifier
    application: 'crush-eth-game',

    // Settlement chain (Base Sepolia)
    settlement: BASE_SEPOLIA_YELLOW,

    // Default allowance (10 USDC in base units)
    defaultAllowance: '10000000',

    // Session expiry (24 hours in seconds)
    sessionExpiry: 86400,
};

// Supported chains for Yellow Network on-chain operations
export const YELLOW_SUPPORTED_CHAINS = [
    BASE_SEPOLIA_YELLOW,
] as const;

// Get Yellow contracts by chain ID
export function getYellowContractsByChainId(chainId: number): YellowContracts | undefined {
    return YELLOW_SUPPORTED_CHAINS.find(c => c.chainId === chainId);
}
