import { create } from 'zustand';
import { Board, Position } from '@/lib/types';
import { initializeBoard, swapGems, findMatches, removeMatches, applyGravity } from '@/lib/game/engine';

interface GameState {
    board: Board;
    selectedGem: Position | null;
    score: number;
    moves: number;
    isProcessing: boolean;

    // Actions
    initializeGame: () => void;
    selectGem: (pos: Position) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
    board: [],
    selectedGem: null,
    score: 0,
    moves: 0,
    isProcessing: false,

    initializeGame: () => {
        set({ board: initializeBoard(), score: 0, moves: 0, isProcessing: false });
    },

    selectGem: async (pos: Position) => {
        const { board, selectedGem, isProcessing } = get();
        if (isProcessing) return;

        if (!selectedGem) {
            set({ selectedGem: pos });
            return;
        }

        if (selectedGem.x === pos.x && selectedGem.y === pos.y) {
            set({ selectedGem: null });
            return;
        }

        const dx = Math.abs(selectedGem.x - pos.x);
        const dy = Math.abs(selectedGem.y - pos.y);

        if (dx + dy !== 1) {
            set({ selectedGem: pos });
            return;
        }

        // Valid adjacent swap
        set({ isProcessing: true, selectedGem: null });

        const newBoard = swapGems(board, selectedGem, pos);
        set({ board: newBoard });

        // Wait for swap animation (mock)
        await new Promise(r => setTimeout(r, 300));

        const matchResult = findMatches(newBoard);

        if (matchResult.matches.length > 0) {
            // Valid swap with matches
            set(state => ({ score: state.score + matchResult.score, moves: state.moves + 1 }));
            let currentBoard = newBoard;

            // Cascade loop
            while (true) {
                const matches = findMatches(currentBoard);
                if (matches.matches.length === 0) break;

                // Remove matches
                currentBoard = removeMatches(currentBoard, matches.matches);
                set({ board: currentBoard });
                await new Promise(r => setTimeout(r, 300));

                // Apply gravity
                currentBoard = applyGravity(currentBoard);
                set({ board: currentBoard });
                await new Promise(r => setTimeout(r, 300));

                // Add cascade score
                set(state => ({ score: state.score + matches.score }));
            }
        } else {
            // Invalid swap, revert
            const revertedBoard = swapGems(newBoard, pos, selectedGem);
            set({ board: revertedBoard });
        }

        set({ isProcessing: false });
    },
}));
