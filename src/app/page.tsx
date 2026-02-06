"use client";

import { useState } from "react";
import { Board } from "@/components/game/Board";
import { useGameStore } from "@/store/gameStore";
import { LevelSelector } from "@/components/game/LevelSelector";
import { TutorialOverlay } from "@/components/game/TutorialOverlay";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  const { score, moves, isGameOver, levelConfig, currentLevelId, initializeGame, collectedEth } = useGameStore();
  const [isPlaying, setIsPlaying] = useState(false);

  // Hook into game over to show settlement/restart
  const handleLevelSelect = (levelId: number) => {
      initializeGame(levelId);
      setIsPlaying(true);
  };

  const handleBackToLevels = () => {
      setIsPlaying(false);
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen py-10 gap-8">
      {/* Game Over / Level Complete Overlay */}
      {isGameOver && isPlaying && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
              <div className="flex flex-col items-center gap-6 p-10 bg-[#0a0a10] border-2 border-[var(--neon-pink)] rounded-2xl shadow-[0_0_50px_rgba(255,0,255,0.4)] max-w-sm text-center">
                  <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                      {score >= (levelConfig?.targetScore || 0) ? "LEVEL COMPLETE!" : "GAME OVER"}
                  </h2>
                  
                  <div className="space-y-2">
                      <p className="text-gray-400 text-sm font-mono uppercase">Score</p>
                      <p className="text-6xl font-bold text-[var(--neon-yellow)] drop-shadow-[0_0_15px_rgba(252,238,10,0.5)]">
                          {score}
                      </p>
                  </div>
                  
                  {levelConfig?.objectives?.map((obj, i) => (
                      <div key={i} className="text-sm text-[var(--neon-blue)]">
                          Collected ETH: {collectedEth} / {obj.count}
                      </div>
                  ))}

                  <div className="flex gap-4 mt-4">
                    <button 
                        onClick={handleBackToLevels}
                        className="px-6 py-3 bg-gray-800 text-white font-bold uppercase hover:bg-gray-700 transition-colors rounded-full"
                    >
                        Levels
                    </button>
                    <button 
                        onClick={() => initializeGame()}
                        className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-[var(--neon-pink)] hover:text-white transition-colors rounded-full"
                    >
                        Replay
                    </button>
                  </div>
              </div>
          </div>
      )}

      {/* Main Content */}
      <div className="text-center space-y-2 relative z-10">
        <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-pink)] drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">
          CRUSH ETH
        </h1>
        <p className="text-[var(--neon-green)] font-mono tracking-widest text-sm">
          MATCH-3 CRYPTO BATTLE
        </p>
      </div>

      {!isPlaying ? (
          <LevelSelector currentLevelId={currentLevelId} onSelectLevel={handleLevelSelect} />
      ) : (
          <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex items-center justify-between w-full max-w-md px-4 py-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur">
                <button onClick={handleBackToLevels} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-400" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 font-mono">LEVEL {levelConfig?.id}</span>
                    <span className="text-xl font-bold text-[var(--neon-yellow)]">{score} / {levelConfig?.targetScore}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500 font-mono">MOVES</span>
                    <span className="text-xl font-bold text-[var(--neon-pink)]">{levelConfig ? levelConfig.moves - moves : 0}</span>
                </div>
            </div>

            <Board />
            
            {/* Objectives HUD */}
            {levelConfig?.objectives && (
                <div className="flex gap-4">
                    {levelConfig.objectives.map((obj, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30">
                            <img src="/assets/CoreGems/ethereum.png" className="w-5 h-5 block" alt="ETH" />
                            <span className="text-sm font-bold text-blue-200">
                                {collectedEth}/{obj.count}
                            </span>
                        </div>
                    ))}
                </div>
            )}
            
            <TutorialOverlay levelId={currentLevelId} />
          </div>
      )}
    </main>
  );
}
