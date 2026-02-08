"use client";

import { useGameStore } from "@/store/gameStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Sparkles, Trophy, User } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function GachaPage() {
  const { collectedGold, unlockedCollectibles, playerAvatar, summonGacha, setAvatar } = useGameStore();
  const [isSummoning, setIsSummoning] = useState(false);
  const [rewardId, setRewardId] = useState<number | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Generate list of 50 gems
  const allCollectibles = Array.from({ length: 50 }, (_, i) => i + 1);

  const handleSummon = () => {
    if (collectedGold < 1000) return;
    setIsSummoning(true);
    setRewardId(null);
    
    // Animation delay
    setTimeout(() => {
        const result = summonGacha();
        if (result.success && result.rewardId) {
            setRewardId(result.rewardId);
            setIsNew(result.isNew || false);
        }
        setIsSummoning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/50 via-gray-900 to-black">
      
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
          <span className="font-bold">BACK</span>
        </Link>
        <div className="flex items-center gap-2 bg-black/40 px-6 py-2 rounded-full border border-[var(--neon-yellow)]/30">
            <span className="text-[var(--neon-yellow)] font-bold text-xl">🪙 {collectedGold}</span>
        </div>
      </div>

      <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-2 filter drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
        ETHER SUMMON
      </h1>
      <p className="text-gray-400 mb-12">Collect rare gems to use as your avatar!</p>

      {/* Summon Section */}
      <div className="relative mb-16 flex flex-col items-center">
        <AnimatePresence mode="wait">
            {!rewardId && !isSummoning && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="relative group"
                >
                    <div className="absolute inset-0 bg-purple-500 blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
                    <button 
                        onClick={handleSummon}
                        disabled={collectedGold < 1000}
                        className={clsx(
                            "relative w-64 h-64 rounded-3xl border-4 flex flex-col items-center justify-center gap-4 transition-all duration-300",
                            collectedGold >= 1000 
                                ? "border-[var(--neon-pink)] bg-gray-900/80 hover:scale-105 hover:shadow-[0_0_30px_var(--neon-pink)] cursor-pointer"
                                : "border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Sparkles size={64} className={collectedGold >= 1000 ? "text-[var(--neon-pink)] animate-pulse" : "text-gray-600"} />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-white uppercase tracking-widest">SUMMON</span>
                            <span className="text-[var(--neon-yellow)] font-bold">1000 GOLD</span>
                        </div>
                    </button>
                </motion.div>
            )}

            {isSummoning && (
                <motion.div
                    key="summoning"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="w-64 h-64 flex items-center justify-center"
                >
                    <div className="w-32 h-32 rounded-full border-4 border-t-[var(--neon-pink)] border-r-[var(--neon-blue)] border-b-[var(--neon-green)] border-l-[var(--neon-yellow)] animate-spin" />
                </motion.div>
            )}

            {rewardId && (
                <motion.div
                    key="reward"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="relative w-80 h-96 bg-gray-900 border-4 border-[var(--neon-yellow)] rounded-3xl flex flex-col items-center justify-center p-8 shadow-[0_0_50px_var(--neon-yellow)]"
                >
                    <div className="absolute top-4 right-4">
                        {isNew && <span className="bg-[var(--neon-pink)] text-white px-3 py-1 rounded-full font-bold text-sm animate-bounce">NEW!</span>}
                    </div>
                    
                    <div className="w-40 h-40 mb-6 relative">
                         <div className="absolute inset-0 bg-[var(--neon-yellow)] blur-[30px] opacity-20" />
                         <img src={`/assets/SpecialGems/${rewardId}.png`} alt="Reward" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
                    </div>
                    
                    <h3 className="text-3xl font-black text-white mb-2">#{rewardId}</h3>
                    <p className="text-[var(--neon-yellow)] font-bold mb-6">UNLOCKED!</p>
                    
                    <button 
                        onClick={() => setRewardId(null)}
                        className="bg-white text-black font-black px-8 py-3 rounded-full hover:scale-105 transition-transform"
                    >
                        AGAIN
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Collection Grid */}
      <div className="w-full max-w-6xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="text-[var(--neon-yellow)]" />
            COLLECTION <span className="text-gray-500 text-lg">({unlockedCollectibles.length} / 50)</span>
        </h2>
        
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {allCollectibles.map(id => {
                const isUnlocked = unlockedCollectibles.includes(id);
                const isEquipped = playerAvatar === id;
                
                return (
                    <button
                        key={id}
                        disabled={!isUnlocked}
                        onClick={() => isUnlocked && setAvatar(id)}
                        className={clsx(
                            "relative aspect-square rounded-xl flex items-center justify-center transition-all",
                            isUnlocked 
                                ? "bg-gray-800 border-2 border-gray-600 hover:border-white cursor-pointer" 
                                : "bg-gray-900/50 border border-gray-800 opacity-30",
                            isEquipped && "ring-4 ring-[var(--neon-green)] shadow-[0_0_15px_var(--neon-green)] scale-110 z-10"
                        )}
                    >
                        {isUnlocked ? (
                            <img src={`/assets/SpecialGems/${id}.png`} alt={`Gem ${id}`} className="w-3/4 h-3/4 object-contain" />
                        ) : (
                            <span className="text-gray-700 font-bold">?</span>
                        )}
                        
                        {isEquipped && (
                            <div className="absolute -top-2 -right-2 bg-[var(--neon-green)] text-black p-1 rounded-full">
                                <User size={12} />
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
      </div>
    </div>
  );
}
