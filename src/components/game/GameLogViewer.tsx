"use client";

import { useNitrolite } from "@/hooks/useNitrolite";
import { useState, useRef, useEffect } from "react";
import { Terminal, X, Minimize2, Maximize2 } from "lucide-react";

export const GameLogViewer = () => {
    const { logs, isConnected, isSessionActive } = useNitrolite();
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isOpen]);

    // Only show if there's activity or manually opened
    if (!isConnected && logs.length === 0) return null;

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-black/80 border border-[var(--neon-blue)] rounded-lg hover:bg-black/90 transition-all group shadow-[0_0_15px_rgba(0,243,255,0.3)]"
            >
                <Terminal size={16} className="text-[var(--neon-blue)] group-hover:animate-pulse" />
                <span className="text-[var(--neon-blue)] font-mono text-xs font-bold">
                    WAITLOG {logs.length > 0 && `(${logs.length})`}
                </span>
                {isSessionActive && (
                    <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse ml-2" />
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 w-[350px] md:w-[450px] bg-black/90 border border-[var(--neon-blue)] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--neon-blue)]/10 border-b border-[var(--neon-blue)]/30">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-[var(--neon-blue)]" />
                    <span className="text-[var(--neon-blue)] font-mono text-xs font-bold uppercase tracking-wider">
                        Yellow State Channel logs
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-[var(--neon-blue)]/20 rounded text-[var(--neon-blue)] transition-colors"
                    >
                        <Minimize2 size={14} />
                    </button>
                </div>
            </div>

            {/* Logs Area */}
            <div 
                ref={scrollRef}
                className="h-64 overflow-y-auto p-3 font-mono text-[10px] space-y-1 scrollbar-thin scrollbar-thumb-[var(--neon-blue)]/20 scrollbar-track-transparent"
            >
                {logs.length === 0 ? (
                    <div className="text-gray-500 italic">No activity yet...</div>
                ) : (
                    logs.map((log, i) => {
                        const isError = log.includes("❌");
                        const isSuccess = log.includes("✅") || log.includes("✓");
                        const isState = log.includes("📊") || log.includes("💸");
                        
                        return (
                            <div key={i} className={`
                                break-all leading-relaxed
                                ${isError ? "text-red-400" : ""}
                                ${isSuccess ? "text-[var(--neon-green)]" : ""}
                                ${isState ? "text-[var(--neon-yellow)]" : "text-gray-300"}
                            `}>
                                <span className="opacity-50 mr-2">{log.split("]")[0]}]</span>
                                {log.split("]")[1]}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
