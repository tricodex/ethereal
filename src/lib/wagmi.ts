import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arcTestnet } from './chains';
import { sepolia, baseSepolia, mainnet } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'CrushETH',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    chains: [
        baseSepolia,  // Primary: Yellow Network settlement
        arcTestnet,   // Gateway cross-chain USDC
        sepolia,      // Ethereum testnet
        mainnet,      // ENS resolution
    ],
    ssr: true,
});
