"use client";

import { useGameStore } from "@/store/gameStore";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Gift, X } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

export const DailyRewardModal = () => {
    const { checkDailyLogin, loginStreak, lastLoginDate } = useGameStore();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check login on mount
        const now = new Date().toISOString().split('T')[0];
        // If not logged in today, show modal
        if (lastLoginDate !== now) {
            checkDailyLogin(); // This updates streak/date
            setIsOpen(true);
        }
    }, []);

    if (!isOpen) return null;

    const days = [1, 2, 3, 4, 5, 6, 7];
    const rewards = [500, 1000, 1500, 2000, 2500, 3000, 5000];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-900 border-2 border-[var(--neon-blue)] rounded-3xl p-8 max-w-2xl w-full relative shadow-[0_0_50px_rgba(0,243,255,0.2)]"
            >
                <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>

                <h2 className="text-3xl font-black text-center text-white mb-2 uppercase tracking-widest">
                    Daily Rewards
                </h2>
                <p className="text-center text-[var(--neon-blue)] mb-8">Login daily to earn massive Gold!</p>

                <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-8">
                    {days.map((day, i) => {
                        const isToday = day === loginStreak;
                        const isPast = day < loginStreak;
                        const reward = rewards[i];

                        return (
                            <div 
                                key={day}
                                className={clsx(
                                    "aspect-[2/3] rounded-xl flex flex-col items-center justify-center gap-2 p-2 border-2 transition-all",
                                    isToday 
                                        ? "border-[var(--neon-green)] bg-[var(--neon-green)]/10 scale-110 shadow-[0_0_20px_var(--neon-green)] z-10"
                                        : isPast 
                                            ? "border-gray-700 bg-gray-800/50 opacity-50"
                                            : "border-gray-700 bg-gray-900"
                                )}
                            >
                                <span className="text-gray-400 text-xs font-bold">DAY {day}</span>
                                {isPast ? (
                                    <Check className="text-green-500" />
                                ) : (
                                    <Gift className={isToday ? "text-[var(--neon-yellow)] animate-bounce" : "text-gray-600"} />
                                )}
                                <span className={clsx(
                                    "font-bold text-xs",
                                    isToday ? "text-white" : "text-gray-500"
                                )}>
                                    {reward}
                                </span>
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-center">
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="bg-[var(--neon-green)] text-black font-black text-xl px-12 py-3 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_var(--neon-green)]"
                    >
                        CLAIM
                    </button>
                </div>

            </motion.div>
        </div>
    );
};
