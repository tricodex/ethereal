import { Chain } from '@rainbow-me/rainbowkit';

// Arc Testnet - Circle's purpose-built L1 blockchain
// Uses USDC as native gas token
export const arcTestnet = {
    id: 5042002,
    name: 'Arc Testnet',
    iconUrl: 'https://testnet.arcscan.app/images/logo.svg',
    iconBackground: '#0052FF',
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
} as const satisfies Chain;

// Contract addresses on Arc Testnet
export const ARC_CONTRACTS = {
    USDC: '0x3600000000000000000000000000000000000000' as const,
    // Circle Gateway contracts
    GatewayWallet: '0x0077777d7EBA4688BDeF3E311b846F25870A19B9' as const,
    GatewayMinter: '0x0022222ABE238Cc2C7Bb1f21003F0a260052475B' as const,
};

// Gateway domain ID for Arc
export const ARC_GATEWAY_DOMAIN = 26;
