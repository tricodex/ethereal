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
  const imageSrc = isEth 
    ? "/assets/CoreGems/ethereum.png"
    : `/assets/CoreGems/shiny/${gem.color}.png`;

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
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0, rotate: 180 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`absolute inset-0 p-1 flex items-center justify-center cursor-pointer ${isSelected ? "z-20" : "z-10"}`}
      style={{ 
        width: size, 
        height: size, 
        left: gem.x * size, 
        top: gem.y * size 
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <div className={clsx(
        "relative w-full h-full flex items-center justify-center rounded-full transition-all duration-300",
        isSelected && "ring-4 ring-[var(--neon-pink)] shadow-[0_0_15px_var(--neon-pink)] scale-110",
        gem.type === 'rainbow' && "animate-pulse shadow-[0_0_20px_purple] ring-2 ring-purple-500",
        gem.type === 'bomb' && "scale-90"
      )}>
        <img 
            src={imageSrc} 
            alt="Gem" 
            className={clsx(
                "w-full h-full object-contain drop-shadow-lg",
                gem.type === 'rainbow' && "hue-rotate-90 contrast-125 saturate-200"
            )} 
        />
        
        {/* Special Gem Overlays */}
        {gem.type === 'rocket_h' && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-full h-1 bg-white/80 blur-[1px] shadow-[0_0_5px_white]" />
                 <div className="absolute w-full h-2 bg-transparent border-t-2 border-b-2 border-white/50" />
             </div>
        )}
        {gem.type === 'rocket_v' && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="h-full w-1 bg-white/80 blur-[1px] shadow-[0_0_5px_white]" />
                 <div className="absolute h-full w-2 bg-transparent border-l-2 border-r-2 border-white/50" />
             </div>
        )}
        {gem.type === 'bomb' && (
             <div className="absolute inset-0 rounded-full border-4 border-red-500/50 animate-ping pointer-events-none" />
        )}
        {gem.type === 'rainbow' && (
             <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-spin opacity-50 pointer-events-none" />
        )}

        {/* Ice Overlay */}
        {gem.isFrozen && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] border-2 border-white/60 rounded-lg shadow-[0_0_10px_rgba(255,255,255,0.5)] z-20 pointer-events-none flex items-center justify-center">
                <div className="w-full h-full bg-[url('/assets/ice-texture.png')] opacity-30 bg-cover" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full shadow-[0_0_5px_white]" />
            </div>
        )}
      </div>
    </motion.div>
  );
};
