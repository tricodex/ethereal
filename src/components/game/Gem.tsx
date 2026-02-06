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
  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isSelected ? 1.1 : 1, 
        opacity: 1,
        filter: isSelected ? "drop-shadow(0 0 8px var(--neon-blue))" : "none"
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
    >
      <img
        src={`/assets/CoreGems/simple/${gem.color}.png`}
        alt={`Gem ${gem.color}`}
        className="w-full h-full object-contain pointer-events-none select-none"
      />
    </motion.div>
  );
};
