"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Position } from "@/lib/types";

interface ParticlesProps {
  position: Position;
  color?: string;
  count?: number;
}

export const Particles = ({ position, color = "#ff00ff", count = 8 }: ParticlesProps) => {
  const [items, setItems] = useState<number[]>([]);

  useEffect(() => {
    setItems(Array.from({ length: count }, (_, i) => i));
  }, [count]);

  return (
    <>
      {items.map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 0,
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-full pointer-events-none z-20"
          style={{
            backgroundColor: color,
            left: position.x * 60 + 30, // Center in cell
            top: position.y * 60 + 30,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      ))}
    </>
  );
};
