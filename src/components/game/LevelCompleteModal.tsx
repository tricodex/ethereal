"use client";

import { useGameStore } from "@/store/gameStore";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, Menu } from "lucide-react";

interface LevelCompleteModalProps {
  onReplay: () => void;
  onBackToLevels: () => void;
}

export const LevelCompleteModal = ({ onReplay, onBackToLevels }: LevelCompleteModalProps) => {
  const { score, levelConfig, collectedEth, nextLevel, currentLevelId, isGameOver } = useGameStore();

  if (!isGameOver) return null;

  const isWin = score >= (levelConfig?.targetScore || 0);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      >
        <motion.div 
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="flex flex-col items-center gap-8 p-10 bg-[#0a0a10] border-2 border-[var(--neon-pink)] rounded-3xl shadow-[0_0_50px_rgba(255,0,255,0.4)] max-w-sm w-full text-center relative overflow-hidden"
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--neon-pink)]/20 to-transparent pointer-events-none" />

            <div className="space-y-2 relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
                    {isWin ? "LEVEL COMPLETE!" : "GAME OVER"}
                </h2>
                <p className="text-[var(--neon-blue)] font-mono text-xs uppercase tracking-widest">
                    {isWin ? "Outstanding Performance" : "Better luck next time"}
                </p>
            </div>
            
            <div className="space-y-2 relative z-10">
                <p className="text-gray-400 text-sm font-mono uppercase">Final Score</p>
                <motion.p 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="text-7xl font-bold text-[var(--neon-yellow)] drop-shadow-[0_0_15px_rgba(252,238,10,0.5)]"
                >
                    {score}
                </motion.p>
            </div>
            
            {levelConfig?.objectives?.map((obj, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 relative z-10">
                    <img src="/assets/CoreGems/ethereum.png" className="w-6 h-6" alt="ETH" />
                    <span className="text-sm text-gray-300 font-mono">
                        ETH Collected: <span className="text-white font-bold">{collectedEth} / {obj.count}</span>
                    </span>
                </div>
            ))}

            <div className="flex gap-4 mt-4 w-full relative z-10 justify-center">
                <button 
                    onClick={onBackToLevels}
                    className="flex flex-col items-center gap-1 p-4 rounded-xl hover:bg-white/10 transition-colors group"
                >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 text-white group-hover:bg-gray-700 transition-colors">
                        <Menu size={24} />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-white">Menu</span>
                </button>

                <button 
                    onClick={onReplay}
                    className="flex flex-col items-center gap-1 p-4 rounded-xl hover:bg-white/10 transition-colors group"
                >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black group-hover:bg-[var(--neon-pink)] group-hover:text-white transition-colors">
                        <RotateCcw size={24} />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-white">Replay</span>
                </button>

                {isWin && (
                    <button 
                        onClick={nextLevel}
                        className="flex flex-col items-center gap-1 p-4 rounded-xl hover:bg-white/10 transition-colors group"
                    >
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--neon-blue)] text-black group-hover:bg-[var(--neon-green)] transition-colors animate-pulse">
                            <ArrowRight size={24} />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-white">Next</span>
                    </button>
                )}
            </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
