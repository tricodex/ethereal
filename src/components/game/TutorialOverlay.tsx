"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Hand } from "lucide-react";

interface TutorialProps {
  levelId: number;
}

export const TutorialOverlay = ({ levelId }: TutorialProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (levelId !== 1) setStep(-1);
    else setStep(0);
  }, [levelId]);

  if (levelId !== 1 || step === -1) return null;

  return (
    <AnimatePresence>
      {step === 0 && (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 flex flex-col items-center gap-4">
            <motion.div
                animate={{ y: [0, 20, 0], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <Hand size={48} className="text-[var(--neon-pink)] rotate-12 drop-shadow-[0_0_10px_var(--neon-pink)]" />
            </motion.div>
            
            <div className="bg-black/90 border border-[var(--neon-pink)] p-6 rounded-2xl max-w-xs text-center shadow-[0_0_30px_rgba(255,0,255,0.4)] pointer-events-auto">
                <h3 className="text-xl font-bold text-white mb-2">HOW TO PLAY</h3>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                    Swipe gems to match 3 or more of the same color.
                </p>
                <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-2 bg-[var(--neon-pink)] text-white font-bold rounded-full hover:scale-105 transition-transform"
                >
                    GOT IT
                </button>
            </div>
          </div>
        </motion.div>
      )}

      {step === 1 && (
         <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute bottom-20 left-[50%] -translate-x-1/2 z-50 pointer-events-auto"
        >
             <div className="bg-black/90 border border-[var(--neon-blue)] p-4 rounded-xl flex items-center gap-4 shadow-[0_0_30px_rgba(0,243,255,0.4)]">
                <img src="/assets/CoreGems/ethereum.png" className="w-10 h-10 animate-pulse" />
                <div className="text-left">
                    <p className="text-[var(--neon-blue)] font-bold text-sm uppercase">PRO TIP</p>
                    <p className="text-white text-xs">Collect ETH gems to complete level objectives!</p>
                </div>
                <button 
                    onClick={() => setStep(-1)}
                    className="text-gray-400 hover:text-white text-xl px-2"
                >
                    ✕
                </button>
             </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
