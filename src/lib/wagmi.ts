import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arcTestnet } from './chains';
import { sepolia, mainnet } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'CrushETH',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    chains: [arcTestnet, sepolia, mainnet], // mainnet for ENS resolution
    ssr: true,
});
