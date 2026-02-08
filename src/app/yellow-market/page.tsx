"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { ArrowLeft, Zap, ShoppingCart, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { useNitrolite } from "@/hooks/useNitrolite"; // Real SDK Hook

export default function YellowMarketPage() {
  const {
      connect,
      createSession,
      sendPayment,
      closeSession,
      depositToCustody,
      status: networkStatus,
      sessionId,
      stateVersion,
      currentAllocations,
      logs: nitroLogs,
      isAuthenticated,
      isSessionActive,
      reconnect,
  } = useNitrolite();

  const [isSettling, setIsSettling] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1.0');
  const { addGold } = useGameStore();

  // Combine logs mainly from Nitrolite
  const logs = nitroLogs;

  const handleConnect = async () => {
      await connect();
  };

  const handleDeposit = async () => {
      if (!depositAmount || isNaN(Number(depositAmount))) return;
      setIsDepositing(true);
      try {
          // Convert to USDC units (6 decimals)
          const amountUnits = BigInt(Math.floor(parseFloat(depositAmount) * 1000000));
          const tx = await depositToCustody(amountUnits);
          if (tx) {
              // Automatically move to create session after successful deposit (in a real app, wait for confirmation)
              // For now, we simulate the flow continuing
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsDepositing(false);
      }
  };

  const handleCreateSession = async () => {
      // Use the deposited amount for session creation
      const amountUnits = BigInt(Math.floor(parseFloat(depositAmount) * 1000000));
      await createSession(amountUnits);
  };

  const handleSettle = async () => {
      try {
          setIsSettling(true);

          if (!sessionId) return;

          // Use SDK's closeSession to properly close the channel
          const result = await closeSession();

          if (result) {
              console.log("Session closed. Final allocations:", result.allocations);
          }

      } catch (err) {
          console.error("Settlement Failed:", err);
      } finally {
          setIsSettling(false);
      }
  };

  const handlePurchase = async (item: string, cost: number) => {
      // Convert cost to USDC units (6 decimals)
      const amountUnits = BigInt(Math.floor(cost * 1000000));
      await sendPayment(amountUnits);

      // Give gold based on item (simplified for demo)
      const goldAmounts: Record<string, number> = {
          "Rocket Pack": 500,
          "Infinite Lives": 2000,
          "Gold Chest (5k)": 5000,
          "Mystery Box": Math.floor(Math.random() * 1000) + 100,
      };
      addGold(goldAmounts[item] || 500);
  };

  const sessionActive = isSessionActive && !!sessionId;

  // Determine which UI stage to show in the control panel
  const renderControlPanel = () => {
      if (sessionActive) {
          return (
              <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-500 font-bold text-xs">CHANNEL ACTIVE</span>
                  </div>
                  <div className="text-xs font-mono text-gray-400 space-y-2">
                      <div className="flex justify-between">
                          <span>Latency</span>
                          <span className="text-white">~12ms</span>
                      </div>
                      <div className="flex justify-between">
                          <span>Session</span>
                          <span className="text-white">{sessionId ? sessionId.slice(0,8) + '...' : 'Pending...'}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2">
                          <span>Settlement</span>
                          <span className="text-[var(--neon-blue)] font-bold">Base Sepolia</span>
                      </div>
                  </div>
                  <button 
                      onClick={handleSettle}
                      disabled={isSettling}
                      className="w-full py-2 bg-[var(--neon-blue)]/10 hover:bg-[var(--neon-blue)]/20 text-[var(--neon-blue)] border border-[var(--neon-blue)]/50 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                      {isSettling ? "Settling..." : "Close Channel"}
                  </button>
              </div>
          );
      }

      if (!isAuthenticated) {
           return (
              <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-dashed border-gray-700 mx-auto animate-spin-slow" />
                  <p className="text-xs text-gray-500">Not Connected</p>
                  <button 
                      onClick={handleConnect}
                      className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                  >
                      Connect to Yellow
                  </button>
                  <button 
                      onClick={() => reconnect()}
                      className="text-[10px] text-gray-600 hover:text-red-400 underline decoration-dotted transition-colors"
                  >
                      Reset Connection
                  </button>
              </div>
           );
      }

      // Authenticated but no session: Show Deposit/Start Flow
      return (
          <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl space-y-3">
                  <label className="text-xs text-gray-400 block">1. Deposit USDC (Base Sepolia)</label>
                  <div className="flex gap-2">
                      <input 
                          type="number" 
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-20 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-sm text-center"
                      />
                      <button 
                          onClick={handleDeposit}
                          disabled={isDepositing}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors border border-white/5"
                      >
                          {isDepositing ? "Depositing..." : "Deposit to Custody"}
                      </button>
                  </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl space-y-3 opacity-100">
                  <label className="text-xs text-gray-400 block">2. Start Session</label>
                  <button 
                      onClick={handleCreateSession}
                      disabled={isDepositing} // Wait for deposit
                      className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                  >
                      Open Channel
                  </button>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/assets/Background/space-nebula.jpg')] bg-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 to-black pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-12">
            <Link href="/" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition text-white">
                <ArrowLeft />
            </Link>
            <div>
                <h1 className="text-4xl font-black text-yellow-500 uppercase tracking-tighter flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 text-black flex items-center justify-center text-2xl font-serif">Y</div>
                    Yellow Market
                </h1>
                <p className="text-gray-400 font-mono text-sm mt-1">Off-Chain State Channel • Instant Finality</p>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Col: Session Control */}
            <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                        State Channel Status
                    </h3>
                    {renderControlPanel()}
                </div>

                {/* Live Logs */}
                <div className="bg-black/50 border border-white/5 p-4 rounded-xl font-mono text-[10px] text-green-500 h-[200px] overflow-hidden relative">
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-gray-600">
                        DEBUG LOG
                    </div>
                    <div className="flex flex-col gap-1 mt-4">
                        {logs.length === 0 && <span className="text-gray-700 opacity-50">Waiting for activity...</span>}
                        {logs.map((log, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="border-l-2 border-green-900 pl-2"
                            >
                                <span className="opacity-50 text-gray-500">[{new Date().toLocaleTimeString().split(' ')[0]}]</span> {log}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Col: Market Items */}
            <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { name: "Rocket Pack", price: 1.99, icon: "/assets/SpecialGems/42.png", bonus: "Instant" },
                        { name: "Infinite Lives", price: 4.99, icon: "/assets/SpecialGems/50.png", bonus: "1 Hour" },
                        { name: "Gold Chest (5k)", price: 9.99, icon: "/assets/SpecialGems/47.png", bonus: "Best Value" },
                        { name: "Mystery Box", price: 0.99, icon: "/assets/SpecialGems/23.png", bonus: "Random" }, // Fallback to a known good or text if missing
                    ].map((item, i) => (
                        <div key={i} className={`relative p-6 rounded-2xl border transition-all ${sessionActive ? "bg-white/5 border-white/10 hover:border-yellow-500/50 group cursor-pointer" : "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"}`}>
                           <div className="flex justify-between items-start mb-4">
                               <div className="w-16 h-16 group-hover:scale-110 transition-transform flex items-center justify-center bg-white/5 rounded-xl">
                                   {/* Fallback to simple circle if image fails, but using new assets */}
                                   <img src={item.icon} alt={item.name} className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" onError={(e) => e.currentTarget.src = "/logo.png"} />
                               </div>
                               <div className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                   {item.bonus}
                                </div>
                           </div>
                           <h3 className="font-bold text-lg text-white mb-1">{item.name}</h3>
                           <p className="text-2xl font-black text-white mb-4">${item.price}</p>
                           
                           <button 
                                disabled={!sessionActive}
                                onClick={() => handlePurchase(item.name, item.price)}
                                className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
                           >
                               {sessionActive ? (
                                   "Buy Instantly"
                               ) : (
                                   "Connect First"
                               )}
                           </button>
                        </div>
                    ))}
                </div>

                <div className="bg-[var(--neon-blue)]/5 border border-[var(--neon-blue)]/20 p-6 rounded-2xl flex items-center gap-6">
                    <div>
                        <h4 className="text-white font-bold text-lg">Settlement Info</h4>
                        <p className="text-sm text-gray-400 mt-1 max-w-md">
                            All purchases are signed off-chain. Balance is locked in the Smart Contract on Base Sepolia and only settled when you close the channel.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
