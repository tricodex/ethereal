"use client";

import { useGameStore } from "@/store/gameStore";
import { Trophy, Star, Target, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function AchievementsPage() {
  const { collectedEth, levelConfig } = useGameStore();

  const achievements = [
    {
       id: "first-blood",
       title: "First Blood",
       desc: "Win your first duel",
       icon: Trophy,
       unlocked: false,
       progress: 0,
       total: 1
    },
    {
       id: "combo-king",
       title: "Combo King",
       desc: "Hit a 5x Chain Streak",
       icon: Zap,
       unlocked: false,
       progress: 0,
       total: 1
    },
    {
       id: "collector",
       title: "ETH Collector",
       desc: "Collect 100 ETH Gems",
       icon: Star,
       unlocked: collectedEth >= 100,
       progress: collectedEth,
       total: 100
    },
    {
       id: "sniper",
       title: "Objective Sniper",
       desc: "Complete 10 Level Objectives",
       icon: Target,
       unlocked: false,
       progress: 2,
       total: 10
    }
  ];

  return (
    <main className="min-h-screen pt-24 pb-10 px-4 max-w-5xl mx-auto w-full">
       <div className="text-center mb-12 space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-yellow)] to-[var(--neon-pink)] drop-shadow-[0_0_10px_rgba(255,255,0,0.5)]">
                ACHIEVEMENTS
            </h1>
            <p className="text-[var(--neon-blue)] font-mono tracking-widest uppercase">
                Track your glory in the arena
            </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {achievements.map((ach, i) => (
             <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-6 p-6 rounded-2xl border backdrop-blur-xl transition-all ${
                     ach.unlocked 
                     ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/50 shadow-[0_0_20px_rgba(255,215,0,0.2)]" 
                     : "bg-black/40 border-white/5 opacity-70 grayscale"
                }`}
             >
                <div className={`p-4 rounded-xl ${ach.unlocked ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-gray-500"}`}>
                    <ach.icon size={32} />
                </div>
                
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                        <h3 className={`text-xl font-bold ${ach.unlocked ? "text-white" : "text-gray-400"}`}>{ach.title}</h3>
                        {ach.unlocked && <Crown size={16} className="text-yellow-400" />}
                    </div>
                    <p className="text-sm text-gray-400 font-mono">{ach.desc}</p>
                    
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10 mt-2">
                        <div 
                            className={`h-full transition-all duration-1000 ${ach.unlocked ? "bg-yellow-500" : "bg-gray-600"}`}
                            style={{ width: `${Math.min(100, (ach.progress / ach.total) * 100)}%` }}
                        />
                    </div>
                    <div className="text-right text-[10px] font-mono text-gray-500">
                        {Math.min(ach.progress, ach.total)} / {ach.total}
                    </div>
                </div>
             </motion.div>
          ))}
       </div>
    </main>
  );
}
