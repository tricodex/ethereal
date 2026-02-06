"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { EnsProfile } from "@/components/web3/EnsProfile";
import { TopUpModal } from "@/components/web3/TopUpModal";
import { PlusCircle } from "lucide-react";

export const Header = () => {
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);

    return (
        <>
            <header className="w-full flex items-center justify-between px-8 py-4 backdrop-blur-md bg-black/20 border-b border-white/10 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-pink)] transform rotate-45" />
                    <span className="text-xl font-bold font-mono tracking-widest text-[#fff]">
                        CRUSH<span className="text-[var(--neon-blue)]">ETH</span>
                    </span>
                </Link>
                
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex gap-6 font-mono text-sm text-[var(--neon-green)]">
                    <Link href="/play" className="hover:text-white transition-colors">PLAY</Link>
                    <Link href="/duel" className="hover:text-white transition-colors">DUEL</Link>
                    <Link href="/leaderboard" className="hover:text-white transition-colors">LEADERBOARD</Link>
                    </nav>
                    
                    <button
                        onClick={() => setIsTopUpOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--neon-blue)]/10 text-[var(--neon-blue)] border border-[var(--neon-blue)] rounded-full hover:bg-[var(--neon-blue)] hover:text-black transition-all font-mono text-xs font-bold uppercase tracking-wider"
                    >
                        <PlusCircle size={16} />
                        Add Funds
                    </button>

                    <div className="hidden md:block">
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

            <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
        </>
    );
};
