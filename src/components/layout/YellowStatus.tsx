"use client";

import Link from "next/link";
import { useNitrolite } from "@/hooks/useNitrolite";
import { Zap } from "lucide-react";

export const YellowStatus = () => {
    const { isSessionActive, sessionId, stateVersion } = useNitrolite();

    if (isSessionActive && sessionId) {
        return (
            <Link href="/yellow-market" className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded-lg hover:bg-yellow-500/30 transition-all group animate-pulse">
                <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Zap size={12} className="text-black fill-black" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-yellow-500 font-black text-[10px] uppercase tracking-wider">SESSION ACTIVE</span>
                    <span className="text-yellow-300/80 text-[8px] font-mono">v{stateVersion} • {sessionId.slice(0, 6)}...</span>
                </div>
            </Link>
        );
    }

    return (
        <Link href="/yellow-market" className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/50 rounded-lg hover:bg-yellow-500/20 transition-all group">
            <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-black text-[10px] group-hover:scale-110 transition-transform">Y</div>
            <span className="text-yellow-500 font-bold text-xs tracking-wider">MARKET</span>
        </Link>
    );
};
