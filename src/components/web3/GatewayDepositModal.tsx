"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, ArrowRight, Loader2, Wallet } from 'lucide-react';
import { useGateway } from '@/hooks/useGateway';
import { SUPPORTED_CHAINS, type ChainConfig } from '@/lib/gateway/contracts';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

interface GatewayDepositModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GatewayDepositModal({ isOpen, onClose }: GatewayDepositModalProps) {
    const { depositToGateway, isLoading, error, balances, transferToArc } = useGateway('testnet');
    const [amount, setAmount] = useState('10');
    const [step, setStep] = useState<'select' | 'deposit' | 'bridge'>('select');
    const [selectedChain, setSelectedChain] = useState<ChainConfig | null>(null);
    const { address } = useAccount();
    const chainId = useChainId();

    if (!isOpen) return null;

    const handleChainSelect = (chain: ChainConfig) => {
        setSelectedChain(chain);
        setStep('deposit');
    };

    const handleDeposit = async () => {
        if (!selectedChain) return;
        const success = await depositToGateway(amount, selectedChain);
        if (success) {
            setStep('bridge');
        }
    };

    const handleBridge = async () => {
        if (!selectedChain) return;
        // Bridge from Source -> Arc
        const success = await transferToArc(amount, selectedChain);
        if (success) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <Globe size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Circle Gateway</h2>
                                <p className="text-xs text-blue-300">Unity Liquidity Across Chains</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        {step === 'select' && (
                            <div className="space-y-4">
                                <p className="text-gray-400 text-sm">Select a source chain to drag liquidity from:</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {SUPPORTED_CHAINS.map((chain) => (
                                        <button
                                            key={chain.domain}
                                            onClick={() => handleChainSelect(chain)}
                                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group"
                                        >
                                            <span className="font-bold text-white group-hover:text-blue-200">{chain.name}</span>
                                            <ArrowRight size={16} className="text-gray-500 group-hover:text-blue-400" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 'deposit' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-blue-300">Source Chain</span>
                                        <span className="text-sm font-bold text-white">{selectedChain?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-blue-300">Target</span>
                                        <span className="text-sm font-bold text-white">Gateway Wallet</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Amount (USDC)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-blue-500"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">USDC</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleDeposit}
                                    disabled={isLoading}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Deposit to Gateway'}
                                </button>
                                
                                <button onClick={() => setStep('select')} className="w-full text-center text-gray-500 text-sm hover:text-white">
                                    Change Chain
                                </button>
                            </div>
                        )}

                        {step === 'bridge' && (
                            <div className="space-y-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                                    <Wallet size={32} className="text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Deposit Successful!</h3>
                                <p className="text-gray-400 text-sm">
                                    Funds are now in the Gateway Wallet. <br/>
                                    Bridge them to Arc to play?
                                </p>

                                <button
                                    onClick={handleBridge}
                                    disabled={isLoading}
                                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Bridge to Arc (L1) Now'}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
