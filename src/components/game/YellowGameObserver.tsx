"use client";

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useNitrolite } from '@/hooks/useNitrolite';

/**
 * YellowGameObserver - Headless component that syncs game state to Yellow Network
 *
 * This component observes game state changes and submits them to the state channel
 * using the Nitrolite SDK. Each move triggers a state update with the new allocations.
 */
export function YellowGameObserver() {
    const { score, moves, currentLevelId } = useGameStore();
    const { isSessionActive, sessionId, sendPayment, addLog } = useNitrolite();
    const lastMovesRef = useRef(moves);
    const lastScoreRef = useRef(score);

    useEffect(() => {
        // Only sync if:
        // 1. We have an active session
        // 2. Moves have increased (game state changed)
        if (isSessionActive && sessionId && moves > lastMovesRef.current) {

            // Calculate the score difference
            const scoreDelta = score - lastScoreRef.current;

            // Trigger a state update on Yellow Network
            // Even a 0-value payment increments the state nonce/version
            // demonstrating a signed off-chain transaction.
            // If scoreDelta is positive, we could theoretically *pay* the user, 
            // but for this demo loops, we just checkpoint the state.
            sendPayment(0n).catch(console.error);

            if (scoreDelta !== 0) {
                addLog(`🎮 Move ${moves}: Syncing State (Score ${scoreDelta})`);
            }

            lastMovesRef.current = moves;
            lastScoreRef.current = score;
        }
    }, [moves, score, isSessionActive, sessionId, addLog, sendPayment]);

    // Reset refs on level change
    useEffect(() => {
        lastMovesRef.current = 0;
        lastScoreRef.current = 0;
    }, [currentLevelId]);

    return null; // Headless component
}
