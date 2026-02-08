"use client";

import { useAccount } from 'wagmi';
import { PlusCircle } from 'lucide-react';
import { useGameStore } from "@/store/gameStore";

// const LiFiWidget = dynamic(
//   () => import('@lifi/widget').then((module) => module.LiFiWidget),
//   { ssr: false }
// );

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGateway?: () => void;
}

import { useState } from 'react';
import { useEscrow } from '@/hooks/useEscrow';

export const TopUpModal = ({ isOpen, onClose, onOpenGateway }: TopUpModalProps) => {
  const { address } = useAccount();
  const { deposit } = useEscrow();
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
      try {
          setIsLoading(true);
          setError(null);
          
          // 1000 Gold = 0.01 USDC
          const usdcAmount = (selectedAmount / 100000).toFixed(6); // 0.01
          
          await deposit(usdcAmount);
          
          // Optimistic update for UX (or listen for event)
          useGameStore.getState().addGold(selectedAmount); 
          onClose();
      } catch (err) {
          console.error("Deposit failed:", err);
          setError("Transaction failed. Please try again.");
      } finally {
          setIsLoading(false);
      }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-[480px] bg-gray-950 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="text-[var(--neon-blue)]" /> 
                Add Game Funds
            </h2>
            <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
                ✕
            </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            
            {/* Payment Method Selector */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Network</label>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center gap-3 p-3 rounded-xl border border-[var(--neon-blue)] bg-[var(--neon-blue)]/10 transition-all">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <span className="text-black font-black text-xs">ARC</span>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-white">Arc Chain</p>
                            <p className="text-[10px] text-[var(--neon-blue)]">Zero Gas • Instant</p>
                        </div>
                    </button>
                    <button 
                        onClick={onOpenGateway}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center border border-blue-500/30">
                            <span className="text-blue-200 font-bold text-[10px]">ANY</span>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-gray-300 group-hover:text-white">Cross-Chain</p>
                            <p className="text-[10px] text-blue-400">Via Circle Gateway</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Amount Selector */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Amount (Testnet Friendly)</label>
                <div className="grid grid-cols-3 gap-3">
                    {[1000, 2500, 5000].map(amount => {
                        const usdcCost = (amount / 100000).toFixed(2); // 1000 Gold = 0.01 USDC
                        return (
                            <button 
                                key={amount}
                                onClick={() => setSelectedAmount(amount)}
                                className={`bg-white/5 hover:bg-[var(--neon-green)]/10 border p-4 rounded-xl flex flex-col items-center gap-1 transition-all group ${
                                    selectedAmount === amount 
                                    ? "border-[var(--neon-green)] bg-[var(--neon-green)]/10" 
                                    : "border-white/10 hover:border-[var(--neon-green)]"
                                }`}
                            >
                                <span className="text-2xl font-black text-white group-hover:text-[var(--neon-green)]">{amount}</span>
                                <span className="text-[10px] text-gray-500 uppercase font-bold text-[var(--neon-green)]">GOLD CREDITS</span>
                                <span className="text-xs text-gray-400 mt-1 group-hover:text-white">${usdcCost} USDC</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Yellow Network Promo */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-bold text-lg shrink-0">
                    Y
                </div>
                <div>
                    <h4 className="text-yellow-500 font-bold text-sm">Yellow Network Enabled</h4>
                    <p className="text-xs text-gray-400">Transactions are settled instantly off-chain.</p>
                </div>
            </div>

            {error && (
                <div className="text-red-500 text-xs text-center font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    {error}
                </div>
            )}

            <button 
                onClick={handleDeposit}
                disabled={isLoading || !selectedAmount}
                className="w-full py-4 bg-[var(--neon-blue)] hover:bg-white text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <span className="animate-spin text-xl">⟳</span> Processing On-Chain...
                    </>
                ) : (
                    `Confirm Purchase ($${(selectedAmount / 100000).toFixed(2)} USDC)`
                )}
            </button>

            <p className="text-center text-[10px] text-gray-600">
                Powered by Circle Programmable Wallets & Yellow Network Nitrolite
            </p>
        </div>
      </div>
    </div>
  );
};
