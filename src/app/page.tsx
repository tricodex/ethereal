"use client";

import { Board } from "@/components/game/Board";
import { useGameStore } from "@/store/gameStore";

export default function Home() {
  const { score, moves, isGameOver, initializeGame } = useGameStore();

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen py-10 gap-8">
      {isGameOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
              <div className="flex flex-col items-center gap-6 p-10 bg-[#0a0a10] border-2 border-[var(--neon-pink)] rounded-2xl shadow-[0_0_50px_rgba(255,0,255,0.4)] max-w-sm text-center">
                  <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                      MATCH COMPLETE
                  </h2>
                  
                  <div className="space-y-2">
                      <p className="text-gray-400 text-sm font-mono uppercase">Final Score</p>
                      <p className="text-6xl font-bold text-[var(--neon-yellow)] drop-shadow-[0_0_15px_rgba(252,238,10,0.5)]">
                          {score}
                      </p>
                  </div>

                  <div className="w-full h-px bg-white/10" />
                  
                  <div className="space-y-2">
                     <p className="text-[var(--neon-blue)] animate-pulse font-mono text-sm">
                        SETTLING ON ARC...
                     </p>
                     <p className="text-xs text-gray-500">
                        Verifying moves & signing result
                     </p>
                  </div>

                  <button 
                    onClick={() => initializeGame()}
                    className="mt-4 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-[var(--neon-pink)] hover:text-white transition-colors rounded-full"
                  >
                      Play Again
                  </button>
              </div>
          </div>
      )}

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
