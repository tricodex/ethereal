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
        // 3. Score has changed meaningfully
        if (isSessionActive && sessionId && moves > lastMovesRef.current) {

            // Calculate the score difference (reward/penalty for the move)
            const scoreDelta = score - lastScoreRef.current;

            // For now, we just log the sync. In a full implementation,
            // we might send micro-payments based on performance:
            // - Positive delta: player earning rewards
            // - Negative delta: player losing stake
            if (scoreDelta !== 0) {
                addLog(`🎮 Move ${moves}: Score ${scoreDelta > 0 ? '+' : ''}${scoreDelta}`);
            }

            lastMovesRef.current = moves;
            lastScoreRef.current = score;
        }
    }, [moves, score, isSessionActive, sessionId, addLog]);

    // Reset refs on level change
    useEffect(() => {
        lastMovesRef.current = 0;
        lastScoreRef.current = 0;
    }, [currentLevelId]);

    return null; // Headless component
}
