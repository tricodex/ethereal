"use client";

import { useGameStore } from "@/store/gameStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Sparkles, Trophy, User, ShoppingBag, Coins, Lock, Zap } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function RewardsPage() {
  const { collectedGold, unlockedCollectibles, playerAvatar, summonGacha, setAvatar, debugFreeStore } = useGameStore();
  const [activeTab, setActiveTab] = useState<'summon' | 'shop' | 'collection'>('summon');
  const [isSummoning, setIsSummoning] = useState(false);
  const [rewardId, setRewardId] = useState<number | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Gacha Logic
  const handleSummon = () => {
    if (!debugFreeStore && collectedGold < 1000) return;
    setIsSummoning(true);
    setRewardId(null);
    
    setTimeout(() => {
        const result = summonGacha();
        if (result.success && result.rewardId) {
            setRewardId(result.rewardId);
            setIsNew(result.isNew || false);
        }
        setIsSummoning(false);
    }, 2000);
  };

  // Render Helpers
  const renderSummon = () => (
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-widest">Ether Summon</h2>
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
                        disabled={!debugFreeStore && collectedGold < 1000}
                        className={clsx(
                            "relative w-64 h-64 rounded-3xl border-4 flex flex-col items-center justify-center gap-4 transition-all duration-300",
                            (debugFreeStore || collectedGold >= 1000)
                                ? "border-[var(--neon-pink)] bg-gray-900/80 hover:scale-105 hover:shadow-[0_0_30px_var(--neon-pink)] cursor-pointer"
                                : "border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Sparkles size={64} className={(debugFreeStore || collectedGold >= 1000) ? "text-[var(--neon-pink)] animate-pulse" : "text-gray-600"} />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-white uppercase tracking-widest">SUMMON</span>
                            <span className="text-[var(--neon-yellow)] font-bold">
                                {debugFreeStore ? "FREE" : "1000 GOLD"}
                            </span>
                        </div>
                    </button>
                    {debugFreeStore && <div className="absolute top-2 right-2 bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded">FREE MODE</div>}
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
  );

  const handleBuyItem = (item: any) => {
      // Mock Purchase Logic
      if (item.name.includes("Gold")) {
          const amount = parseInt(item.amount.replace(" Gold", ""));
          useGameStore.setState(state => ({ collectedGold: (state.collectedGold || 0) + amount }));
          alert(`Purchased ${item.name}! +${amount} Gold`);
      } else {
          alert(`Purchased ${item.name}! (Feature coming soon)`);
      }
  };

  const renderShop = () => (
      <div className="w-full max-w-4xl">
          <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-widest text-center">Item Shop</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                  { name: "Pile of Gold", amount: "1000 Gold", cost: "$0.99", icon: Coins, color: "text-yellow-400" },
                  { name: "Sack of Gold", amount: "5000 Gold", cost: "$4.99", icon: Coins, color: "text-yellow-400" },
                  { name: "Chest of Gold", amount: "12000 Gold", cost: "$9.99", icon: Coins, color: "text-yellow-400" },
                  { name: "Extra Moves", amount: "+5 Moves", cost: "500 Gold", icon: Zap, color: "text-blue-400" },
                  { name: "Rocket Pack", amount: "3x Rockets", cost: "1500 Gold", icon: Sparkles, color: "text-pink-400" },
                  { name: "Bomb Pack", amount: "3x Bombs", cost: "1500 Gold", icon: Sparkles, color: "text-red-400" },
              ].map((item, i) => (
                  <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex flex-col items-center hover:bg-gray-800 transition-colors group relative">
                      {debugFreeStore && <div className="absolute top-2 right-2 bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded">FREE</div>}
                      <item.icon className={`w-12 h-12 mb-4 ${item.color} group-hover:scale-110 transition-transform`} />
                      <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{item.amount}</p>
                      <button 
                        onClick={() => handleBuyItem(item)}
                        className="bg-white/10 hover:bg-white text-white hover:text-black font-bold px-6 py-2 rounded-full transition-all border border-white/20"
                      >
                          {debugFreeStore ? "FREE" : item.cost}
                      </button>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderCollection = () => {
    const allCollectibles = Array.from({ length: 50 }, (_, i) => i + 1);
    return (
        <div className="w-full max-w-6xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
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
    );
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

      <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-8 filter drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
        REWARDS CENTER
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-12 bg-black/40 p-2 rounded-full">
          {[
              { id: 'summon', label: 'Ether Summon', icon: Sparkles },
              { id: 'shop', label: 'Item Shop', icon: ShoppingBag },
              { id: 'collection', label: 'Collection', icon: Trophy },
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                      "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all uppercase tracking-wide",
                      activeTab === tab.id
                          ? "bg-white text-black shadow-[0_0_20px_white]"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                  )}
              >
                  <tab.icon size={18} />
                  {tab.label}
              </button>
          ))}
      </div>

      {activeTab === 'summon' && renderSummon()}
      {activeTab === 'shop' && renderShop()}
      {activeTab === 'collection' && renderCollection()}

    </div>
  );
}
