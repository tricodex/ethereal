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
    : `/assets/CoreGems/simple/${gem.color}.png`;

  const isSpecial = gem.type !== 'simple';

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
