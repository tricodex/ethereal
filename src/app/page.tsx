"use client";

import { Board } from "@/components/game/Board";
import { useGameStore } from "@/store/gameStore";

export default function Home() {
  const { score, moves } = useGameStore();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-10 gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-pink)] drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">
          CRUSH ETH
        </h1>
        <p className="text-[var(--neon-green)] font-mono text-lg tracking-widest uppercase">
          Match-3 / Wager USDC / Win Big
        </p>
      </div>

      <div className="flex gap-12 text-2xl font-bold font-mono text-white bg-black/40 px-8 py-3 rounded-full border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Score</span>
          <span className="text-[var(--neon-yellow)]">{score}</span>
        </div>
        <div className="w-px bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Moves</span>
          <span className="text-[var(--neon-blue)]">{moves}</span>
        </div>
      </div>

      <Board />
      
      <div className="mt-4 text-xs text-gray-500 font-mono">
        ALPHA VERSION v0.1
      </div>
    </main>
  );
}
