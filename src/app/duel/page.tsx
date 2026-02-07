"use client";

import { motion } from "framer-motion";
import { Swords, Users, Wallet } from "lucide-react";

export default function DuelPage() {
  return (
    <div className="min-h-screen pt-24 pb-10 px-4 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-blue)] drop-shadow-[0_0_15px_rgba(255,0,255,0.5)]">
            PVP DUELS
        </h1>
        <p className="text-[var(--neon-blue)] font-mono tracking-widest uppercase mt-4">
            Wager USDC • Crush Opponents • Take All
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {[
            { title: "Real-Time Battle", icon: Swords, desc: "Head-to-head match-3 action against real players." },
            { title: "Wager & Win", icon: Wallet, desc: "Put your USDC on the line. Winner takes the pot." },
            { title: "Global Ranking", icon: Users, desc: "Climb the ELO ladder and become the Duel Master." }
        ].map((item, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center hover:border-[var(--neon-pink)]/50 transition-colors group"
            >
                <div className="w-16 h-16 mx-auto bg-[var(--neon-pink)]/10 rounded-full flex items-center justify-center text-[var(--neon-pink)] mb-6 group-hover:scale-110 transition-transform">
                    <item.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 font-mono text-sm">{item.desc}</p>
            </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 p-6 rounded-2xl bg-[var(--neon-blue)]/10 border border-[var(--neon-blue)] text-center max-w-lg"
      >
        <p className="text-[var(--neon-blue)] font-mono font-bold animate-pulse">
            DUEL ARENA UNDER CONSTRUCTION
        </p>
        <p className="text-gray-400 text-sm mt-2">
            The developers are currently forging the multiplayer servers. Check back soon.
        </p>
      </motion.div>
    </div>
  );
}
