"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export const Header = () => {
    return (
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
                
                <ConnectButton 
                    showBalance={true}
                    accountStatus={{
                        smallScreen: 'avatar',
                        largeScreen: 'full',
                    }}
                />
            </div>
        </header>
    );
};
