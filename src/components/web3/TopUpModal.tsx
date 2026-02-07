"use client";

import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';

// const LiFiWidget = dynamic(
//   () => import('@lifi/widget').then((module) => module.LiFiWidget),
//   { ssr: false }
// );

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TopUpModal = ({ isOpen, onClose }: TopUpModalProps) => {
  const { address } = useAccount();

  if (!isOpen) return null;

  const widgetConfig: any = {
    integrator: 'CrushETH',
    containerStyle: {
      border: '1px solid var(--neon-blue)',
      borderRadius: '16px',
    },
    variant: 'expandable' as any,
    subvariant: 'default',
    hiddenUI: ['history', 'walletMenu'],
    toChain: 2026, // Arc Chain ID (mock)
    toToken: '0xUSDC_ADDRESS_ON_ARC',
    toAddress: address as any, 
    appearance: 'dark',
    theme: {
      palette: {
        primary: { main: '#00f3ff' },
        secondary: { main: '#ff00ff' },
        background: { paper: '#050510', default: '#050510' },
        text: { primary: '#ffffff', secondary: '#aaaaaa' },
      },
      shape: {
        borderRadius: 16,
        borderRadiusSecondary: 16,
      },
    },
  } as any;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[420px] bg-[var(--color-panel-bg)] rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)]">
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[var(--neon-pink)] text-white flex items-center justify-center font-bold shadow-lg hover:scale-110 transition-transform z-10"
        >
          ✕
        </button>
        <div className="overflow-hidden rounded-2xl p-6 text-center text-gray-400">
            {/* <LiFiWidget integrator="CrushETH" config={widgetConfig} /> */}
            <p className="font-mono text-sm">[LI.FI WIDGET LOADING...]</p>
            <p className="text-xs mt-2 text-gray-600">(Disabled for verified build)</p>
        </div>
      </div>
    </div>
  );
};
