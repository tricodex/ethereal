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
      <img
        src={src}
        alt={isEth ? "Ethereum Gem" : `Gem ${gem.color}`}
        className={clsx(
            "w-full h-full object-contain pointer-events-none select-none",
            isEth && "drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]"
        )}
      />
    </motion.div>
  );
};
