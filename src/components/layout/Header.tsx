"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { EnsProfile } from "@/components/web3/EnsProfile";
import { TopUpModal } from "@/components/web3/TopUpModal";
import { YellowStatus } from "@/components/layout/YellowStatus";
import { PlusCircle, Unlock, Lock } from "lucide-react";

import { useGameStore } from "@/store/gameStore";
import { QuestModal } from "@/components/game/QuestModal";
import { GatewayDepositModal } from "@/components/web3/GatewayDepositModal";

export const Header = () => {
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [isGatewayOpen, setIsGatewayOpen] = useState(false);
    const [isQuestOpen, setIsQuestOpen] = useState(false);
    const { debugUnlockAll, setDebugUnlockAll, debugFreeStore, setDebugFreeStore } = useGameStore();

    return (
        <>
            <header className="w-full flex items-center justify-between px-8 py-4 backdrop-blur-md bg-black/20 border-b border-white/10 sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-pink)] rounded-lg blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                    <img 
                        src={`logo.png`} 
                        alt="Avatar" 
                        className="w-full h-full object-contain relative z-10 drop-shadow-md transition-transform group-hover:scale-110"
                        onError={(e) => {
                            // Fallback to generic if image fails (though it shouldn't if assets exist)
                            (e.target as HTMLImageElement).src = '/assets/CoreGems/shiny/7.png'; 
                        }}
                    />
                </div>
                <span className="text-sm md:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-pink)] drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">
                    ETHEREAL
                </span>

            </Link>
                
                <div className="flex items-center gap-4 xl:gap-6">
                    <nav className="hidden xl:flex gap-6 font-mono text-sm text-[var(--neon-green)] items-center">
                    <Link href="/" className="hover:text-white transition-colors">PLAY</Link>
                    <Link href="/rewards" className="hover:text-white transition-colors text-[var(--neon-pink)] animate-pulse font-bold">REWARDS</Link>
                    <button onClick={() => setIsQuestOpen(true)} className="hover:text-white transition-colors">QUESTS</button>
                    <Link href="/leaderboard" className="hover:text-white transition-colors">LEADERBOARD</Link>
                    
                    {/* Yellow Network Integration */}
                    <YellowStatus />
                    </nav>

                    <button
                        onClick={() => setDebugFreeStore(!debugFreeStore)}
                        className={`hidden md:flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold uppercase rounded-full border transition-all ${
                            debugFreeStore 
                            ? "bg-green-500/20 border-green-500 text-green-500 hover:bg-green-500/30" 
                            : "bg-gray-800/50 border-gray-700 text-gray-500 hover:text-gray-300"
                        }`}
                        title="Toggle Free Store Mode"
                    >
                        <Lock size={14} />
                        {debugFreeStore ? "FREE" : "PAID"}
                    </button>

                    <button
                        onClick={() => setDebugUnlockAll(!debugUnlockAll)}
                        className={`hidden md:flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold uppercase rounded-full border transition-all ${
                            debugUnlockAll 
                            ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30" 
                            : "bg-gray-800/50 border-gray-700 text-gray-500 hover:text-gray-300"
                        }`}
                        title="Toggle Unlock All Levels"
                    >
                        {debugUnlockAll ? <Unlock size={14} /> : <Lock size={14} />}
                        {debugUnlockAll ? "UNLOCKED" : "LOCKED"}
                    </button>
                    
                    <button
                        onClick={() => setIsTopUpOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--neon-blue)]/10 text-[var(--neon-blue)] border border-[var(--neon-blue)] rounded-full hover:bg-[var(--neon-blue)] hover:text-black transition-all font-mono text-xs font-bold uppercase tracking-wider group"
                    >
                        <PlusCircle size={16} className="group-hover:rotate-90 transition-transform" />
                        <span className="hidden sm:inline">Add Funds</span>
                    </button>

                    <div className="hidden lg:block">
                        <EnsProfile />
                    </div>

                    <ConnectButton 
                        showBalance={false}
                        accountStatus={{
                            smallScreen: 'avatar',
                            largeScreen: 'avatar',
                        }}
                        chainStatus="icon"
                    />
                </div>
            </header>

            <TopUpModal 
                isOpen={isTopUpOpen} 
                onClose={() => setIsTopUpOpen(false)} 
                onOpenGateway={() => {
                    setIsTopUpOpen(false); // Close TopUp
                    setIsGatewayOpen(true); // Open Gateway
                }}
            />
            <GatewayDepositModal isOpen={isGatewayOpen} onClose={() => setIsGatewayOpen(false)} />
            <QuestModal isOpen={isQuestOpen} onClose={() => setIsQuestOpen(false)} />
        </>
    );
};
