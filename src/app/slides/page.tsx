"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Zap, Globe, Wallet, ExternalLink, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Slide Data Structure
const SLIDES = [
    {
        id: "intro",
        bg: "from-blue-900 to-black",
        content: (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 p-12">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative flex items-center justify-center gap-8"
                >
                    <div className="relative w-32 h-32">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-40 rounded-full" />
                        <Image 
                            src="/logo.png" 
                            alt="Ethereal Logo" 
                            fill
                            className="object-contain relative z-10 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full" />
                        <h1 className="text-8xl font-black text-white relative z-10 drop-shadow-[0_0_15px_rgba(0,0,0,1)]">
                            ETHEREAL
                        </h1>
                    </div>
                </motion.div>
                <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-gray-300 max-w-2xl"
                >
                    Onboarding <span className="text-[var(--neon-pink)]">Grandma</span> to Web3
                </motion.h2>
                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl text-gray-400 max-w-3xl"
                >
                    A hyper-casual Match-3 game powered by invisible blockchain infrastructure.
                    <br />
                    <span className="text-sm opacity-50 mt-4 block">Use Arrow Keys to Navigate</span>
                </motion.p>
            </div>
        )
    },
    {
        id: "problem",
        bg: "from-red-900/50 to-black",
        content: (
            <div className="flex flex-col h-full justify-center p-20 space-y-12">
                <div className="space-y-4">
                    <h3 className="text-[var(--neon-pink)] text-xl font-mono font-bold uppercase tracking-widest">The Problem</h3>
                    <h2 className="text-5xl font-bold text-white leading-tight">Crypto is Scarier than Candy</h2>
                </div>
                <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <h4 className="text-2xl font-bold text-red-400 mb-2">The "Grandma" Test</h4>
                            <p className="text-gray-300 text-lg">
                                If we want mass adoption, we can't ask users to "switch chains" or "approve allowances" just to play a game.
                            </p>
                        </div>
                        <ul className="space-y-4 text-xl text-gray-400">
                            <li className="flex items-center gap-4">
                                <span className="text-red-500 font-bold">❌</span> Wallets are confusing
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="text-red-500 font-bold">❌</span> Gas fees kill casual fun
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="text-red-500 font-bold">❌</span> '0x123...' is not a username
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "yellow",
        bg: "from-yellow-900/40 to-black",
        content: (
            <div className="flex flex-col h-full justify-center p-20 space-y-12">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center">
                        <span className="text-black font-black text-3xl">Y</span>
                    </div>
                    <div>
                        <h3 className="text-yellow-500 text-xl font-mono font-bold uppercase tracking-widest">The Speed Layer</h3>
                        <h2 className="text-5xl font-bold text-white">Yellow Network</h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <p className="text-2xl text-gray-300 leading-relaxed">
                            We use <span className="text-yellow-400 font-bold">State Channels</span> to let users play 100s of moves without a single transaction.
                        </p>
                        <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl space-y-4">
                            <div className="flex items-center gap-4">
                                <Zap className="text-yellow-500 w-8 h-8" />
                                <span className="text-xl font-bold text-white">Gasless Gameplay</span>
                            </div>
                            <p className="text-gray-400">Lock funds once. Play forever. Settle only when you leave.</p>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-500/50 text-sm font-mono">
                            <span>INTEGRATION:</span>
                            <span className="bg-yellow-500/10 px-2 py-1 rounded">Yellow SDK (Nitrolite)</span>
                            <span className="bg-yellow-500/10 px-2 py-1 rounded">useNitrolite.ts (Live)</span>
                        </div>
                    </div>
                    <div className="relative border border-yellow-500/10 bg-black/50 rounded-3xl p-8 flex flex-col items-center justify-center">
                        <div className="text-center space-y-4">
                            <h4 className="text-gray-500 uppercase tracking-widest text-sm">Example Economy</h4>
                            <div className="text-6xl font-black text-white">$0.00</div>
                            <div className="text-yellow-500 font-mono">GAS FEES PER MOVE</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "arc",
        bg: "from-[#00f3ff]/10 to-black",
        content: (
            <div className="flex flex-col h-full justify-center p-20 space-y-12">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#00f3ff] rounded-full flex items-center justify-center">
                        <Globe className="text-black w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-[#00f3ff] text-xl font-mono font-bold uppercase tracking-widest">The Economic OS</h3>
                        <h2 className="text-5xl font-bold text-white">Base Sepolia & Circle</h2>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    <div className="p-8 bg-[#00f3ff]/5 border border-[#00f3ff]/20 rounded-3xl space-y-4">
                        <Wallet className="w-10 h-10 text-[#00f3ff]" />
                        <h4 className="text-xl font-bold text-white">USDC Liquidity Hub</h4>
                        <p className="text-gray-400">
                            The game acts as a liquidity sink, accepting USDC from any chain via <span className="text-[#00f3ff]">Circle Gateway</span>.
                        </p>
                    </div>
                    <div className="p-8 bg-[#00f3ff]/5 border border-[#00f3ff]/20 rounded-3xl space-y-4">
                        <ExternalLink className="w-10 h-10 text-[#00f3ff]" />
                        <h4 className="text-xl font-bold text-white">Cross-Chain Payments</h4>
                        <p className="text-gray-400">
                            Users on Arbitrum, Optimism, or Sepolia can deposit instantly to Base Sepolia using our <span className="font-mono text-sm bg-white/10 px-1 rounded">GatewayDepositModal</span>.
                        </p>
                    </div>
                    <div className="p-8 bg-[#00f3ff]/5 border border-[#00f3ff]/20 rounded-3xl space-y-4">
                        <h4 className="text-xl font-bold text-white">Base Sepolia</h4>
                        <p className="text-gray-400">
                            Deployed <span className="font-mono text-sm bg-white/10 px-1 rounded">GameEscrow.sol</span> on Base Sepolia to leverage its low-cost infrastructure.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "ens",
        bg: "from-indigo-900/40 to-black",
        content: (
            <div className="flex flex-col h-full justify-center p-20 space-y-12">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                        <span className="text-white font-black text-2xl">ENS</span>
                    </div>
                    <div>
                        <h3 className="text-indigo-400 text-xl font-mono font-bold uppercase tracking-widest">The Identity Layer</h3>
                        <h2 className="text-5xl font-bold text-white">Ethereum Name Service</h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <p className="text-2xl text-gray-300 leading-relaxed">
                            No one knows who <span className="font-mono text-gray-500">0x71C...9A</span> is.
                            <br/>
                            Everyone knows <span className="text-indigo-400 font-bold">grandma.eth</span>.
                        </p>
                        <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-xl">👵</div>
                            <div>
                                <div className="text-white font-bold text-lg">grandma.eth</div>
                                <div className="text-indigo-300/50 text-sm">0x1234...5678</div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-sm">Integration Highlights</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-green-400">✓</span>
                                <span className="text-gray-300">Name Resolution (Primary Name)</span>
                            </li>
                            <li className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-green-400">✓</span>
                                <span className="text-gray-300">Avatar Resolution (Metadata)</span>
                            </li>
                            <li className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-green-400">✓</span>
                                <span className="text-gray-300">Social Profile Integration</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "demo",
        bg: "from-green-900/30 to-black",
        content: (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-12">
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <h2 className="text-6xl font-black text-white">READY TO PLAY?</h2>
                </motion.div>
                <div className="flex gap-8">
                    <Link href="/" className="px-8 py-4 bg-[var(--neon-green)] text-black font-black text-xl rounded-2xl hover:scale-105 transition-transform">
                        LAUNCH DEMO
                    </Link>
                    <Link href="/yellow-market" className="px-8 py-4 bg-yellow-500 text-black font-black text-xl rounded-2xl hover:scale-105 transition-transform">
                        YELLOW MARKET
                    </Link>
                </div>
            </div>
        )
    }
];

export default function SlidesPage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                setCurrentSlide(prev => Math.min(prev + 1, SLIDES.length - 1));
            } else if (e.key === "ArrowLeft") {
                setCurrentSlide(prev => Math.max(prev - 1, 0));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const slide = SLIDES[currentSlide];

    return (
        <div className={`h-screen w-full relative overflow-hidden bg-black`}>
            {/* Background Gradient */}
            <motion.div 
                key={slide.bg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className={`absolute inset-0 bg-gradient-to-br ${slide.bg}`}
            />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

            {/* Content AnimatePresence */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 z-10"
                >
                    {slide.content}
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
                <button 
                    onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
                    disabled={currentSlide === 0}
                    className="p-3 bg-white/10 rounded-full hover:bg-white/20 disabled:opacity-30 transition-all text-white"
                >
                    <ArrowLeft />
                </button>
                <span className="text-gray-500 font-mono">
                    {currentSlide + 1} / {SLIDES.length}
                </span>
                <button 
                    onClick={() => setCurrentSlide(prev => Math.min(prev + 1, SLIDES.length - 1))}
                    disabled={currentSlide === SLIDES.length - 1}
                    className="p-3 bg-white/10 rounded-full hover:bg-white/20 disabled:opacity-30 transition-all text-white"
                >
                    <ArrowRight />
                </button>
            </div>

            {/* Branding - Top Left */}
            <div className="absolute top-8 left-8 z-20">
                <Link href="/" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                    <div className="font-black text-white tracking-widest">ETHEREAL</div>
                </Link>
            </div>
        </div>
    );
}
