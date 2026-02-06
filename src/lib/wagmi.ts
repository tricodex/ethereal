import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arc } from './chains';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'CrushETH',
    projectId: 'YOUR_PROJECT_ID', // TODO: Get WalletConnect ID
    chains: [arc, sepolia],
    ssr: true, // If your dApp uses server side rendering (SSR)
});
