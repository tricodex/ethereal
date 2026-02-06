"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Gem } from "./Gem";
import { ROWS, COLS } from "@/lib/game/engine";
import { AnimatePresence } from "framer-motion";

export const Board = () => {
  const { board, selectedGem, selectGem, initializeGame } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const GEM_SIZE = 60; // Configurable size

  useEffect(() => {
    initializeGame();
    setMounted(true);
  }, [initializeGame]);

  if (!mounted) return null;

  return (
    <div className="relative p-4 rounded-xl bg-[rgba(10,10,20,0.8)] border-2 border-[var(--neon-blue)] shadow-[0_0_20px_rgba(0,243,255,0.3)] backdrop-blur-md">
      <div 
        className="relative bg-[rgba(0,0,0,0.5)] rounded-lg overflow-hidden"
        style={{
          width: COLS * GEM_SIZE,
          height: ROWS * GEM_SIZE,
        }}
      >
        {/* Background Grid Pattern */}
        <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
                backgroundImage: `linear-gradient(var(--neon-blue) 1px, transparent 1px), linear-gradient(90deg, var(--neon-blue) 1px, transparent 1px)`,
                backgroundSize: `${GEM_SIZE}px ${GEM_SIZE}px`
            }}
        />

        <AnimatePresence>
        {board.flat().map((gem) => (
          gem ? (
            <Gem
              key={gem.id}
              gem={gem}
              size={GEM_SIZE}
              isSelected={selectedGem?.x === gem.x && selectedGem?.y === gem.y}
              onClick={() => selectGem({ x: gem.x, y: gem.y })}
            />
          ) : (
            // Spawn particles on empty spots where a "shiny" or high value gem might have been
            // Logic for this is complex in React without an event bus, so we'll just placeholder it 
            // for the verify step or add it to the Gem component's Exit animation
            null
          )
        ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
