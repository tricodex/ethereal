"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { QuestLog } from "./QuestLog";

interface QuestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const QuestModal = ({ isOpen, onClose }: QuestModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-[var(--neon-yellow)] rounded-2xl p-6 max-w-md w-full relative shadow-[0_0_30px_rgba(255,255,0,0.2)]"
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest text-center">
                    Active Quests
                </h2>

                <QuestLog />
            </motion.div>
        </div>
    );
};
