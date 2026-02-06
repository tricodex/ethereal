"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Gem } from "./Gem";
import { ROWS, COLS } from "@/lib/game/engine";
import { AnimatePresence, motion } from "framer-motion";
import { Particles } from "./Particles";
import { FloatingScore } from "./FloatingScore";

const GEM_SIZE = 60;

export const Board = () => {
  const { board, selectedGem, selectGem, initializeGame, comboCount, floatingTexts } = useGameStore();

  useEffect(() => {
    initializeGame();
  }, []);

  return (
    <div 
      className="relative bg-black/40 backdrop-blur-xl rounded-xl border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      style={{
        width: COLS * GEM_SIZE + 32,
        height: ROWS * GEM_SIZE + 32,
        padding: 16
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <Particles />
        <FloatingScore texts={floatingTexts} />

        {/* Grid Background */}
        <div 
            className="absolute inset-0 grid" 
            style={{ 
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            }}
        >
            {Array.from({ length: ROWS * COLS }).map((_, i) => (
                <div key={i} className="border border-white/5 bg-white/5" />
            ))}
        </div>

        <AnimatePresence>
        {board.map((row, y) => 
            row.map((gem, x) => (
                gem ? (
                    <Gem
                    key={gem.id}
                    gem={gem}
                    size={GEM_SIZE}
                    isSelected={selectedGem?.x === gem.x && selectedGem?.y === gem.y}
                    onClick={() => selectGem({ x: gem.x, y: gem.y })}
                    />
                ) : (
                    <Particles key={`p-${x}-${y}`} position={{x, y}} /> 
                )
            ))
        )}
        </AnimatePresence>
        
        {/* Combo Overlay */}
        <AnimatePresence>
            {comboCount > 1 && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                    animate={{ scale: 1.5, opacity: 1, y: 0 }}
                    exit={{ scale: 2, opacity: 0 }}
                    key={comboCount}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-yellow)] to-[var(--neon-pink)] drop-shadow-[0_0_20px_rgba(255,0,255,0.8)] stroke-white stroke-2">
                            {comboCount}x
                        </span>
                        <span className="text-2xl font-bold text-white uppercase tracking-widest drop-shadow-md">
                            COMBO!
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};
