"use client";

import { useState } from "react";
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
  const [activeWorld, setActiveWorld] = useState(1);
  
  // Group levels
  const worlds = [
    { id: 1, name: "ETHERIA GENESIS", desc: "Where it all began. Collect ETH to survive.", levels: LEVELS.filter(l => l.worldId === 1) },
    { id: 2, name: "THE CRYO-VAULT", desc: "Funds are frozen. Smash the ice to withdraw.", levels: LEVELS.filter(l => l.worldId === 2) },
    { id: 3, name: "OBSIDIAN WASTES", desc: "Dark energy crystals block your path. Blast them!", levels: LEVELS.filter(l => l.worldId === 3) },
    { id: 4, name: "THE GOLDEN VEIN", desc: "Rich deposits detected. Guide the gold to the bottom.", levels: LEVELS.filter(l => l.worldId === 4) },
    { id: 5, name: "MERGE SINGULARITY", desc: "Total chaos. Ice, Rocks, and Gold collide.", levels: LEVELS.filter(l => l.worldId === 5) }
  ];

  const currentWorld = worlds.find(w => w.id === activeWorld) || worlds[0];

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] uppercase tracking-wider">
        Select Level
      </h2>

      {/* World Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        {worlds.map(w => (
            <button
                key={w.id}
                onClick={() => setActiveWorld(w.id)}
                className={clsx(
                    "px-6 py-2 rounded-full font-bold uppercase tracking-widest transition-all",
                    activeWorld === w.id 
                    ? "bg-[var(--neon-pink)] text-white shadow-[0_0_15px_var(--neon-pink)]"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
            >
                World {w.id}
            </button>
        ))}
      </div>

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white">{currentWorld.name}</h3>
        <p className="text-[var(--neon-blue)] font-mono text-sm">{currentWorld.desc}</p>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-5 gap-6">
        {currentWorld.levels.map((level) => {
            const isLocked = !debugUnlockAll && level.id > currentLevelId; // Check debug flag
            
            return (
                <motion.button
                    key={level.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLocked}
                    onClick={() => onSelectLevel(level.id)}
                    className={clsx(
                        "relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-all",
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
