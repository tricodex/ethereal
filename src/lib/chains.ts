import { Chain } from '@rainbow-me/rainbowkit';

export const arc = {
    id: 2026, // Placeholder ID
    name: 'Arc',
    iconUrl: 'https://arc.network/logo.png', // Placeholder
    iconBackground: '#fff',
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.arc.network'] }, // Placeholder
    },
    blockExplorers: {
        default: { name: 'ArcExplorer', url: 'https://explorer.arc.network' },
    },
} as const satisfies Chain;
