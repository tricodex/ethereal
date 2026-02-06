"use client";

import { motion } from "framer-motion";
import { Gem as GemType } from "@/lib/types";
import clsx from "clsx";

interface GemProps {
  gem: GemType;
  isSelected: boolean;
  onClick: () => void;
  size?: number;
}

export const Gem = ({ gem, isSelected, onClick, size = 50 }: GemProps) => {
  const isEth = gem.color === 7;
  const src = isEth 
    ? "/assets/CoreGems/ethereum.png"
    : `/assets/CoreGems/simple/${gem.color}.png`;

  return (
  /* 
    Logic for special visuals:
    Rocket H: Arrow pointing Left/Right
    Rocket V: Arrow pointing Up/Down
    Bomb: Pulsing circle behind
    Rainbow: Rainbow gradient overlay
  */
  
  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0, y: -50 }}
      animate={{ 
        scale: isSelected ? 1.15 : 1, 
        opacity: 1,
        y: 0,
        filter: isSelected 
            ? "drop-shadow(0 0 10px var(--neon-blue)) brightness(1.2)" 
            : isEth ? "drop-shadow(0 0 5px rgba(90, 100, 255, 0.4))" : "none"
      }}
      exit={{ scale: 0, opacity: 0, rotate: 180 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        layout: { duration: 0.2 } 
      }}
      className={clsx(
        "absolute cursor-pointer flex items-center justify-center rounded-full transition-colors",
        isSelected && "z-10"
      )}
      style={{
        width: size,
        height: size,
        left: gem.x * size,
        top: gem.y * size,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Special Gem Indicators */}
      {gem.type === 'rocket_h' && (
         <div className="absolute inset-0 border-2 border-[var(--neon-green)] rounded-full animate-pulse flex items-center justify-center">
            <div className="w-full h-1 bg-[var(--neon-green)] shadow-[0_0_10px_var(--neon-green)]" />
         </div>
      )}
      {gem.type === 'rocket_v' && (
         <div className="absolute inset-0 border-2 border-[var(--neon-green)] rounded-full animate-pulse flex items-center justify-center">
            <div className="h-full w-1 bg-[var(--neon-green)] shadow-[0_0_10px_var(--neon-green)]" />
         </div>
      )}
      {gem.type === 'bomb' && (
         <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping z-0" />
      )}
      {gem.type === 'rainbow' && (
         <div className="absolute inset-0 rounded-full z-0 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-50 animate-spin" />
      )}

      <img
        src={src}
        alt={isEth ? "Ethereum Gem" : `Gem ${gem.color}`}
        className={clsx(
            "w-full h-full object-contain pointer-events-none select-none relative z-10",
            isEth && "drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]"
        )}
      />
    </motion.div>
  );
};
