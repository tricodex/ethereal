"use client";

import { useGameStore } from "@/store/gameStore";
import { LEVELS } from "@/lib/game/levels";
import clsx from "clsx";
import { Lock, Star } from "lucide-react";
import { motion } from "framer-motion";

interface LevelSelectorProps {
  currentLevelId: number;
  onSelectLevel: (id: number) => void;
}

export const LevelSelector = ({ currentLevelId, onSelectLevel }: LevelSelectorProps) => {
  const { debugUnlockAll } = useGameStore();

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto p-4">
      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] uppercase tracking-wider">
        Select Level
      </h2>

      <div className="grid grid-cols-4 gap-6">
        {LEVELS.map((level) => {
            const isLocked = !debugUnlockAll && level.id > currentLevelId; // Check debug flag
            
            return (
                <motion.button
                    key={level.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLocked}
                    onClick={() => onSelectLevel(level.id)}
                    className={clsx(
                        "relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-all",
                        isLocked 
                            ? "border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed"
                            : "border-[var(--neon-blue)] bg-[var(--neon-blue)]/10 text-white cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:bg-[var(--neon-blue)]/20"
                    )}
                >
                    {isLocked ? (
                        <Lock size={24} />
                    ) : (
                        <>
                            <span className="text-3xl font-black">{level.id}</span>
                            <div className="flex gap-0.5 mt-1">
                                {[1,2,3].map(i => <Star key={i} size={8} fill="currentColor" className="text-[var(--neon-yellow)]" />)}
                            </div>
                        </>
                    )}
                </motion.button>
            )
        })}
      </div>
    </div>
  );
};
