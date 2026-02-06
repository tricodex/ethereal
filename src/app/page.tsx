"use client";

import { useState } from "react";
import { Board } from "@/components/game/Board";
import { useGameStore } from "@/store/gameStore";
import { LevelSelector } from "@/components/game/LevelSelector";
import { TutorialOverlay } from "@/components/game/TutorialOverlay";
import { ArrowLeft } from "lucide-react";

import { Sidebar } from "@/components/game/Sidebar";

import { LevelCompleteModal } from "@/components/game/LevelCompleteModal";

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
    <main className="min-h-screen pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Game Over / Level Complete Overlay */}
      <LevelCompleteModal 
        onReplay={() => initializeGame()} 
        onBackToLevels={handleBackToLevels} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
        {/* Main Game Area */}
        <div className="flex flex-col items-center gap-8">
            <div className="text-center space-y-2 relative z-10">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-pink)] drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">
                CRUSH ETH
                </h1>
                <p className="text-[var(--neon-green)] font-mono text-sm md:text-lg tracking-widest uppercase">
                Compete • Match-3 • Win USDC
                </p>
            </div>

            {!isPlaying ? (
                <LevelSelector currentLevelId={currentLevelId} onSelectLevel={handleLevelSelect} />
            ) : (
                <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-500 w-full max-w-lg">
                    {/* Compact Mobile HUD */}
                    <div className="flex lg:hidden items-center justify-between w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur">
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
                    
                    {/* Objectives HUD (Mobile/Tablet) */}
                    <div className="flex lg:hidden gap-4">
                        {levelConfig?.objectives && levelConfig.objectives.map((obj, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30">
                                <img src="/assets/CoreGems/ethereum.png" className="w-5 h-5 block" alt="ETH" />
                                <span className="text-sm font-bold text-blue-200">
                                    {collectedEth}/{obj.count}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    <TutorialOverlay levelId={currentLevelId} />
                </div>
            )}
            
            <div className="mt-4 text-xs text-gray-500 font-mono">
                ALPHA VERSION v0.1 • TESTNET ONLY • NO REAL FUNDS
            </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="sticky top-24">
            <Sidebar />
        </div>
      </div>
    </main>
  );
}
