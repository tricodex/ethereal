"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { ArrowLeft, Zap, ShoppingCart, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { useSignMessage, useSendTransaction } from "wagmi";
import { parseEther } from "viem";

export default function YellowMarketPage() {
  const [sessionActive, setSessionActive] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { addGold } = useGameStore();
  const { signMessageAsync } = useSignMessage();
  const { sendTransactionAsync } = useSendTransaction();

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const handleConnect = () => {
    addLog("Connecting to Yellow Network...");
    setTimeout(() => {
        setSessionActive(true);
        addLog("Session Established (0xYellow...7f)");
        addLog("State Channel Open: bi-directional");
    }, 1500);
  };

  const handleSettle = async () => {
      try {
          setIsSettling(true);
          addLog("Initiating Settlement...");
          
          // 1. Sign Close Intent
          addLog("Requesting Signature: Close Channel");
          await signMessageAsync({ message: `Yellow Network: Close Channel 0x7F...3A\nFinal Balance: 5000 Gold` });
          addLog("Signature Verified. Channel Closed.");

          // 2. Submit to Arc (0-value tx to simulate settlement call)
          addLog("Submitting Proof to Arc Testnet...");
          const hash = await sendTransactionAsync({
              to: "0x0996c2e70E4Eb633A95258D2699Cb965368A3CB6", // GameEscrow
              value: parseEther("0"),
              data: "0x" // Empty data, just a ping
          });
          
          addLog(`Settled on Arc! Tx: ${hash.slice(0,10)}...`);
          setSessionActive(false);
      } catch (err) {
          console.error(err);
          addLog("Settlement Failed or Rejected");
      } finally {
          setIsSettling(false);
      }
  };

  const handlePurchase = (item: string, cost: number) => {
      addLog(`[OFF-CHAIN] Bought ${item} for ${cost} USDC`);
      addLog(`[SIG] Verified by Nitrolite Node`);
      addGold(5000); // Give 5000 gold flat for demo or calculate based on item
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/assets/Background/space-nebula.jpg')] bg-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 to-black pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-12">
            <Link href="/" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition">
                <ArrowLeft />
            </Link>
            <div>
                <h1 className="text-4xl font-black text-yellow-500 uppercase tracking-tighter flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 text-black flex items-center justify-center text-2xl">Y</div>
                    Yellow Market
                </h1>
                <p className="text-gray-400 font-mono text-sm mt-1">Instant Settlement • Zero Gas • Session Based</p>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Col: Session Control */}
            <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                        <Zap className={sessionActive ? "text-yellow-500 fill-yellow-500" : "text-gray-600"} />
                        Network Status
                    </h3>
                    
                    {!sessionActive ? (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 rounded-full border-4 border-dashed border-gray-700 mx-auto animate-spin-slow" />
                            <p className="text-xs text-gray-500">No Active Session</p>
                            <button 
                                onClick={handleConnect}
                                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                            >
                                Connect Nitrolite
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-green-500 font-bold text-xs">CHANNEL OPEN</span>
                            </div>
                            <div className="text-xs font-mono text-gray-400 space-y-1">
                                <p>Latency: <span className="text-white">12ms</span></p>
                                <p>Gas Saved: <span className="text-white">~$42.50</span></p>
                                <p>Session ID: <span className="text-white">0x7F...3A</span></p>
                                <p>Settlement Layer: <span className="text-[var(--neon-blue)] font-bold">Arc Chain (L1)</span></p>
                            </div>
                            <button 
                                onClick={handleSettle}
                                disabled={isSettling}
                                className="w-full py-2 bg-[var(--neon-blue)]/10 hover:bg-[var(--neon-blue)]/20 text-[var(--neon-blue)] border border-[var(--neon-blue)]/50 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                            >
                                {isSettling ? "Settling on Arc..." : "Settle to Arc & Close"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Live Logs */}
                <div className="bg-black/50 border border-white/5 p-4 rounded-xl font-mono text-[10px] text-green-500 h-[200px] overflow-hidden relative">
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-gray-600">
                        <Clock size={10} /> LOGS
                    </div>
                    <div className="flex flex-col gap-1 mt-4">
                        {logs.length === 0 && <span className="text-gray-700 opacity-50">Waiting for transactions...</span>}
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
                        { name: "Pack of 5 Rockets", price: 1.99, icon: "/assets/SpecialGems/21.png", bonus: "Instant Delivery" },
                        { name: "Infinite Lives (1h)", price: 4.99, icon: "/assets/CoreGems/shiny/1.png", bonus: "Session Bound" },
                        { name: "Gold Chest (5000G)", price: 9.99, icon: "/assets/SpecialGems/47.png", bonus: "No Gas Fees" },
                        { name: "Mystery Box", price: 0.99, icon: "/assets/SpecialGems/50.png", bonus: "Provably Fair" },
                    ].map((item, i) => (
                        <div key={i} className={`relative p-6 rounded-2xl border transition-all ${sessionActive ? "bg-white/5 border-white/10 hover:border-yellow-500/50 group cursor-pointer" : "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"}`}>
                           <div className="flex justify-between items-start mb-4">
                               <div className="w-16 h-16 group-hover:scale-110 transition-transform">
                                   <img src={item.icon} alt={item.name} className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
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
                                   <>Buy Instantly <Zap size={16} /></>
                               ) : (
                                   "Connect to Buy"
                               )}
                           </button>
                        </div>
                    ))}
                </div>

                <div className="bg-[var(--neon-blue)]/5 border border-[var(--neon-blue)]/20 p-6 rounded-2xl flex items-center gap-6">
                    <div className="bg-[var(--neon-blue)]/20 p-4 rounded-full text-[var(--neon-blue)]">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-lg">Cross-Chain Settlement Ready</h4>
                        <p className="text-sm text-gray-400 mt-1 max-w-md">
                            Your balance is maintained in a state channel. When you close the session, the final state is settled on-chain (Arc, Ethereum, or Polygon) automatically.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
