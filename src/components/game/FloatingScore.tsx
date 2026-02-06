"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color?: string;
}

interface FloatingScoreProps {
  texts: FloatingText[];
}

export const FloatingScore = ({ texts }: FloatingScoreProps) => {
  return (
    <AnimatePresence>
      {texts.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -40, scale: 1.2 }}
          exit={{ opacity: 0, y: -60, scale: 0.8 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute pointer-events-none z-50 font-black italic drop-shadow-md text-2xl"
          style={{
            left: item.x,
            top: item.y,
            color: item.color || "#fff",
            textShadow: "0 0 5px rgba(0,0,0,0.8)"
          }}
        >
          {item.text}
        </motion.div>
      ))}
    </AnimatePresence>
  );
};
