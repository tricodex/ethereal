"use client";

import { motion } from "framer-motion";
import { Crown, Medal, TrendingUp } from "lucide-react";

export default function LeaderboardPage() {
  const dummyData = [
    { rank: 1, name: "CryptoKing.eth", score: 125000, color: "text-yellow-400" },
    { rank: 2, name: "GemMaster.base", score: 98000, color: "text-gray-300" },
    { rank: 3, name: "EthCrusher", score: 85400, color: "text-orange-400" },
    { rank: 4, name: "0xWhale...4a2", score: 72000, color: "text-white" },
    { rank: 5, name: "VitalikFan", score: 65000, color: "text-white" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 w-full max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-2">
            GLOBAL <span className="text-[var(--neon-green)]">LEADERBOARD</span>
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        {dummyData.map((player, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center p-4 rounded-xl border backdrop-blur-md ${
                    i === 0 
                    ? "bg-yellow-500/10 border-yellow-500/50" 
                    : "bg-black/30 border-white/10"
                }`}
            >
                <div className="w-12 h-12 flex items-center justify-center font-black text-2xl italic text-white/50 mr-4">
                    {player.rank === 1 ? <Crown className="text-yellow-400" /> : `#${player.rank}`}
                </div>
                
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${player.color} tracking-wide`}>
                            {player.name}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <span className="font-mono font-bold text-[var(--neon-green)] text-xl">
                        {player.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-500 block uppercase tracking-widest">Score</span>
                </div>
            </motion.div>
        ))}
      </div>
    </div>
  );
}
