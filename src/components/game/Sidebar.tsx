"use client";

import { useGameStore } from "@/store/gameStore";
import { Trophy, Zap, Hexagon, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { EnsProfile } from "../web3/EnsProfile";

export const Sidebar = () => {
  const { score, levelConfig, collectedEth, nextLevel, currentLevelId } = useGameStore();

  const progress = levelConfig?.objectives?.[0] 
    ? (collectedEth / levelConfig.objectives[0].count) * 100 
    : 0;

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-80 h-[calc(100vh-100px)] sticky top-24 p-6 bg-black/40 backdrop-blur-xl border-r border-white/5 rounded-r-3xl">
      {/* Profile Section */}
      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-widest">Player Profile</p>
        <EnsProfile />
      </div>

      {/* Level Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-[var(--neon-yellow)] font-bold text-xl uppercase italic">Level {currentLevelId}</h3>
            <span className="text-xs font-mono text-gray-400">Target: {levelConfig?.targetScore}</span>
        </div>
        
        <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/70">
                <span>Objective: Collect ETH</span>
                <span>{collectedEth} / {levelConfig?.objectives?.[0]?.count || 0}</span>
            </div>
            <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div 
                    className="h-full bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-green)] transition-all duration-500"
                    style={{ width: `${Math.min(100, progress)}%` }}
                />
            </div>
        </div>
      </div>

      {/* Stats / Achievements Placeholder */}
      <div className="flex-1 space-y-4">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">Achievements</h4>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 opacity-50">
            <Trophy size={20} className="text-yellow-500" />
            <div className="flex-1">
                <p className="text-sm font-bold text-white">First Blood</p>
                <p className="text-[10px] text-gray-400">Win your first duel</p>
            </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 opacity-50">
            <Zap size={20} className="text-[var(--neon-blue)]" />
            <div className="flex-1">
                <p className="text-sm font-bold text-white">Combo King</p>
                <p className="text-[10px] text-gray-400">Hit a 5x Chain</p>
            </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-2">
         <Link href="/leaderboard" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
            <span className="font-bold text-white group-hover:text-[var(--neon-pink)] transition-colors">Leaderboard</span>
            <ArrowRight size={16} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
         </Link>
      </div>
    </aside>
  );
};
