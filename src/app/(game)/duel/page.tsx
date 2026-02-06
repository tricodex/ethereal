"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { Loader2, Swords } from "lucide-react";
import clsx from "clsx";

const STAKES = [0.5, 1, 2, 5];

export default function DuelPage() {
  const [selectedStake, setSelectedStake] = useState<number | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const router = useRouter();
  const { isConnected } = useAccount();
  
  // TODO: Use real contract ABI
  // const { writeContractAsync } = useWriteContract();

  const handleStartDuel = async () => {
    if (!selectedStake || !isConnected) return;
    setIsLocking(true);

    try {
        // Mock Contract Interaction
        // await writeContractAsync({ ... })
        
        await new Promise(r => setTimeout(r, 2000)); // Simulate tx
        
        // Redirect to match (using random match ID)
        const matchId = Math.random().toString(36).substring(7);
        router.push(`/play?mode=duel&matchId=${matchId}&stake=${selectedStake}`);
        
    } catch (e) {
        console.error(e);
        setIsLocking(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] gap-10 p-4">
      <div className="text-center space-y-4">
        <Swords size={64} className="mx-auto text-[var(--neon-pink)] animate-pulse" />
        <h1 className="text-5xl font-black tracking-tighter text-white">
          COMPETITIVE <span className="text-[var(--neon-pink)]">DUEL</span>
        </h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Wager USDC against other players. Winner takes the pot.
          Fair play enforced by Arc.
        </p>
      </div>

      {!isConnected ? (
        <div className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur">
          <p className="text-[var(--neon-blue)] font-mono mb-4 text-center">CONNECT WALLET TO PLAY</p>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-8">
            <div className="grid grid-cols-2 gap-4">
                {STAKES.map((amount) => (
                    <button
                        key={amount}
                        onClick={() => setSelectedStake(amount)}
                        className={clsx(
                            "relative p-6 rounded-xl border-2 transition-all group overflow-hidden",
                            selectedStake === amount 
                                ? "border-[var(--neon-green)] bg-[var(--neon-green)]/10 shadow-[0_0_20px_var(--neon-green)]" 
                                : "border-white/10 hover:border-white/30 bg-white/5"
                        )}
                    >
                        <span className="text-3xl font-black text-white group-hover:scale-110 block transition-transform">
                            ${amount}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">USDC</span>
                    </button>
                ))}
            </div>

            <button
                disabled={!selectedStake || isLocking}
                onClick={handleStartDuel}
                className={clsx(
                    "w-full py-4 rounded-xl font-bold text-xl uppercase tracking-widest transition-all",
                    !selectedStake 
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-[var(--neon-pink)] text-white shadow-[0_0_30px_var(--neon-pink)] hover:scale-[1.02] active:scale-95"
                )}
            >
                {isLocking ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" /> LOCKING FUNDS...
                    </span>
                ) : (
                    "FIND MATCH"
                )}
            </button>
        </div>
      )}
    </main>
  );
}
