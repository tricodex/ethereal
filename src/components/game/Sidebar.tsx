"use client";

import { useGameStore } from "@/store/gameStore";
import { Trophy, Gift, Scroll, ArrowRight, User, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useAccount, useEnsName, useEnsAvatar } from "wagmi";
import { mainnet } from "wagmi/chains";

export const Sidebar = () => {
  const { currentLevelId, playerAvatar, dailyQuests } = useGameStore();
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: mainnet.id });

  // Get first 2 active quests
  const activeQuests = dailyQuests.filter(q => !q.completed).slice(0, 2);

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-full max-w-[300px] h-[calc(100vh-120px)] p-5 bg-black/40 backdrop-blur-xl border-l border-white/5 rounded-l-none rounded-3xl border border-white/10 shadow-2xl overflow-y-auto custom-scrollbar">
      
      {/* Profile Card */}
      <div className="p-4 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 flex items-center gap-4 shadow-lg">
        <div className="relative w-12 h-12 shrink-0">
            <div className="absolute inset-0 bg-[var(--neon-green)] rounded-full blur-md opacity-20" />
            <img 
                src={ensAvatar || `/assets/SpecialGems/${playerAvatar}.png`} 
                alt="Profile" 
                className="w-full h-full object-contain relative z-10 rounded-full"
                onError={(e) => (e.target as HTMLImageElement).src = '/assets/CoreGems/shiny/7.png'}
            />
            {/* Online Indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full z-20" />
        </div>
        <div className="flex-1 min-w-0">
             <p className="text-[10px] text-[var(--neon-green)] font-bold uppercase tracking-widest mb-0.5">
                {ensName ? 'ENS VERIFIED' : 'OPERATOR'}
             </p>
             <h3 className="text-white font-bold truncate text-sm" title={address}>
                {ensName || (address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "Guest")}
             </h3>
             {address && !ensName && (
                 <p className="text-[10px] text-gray-600">No ENS Name</p>
             )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 gap-3">
         <Link href="/rewards" className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group">
            <ShoppingBag className="text-[var(--neon-pink)] mb-1 group-hover:scale-110 transition-transform" size={20} />
            <span className="text-xs font-bold text-gray-300">Shop</span>
         </Link>
         <Link href="/leaderboard" className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group">
            <Trophy className="text-yellow-500 mb-1 group-hover:scale-110 transition-transform" size={20} />
            <span className="text-xs font-bold text-gray-300">Rank</span>
         </Link>
         <Link href="/achievements" className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group col-span-2">
            <Trophy className="text-purple-400 mb-1 group-hover:scale-110 transition-transform" size={20} />
            <span className="text-xs font-bold text-gray-300">Achievements</span>
         </Link>
         {/* We can trigger modals via URL hash or Context, but for now simple links work well too. 
             Ideally Quests is a button, but let's make it a visual tracker below instead.
         */}
      </div>

      {/* Mini Quest Tracker */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Scroll size={14} /> Active Quests
            </h4>
        </div>
        
        <div className="space-y-3">
            {activeQuests.length > 0 ? activeQuests.map(quest => (
                <div key={quest.id} className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-300 font-medium line-clamp-1">{quest.description}</span>
                        <span className="text-[var(--neon-yellow)] font-bold">{quest.reward}G</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[var(--neon-blue)] transition-all duration-500"
                            style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                        />
                    </div>
                    <div className="text-[10px] text-right text-gray-500 mt-1 font-mono">
                        {quest.progress} / {quest.target}
                    </div>
                </div>
            )) : (
                <div className="text-center py-8 text-gray-600 text-xs italic">
                    All data analyzed.<br/>No pending tasks.
                </div>
            )}
        </div>
      </div>

      {/* Current Level Status */}
      <div className="mt-auto bg-[var(--neon-blue)]/5 p-4 rounded-2xl border border-[var(--neon-blue)]/20">
         <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[var(--neon-blue)]">Current Objective</span>
            <span className="text-[10px] bg-[var(--neon-blue)] text-black px-2 py-0.5 rounded font-bold">LVL {currentLevelId}</span>
         </div>
         <p className="text-sm text-gray-300 leading-snug">
            Focus on the primary goals to advance to the next sector.
         </p>
      </div>

    </aside>
  );
};
