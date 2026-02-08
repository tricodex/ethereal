"use client";

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useYellowChannel } from '@/hooks/useYellowChannel';

export function YellowGameObserver() {
    const { score, moves, currentLevelId } = useGameStore();
    const { session, submitGameState } = useYellowChannel();
    const lastMovesRef = useRef(moves);

    useEffect(() => {
        // Only submit if:
        // 1. We have an active session
        // 2. Moves have increased (game state changed)
        // 3. Score > 0 (optimisation)
        if (session && session.status === 'active' && moves > lastMovesRef.current) {
            
            const state = {
                channelId: session.channelId,
                score: score,
                moves: moves,
                level: currentLevelId,
                timestamp: Date.now(),
            };

            // Fire and forget (or handle error if needed)
            submitGameState(state).then(success => {
                if (success) {
                    console.log(`[Yellow] State Synced: Score ${score}, Moves ${moves}`);
                }
            });

            lastMovesRef.current = moves;
        }
    }, [moves, score, currentLevelId, session, submitGameState]);

    // Also sync on level completion logic if needed, but moves covers most cases
    // Reset ref on level change
    useEffect(() => {
        lastMovesRef.current = 0;
    }, [currentLevelId]);

    return null; // Headless component
}
