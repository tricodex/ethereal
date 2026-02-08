"use client";

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export const BackgroundMusic = () => {
    const { isMusicMuted, toggleMusic } = useGameStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        // Create audio instance
        const audio = new Audio('/game.mp3');
        audio.loop = true;
        audio.volume = 0.3; // Lower volume for background
        audioRef.current = audio;

        // Cleanup
        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, []);

    // Handle Play/Pause based on store state and interaction
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMusicMuted) {
            audio.pause();
        } else {
            // Try to play
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Auto-play was prevented
                    console.warn("Autoplay prevented:", error);
                    // We can't force it. Waiting for interaction.
                });
            }
        }
    }, [isMusicMuted, hasInteracted]);

    // Global click listener to unlock audio context if needed
    useEffect(() => {
        const handleInteraction = () => {
            if (!hasInteracted) {
                setHasInteracted(true);
                // If not muted, try playing again now that we have interaction
                if (!isMusicMuted && audioRef.current) {
                    audioRef.current.play().catch(console.error);
                }
            }
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        
        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [hasInteracted, isMusicMuted]);

    return null; // Headless component
};
