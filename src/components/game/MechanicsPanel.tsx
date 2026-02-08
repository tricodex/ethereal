"use client";

import { useGameStore } from "@/store/gameStore";
import { useState } from "react";
import { Info, Target, Snowflake, Hexagon, Coins, Zap, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { LEVELS } from "@/lib/game/levels";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export const MechanicsPanel = () => {
  const { levelConfig, currentLevelId, collectedEth, collectedGold } = useGameStore();
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);

  if (!levelConfig) return null;

  // Determine World Context
  const isIceWorld = levelConfig.iceCount && levelConfig.iceCount > 0;
  const isRockWorld = levelConfig.rockCount && levelConfig.rockCount > 0;
  const isGoldWorld = levelConfig.goldPreload && levelConfig.goldPreload > 0;
  
  // Dynamic World Info
  let worldTitle = "Standard Mode";
  let WorldIcon = "/assets/CoreGems/ethereum.png"; // Default
  let worldTips = [
    "Match 3 gems to score points.",
    "Create special gems with matches of 4+."
  ];

  if (currentLevelId <= 10) {
      worldTitle = "Etheria Genesis";
      WorldIcon = "/assets/CoreGems/ethereum.png";
      worldTips = [
          "Match ETH gems to collect them.",
          "Use Rockets to clear rows/cols."
      ];
  } else if (currentLevelId <= 20) {
      worldTitle = "The Cryo-Vault";
      WorldIcon = "/assets/CoreGems/shiny/3.png"; // Blue Gem for Ice World
      worldTips = [
          "Ice blocks gems from moving.",
          "Match adjacent gems to break Ice.",
          "Clear all Ice to win!"
      ];
  } else if (currentLevelId <= 30) {
      worldTitle = "Obsidian Wastes";
      WorldIcon = "/assets/SpecialGems/45.png"; // Use Dark Gem as Rock Proxy
      worldTips = [
          "Obsidian Rocks block your path.",
          "They cannot be moved.",
          "Match adjacent gems to destroy them.",
          "Explosions (Bombs) are effective!"
      ];
  } else if (currentLevelId <= 40) {
      worldTitle = "The Golden Vein";
      WorldIcon = "/assets/SpecialGems/47.png"; // Use Gold Gem as Gold Proxy
      worldTips = [
          "Gold Nuggets appear on the board.",
          "Bring them to the BOTTOM row.",
          "Collect them to verify transactions."
      ];
  } else {
      worldTitle = "Merge Singularity";
      WorldIcon = "/assets/SpecialGems/50.png"; // Chaos/Boss Gem
      worldTips = [
          "Chaos Mode Active!",
          "Ice, Rocks, and Gold combined.",
          "Prioritize objectives carefully."
      ];
  }

  return (
    <aside className="hidden xl:flex flex-col gap-6 w-full max-w-[300px] h-[calc(100vh-120px)] p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-in slide-in-from-left-10 fade-in duration-700">
      
      {/* World Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="p-3 bg-[var(--neon-blue)]/10 rounded-xl border border-[var(--neon-blue)]/30">
            <img src={WorldIcon} alt={worldTitle} className="w-8 h-8 object-contain drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]" />
        </div>
        <div>
            <h2 className="text-white font-bold text-lg leading-tight uppercase tracking-wide">{worldTitle}</h2>
            <span className="text-gray-500 text-xs font-mono">World {Math.ceil(currentLevelId / 10)}</span>
        </div>
      </div>

      {/* Objectives */}
      <div className="space-y-4">
        <h3 className="text-[var(--neon-yellow)] font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <Target size={16} /> Mission Goals
        </h3>
        
        <div className="space-y-3">
            {levelConfig.objectives?.map((obj, i) => {
                let progress = 0;
                let target = obj.count;
                let label = "";
                let icon = "";

                switch(obj.type) {
                    case 'collect_eth':
                        progress = collectedEth;
                        label = "Collect ETH";
                        icon = "🔹";
                        break;
                    case 'collect_gold':
                        // We need to track gold collection for level somewhere, 
                        // currently collectedGold is global. 
                        // For display, we might show "Collect Gold" without progress if not tracked per level, 
                        // OR we assume GameStore needs 'levelGold'.
                        // For now, let's use global collectedGold just for visual, or 0 if new.
                        // Ideally, we need 'levelCollectedGold' in store.
                        // Let's use a placeholder.
                        progress = 0; 
                        label = "Collect Gold";
                        icon = "🪙";
                        break;
                    case 'clear_ice':
                        // Need 'clearedIce' in store? Or 'remainingIce' (board scan).
                        // Let's show just the target for now.
                        label = "Clear Ice";
                        icon = "❄️";
                        break;
                }

                return (
                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <span className="text-xl">{icon}</span>
                             <span className="text-sm font-medium text-gray-300">{label}</span>
                        </div>
                        <span className="font-mono font-bold text-[var(--neon-green)]">
                             {obj.count}
                        </span>
                    </div>
                );
            })}
             <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        <span className="text-sm font-medium text-gray-300">Target Score</span>
                </div>
                <span className="font-mono font-bold text-[var(--neon-pink)]">
                        {levelConfig.targetScore.toLocaleString()}
                </span>
            </div>
        </div>
      </div>

      {/* Mechanics / Tips */}
      <div className="flex-1">
        <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <Info size={14} /> Tactical Intel
        </h3>
        <ul className="space-y-3">
            {worldTips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                    <span className="text-[var(--neon-blue)] mt-1">•</span>
                    {tip}
                </li>
            ))}
        </ul>
      </div>
      
      {/* Level Navigator Popout */}
      <div className="relative mt-auto pt-4 border-t border-white/10">
          <button 
              onClick={() => setIsLevelSelectOpen(!isLevelSelectOpen)}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/5"
          >
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-[var(--neon-pink)]/20 flex items-center justify-center text-[var(--neon-pink)] font-bold">
                     {currentLevelId}
                 </div>
                 <div className="text-left">
                     <p className="text-xs text-gray-400 font-bold uppercase">Current Level</p>
                     <p className="text-white font-bold text-sm">Select Level</p>
                 </div>
             </div>
             <ChevronUp className={clsx("text-gray-500 transition-transform duration-300", isLevelSelectOpen && "rotate-180")} size={20} />
          </button>

          <AnimatePresence>
            {isLevelSelectOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: -10, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 w-full mb-2 bg-gray-900 border border-white/20 rounded-2xl p-4 shadow-2xl z-50 max-h-[300px] overflow-y-auto custom-scrollbar"
                >
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 sticky top-0 bg-gray-900 pb-2 border-b border-white/10">
                        {worldTitle}
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                        {LEVELS.filter(l => Math.ceil(l.id / 10) === Math.ceil(currentLevelId / 10)).map(level => {
                             const isLocked = !useGameStore.getState().debugUnlockAll && level.id > useGameStore.getState().currentLevelId; // Simple lock check based on current active level might be flawed if we are replaying. 
                             // Better check: level.id > (highestUnlockedLevel || 1). But stick to simple for now or use debug flag.
                             // Actually, let's just allow navigating to any level up to currentLevelId + 1 (or max unlocked).
                             // Since we don't track 'highestUnlocked' in store explicitly yet (only currentLevelId sometimes acts as progress), 
                             // let's assume if it's <= currentLevelId it's unlocked, or use debugUnlockAll.
                             const canPlay = useGameStore.getState().debugUnlockAll || level.id <= (useGameStore.getState().currentLevelId + 50); // Temporary unlock all for fluidity or strictly check.
                             
                             return (
                                <button
                                    key={level.id}
                                    onClick={() => {
                                        useGameStore.getState().initializeGame(level.id);
                                        setIsLevelSelectOpen(false);
                                    }}
                                    className={clsx(
                                        "aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all border",
                                        level.id === currentLevelId 
                                            ? "bg-[var(--neon-pink)] border-[var(--neon-pink)] text-white" 
                                            : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white"
                                    )}
                                >
                                    {level.id}
                                </button>
                             )
                        })}
                    </div>
                    {/* World Switcher (Simple arrows) */}
                     <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                        <button 
                            className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30"
                            disabled={currentLevelId <= 10}
                            onClick={() => useGameStore.getState().initializeGame(Math.max(1, currentLevelId - 10))}
                        >
                            <ChevronLeft size={16} className="text-gray-400" />
                        </button>
                        <span className="text-[10px] text-gray-500 font-mono">WORLD SWITCH</span>
                        <button 
                            className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30"
                            disabled={currentLevelId > 40}
                            onClick={() => useGameStore.getState().initializeGame(Math.min(50, currentLevelId + 10))}
                        >
                            <ChevronRight size={16} className="text-gray-400" />
                        </button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
      </div>

    </aside>
  );
};

