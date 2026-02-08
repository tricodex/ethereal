"use client";

import { useGameStore } from "@/store/gameStore";
import { CheckCircle, Circle, Scroll } from "lucide-react";
import { useEffect } from "react";
import clsx from "clsx";

export const QuestLog = () => {
    const { dailyQuests, refreshDailyQuests, updateQuestProgress } = useGameStore();

    useEffect(() => {
        if (dailyQuests.length === 0) {
            refreshDailyQuests();
        }
    }, [dailyQuests.length]);

    return (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 w-full">
            <h3 className="text-[var(--neon-yellow)] font-bold mb-3 flex items-center gap-2 uppercase tracking-wide text-sm">
                <Scroll size={16} /> Daily Quests
            </h3>
            
            <div className="space-y-3">
                {dailyQuests.map((quest) => (
                    <div key={quest.id} className="relative group">
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className={clsx("font-medium", quest.completed ? "text-gray-500 line-through" : "text-white")}>
                                {quest.description}
                            </span>
                            <span className="text-[var(--neon-yellow)] font-mono text-xs">
                                {quest.reward} G
                            </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                                className={clsx(
                                    "h-full transition-all duration-500",
                                    quest.completed ? "bg-green-500" : "bg-[var(--neon-blue)]"
                                )}
                                style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                            />
                        </div>
                        
                        {quest.completed && (
                            <CheckCircle size={16} className="absolute -right-6 top-1 text-green-500" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
