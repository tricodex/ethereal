// Circle Gateway Contract Addresses and Configuration
// https://developers.circle.com/gateway

import { defineChain } from 'viem';
import {
    mainnet,
    sepolia,
    base,
    baseSepolia,
    polygon,
    arbitrum,
    optimism,
    avalanche,
    avalancheFuji,
} from 'viem/chains';

// Arc Testnet chain definition (matches viem/chains)
export const arcTestnet = defineChain({
    id: 5042002,
    name: 'Arc Testnet',
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://rpc.testnet.arc.network'],
            webSocket: ['wss://rpc.testnet.arc.network'],
        },
    },
    blockExplorers: {
        default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
    },
    testnet: true,
});

export type NetworkConfig = {
    RPC: string;
    GatewayWallet: `0x${string}`;
    GatewayMinter: `0x${string}`;
    USDCAddress: `0x${string}`;
    ViemChain: { id: number; name: string; [key: string]: any };
};

export type ChainConfig = {
    domain: number;
    name: string;
    mainnet?: NetworkConfig;
    testnet?: NetworkConfig;
};

// Gateway API endpoints
export const GATEWAY_CONFIG = {
    TESTNET_URL: 'https://gateway-api-testnet.circle.com/v1',
    MAINNET_URL: 'https://gateway-api.circle.com/v1',
} as const;

// Arc Testnet (Primary chain for CrushETH)
export const arcContracts: ChainConfig = {
    domain: 26,
    name: 'Arc',
    testnet: {
        RPC: 'https://rpc.testnet.arc.network',
        GatewayWallet: '0x0077777d7EBA4688BDeF3E311b846F25870A19B9',
        GatewayMinter: '0x0022222ABE238Cc2C7Bb1f21003F0a260052475B',
        USDCAddress: '0x3600000000000000000000000000000000000000',
        ViemChain: arcTestnet as any,
    },
};

// Ethereum
export const ethereumContracts: ChainConfig = {
    domain: 0,
    name: 'Ethereum',
    mainnet: {
        RPC: 'https://ethereum-rpc.publicnode.com',
        GatewayWallet: '0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE',
        GatewayMinter: '0x2222222d7164433c4C09B0b0D809a9b52C04C205',
        USDCAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        ViemChain: mainnet,
    },
    testnet: {
        RPC: 'https://ethereum-sepolia-rpc.publicnode.com',
        GatewayWallet: '0x0077777d7EBA4688BDeF3E311b846F25870A19B9',
        GatewayMinter: '0x0022222ABE238Cc2C7Bb1f21003F0a260052475B',
        USDCAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        ViemChain: sepolia,
    },
};

// Base
export const baseContracts: ChainConfig = {
    domain: 6,
    name: 'Base',
    mainnet: {
        RPC: 'https://base-rpc.publicnode.com',
        GatewayWallet: '0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE',
        GatewayMinter: '0x2222222d7164433c4C09B0b0D809a9b52C04C205',
        USDCAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        ViemChain: base,
    },
    testnet: {
        RPC: 'https://base-sepolia-rpc.publicnode.com',
        GatewayWallet: '0x0077777d7EBA4688BDeF3E311b846F25870A19B9',
        GatewayMinter: '0x0022222ABE238Cc2C7Bb1f21003F0a260052475B',
        USDCAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        ViemChain: baseSepolia,
    },
};

// Polygon
export const polygonContracts: ChainConfig = {
    domain: 7,
    name: 'Polygon',
    mainnet: {
        RPC: 'https://polygon-rpc.com',
        GatewayWallet: '0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE',
        GatewayMinter: '0x2222222d7164433c4C09B0b0D809a9b52C04C205',
        USDCAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        ViemChain: polygon,
    },
};

// Arbitrum
export const arbitrumContracts: ChainConfig = {
    domain: 3,
    name: 'Arbitrum',
    mainnet: {
        RPC: 'https://arbitrum-one-rpc.publicnode.com',
        GatewayWallet: '0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE',
        GatewayMinter: '0x2222222d7164433c4C09B0b0D809a9b52C04C205',
        USDCAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        ViemChain: arbitrum,
    },
};

// Optimism
export const optimismContracts: ChainConfig = {
    domain: 2,
    name: 'Optimism',
    mainnet: {
        RPC: 'https://optimism-rpc.publicnode.com',
        GatewayWallet: '0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE',
        GatewayMinter: '0x2222222d7164433c4C09B0b0D809a9b52C04C205',
        USDCAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        ViemChain: optimism,
    },
};

// Avalanche
export const avalancheContracts: ChainConfig = {
    domain: 1,
    name: 'Avalanche',
    mainnet: {
        RPC: 'https://avalanche-c-chain-rpc.publicnode.com',
        GatewayWallet: '0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE',
        GatewayMinter: '0x2222222d7164433c4C09B0b0D809a9b52C04C205',
        USDCAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
        ViemChain: avalanche,
    },
    testnet: {
        RPC: 'https://avalanche-fuji-c-chain-rpc.publicnode.com',
        GatewayWallet: '0x0077777d7EBA4688BDeF3E311b846F25870A19B9',
        GatewayMinter: '0x0022222ABE238Cc2C7Bb1f21003F0a260052475B',
        USDCAddress: '0x5425890298aed601595a70AB815c96711a31Bc65',
        ViemChain: avalancheFuji,
    },
};

// All supported chains for Gateway
export const SUPPORTED_CHAINS = [
    arcContracts,
    ethereumContracts,
    baseContracts,
    polygonContracts,
    arbitrumContracts,
    optimismContracts,
    avalancheContracts,
] as const;

// Get chain config by domain
export function getChainByDomain(domain: number): ChainConfig | undefined {
    return SUPPORTED_CHAINS.find(c => c.domain === domain);
}

// Get chain config by chain ID
export function getChainByChainId(chainId: number, network: 'mainnet' | 'testnet' = 'testnet'): ChainConfig | undefined {
    return SUPPORTED_CHAINS.find(c => {
        const config = c[network];
        return config && config.ViemChain.id === chainId;
    });
}
