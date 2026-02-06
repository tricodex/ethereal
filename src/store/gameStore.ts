import { create } from 'zustand';
import { Board, Position } from '@/lib/types';
import { initializeBoard, swapGems, findMatches, removeMatches, applyGravity } from '@/lib/game/engine';

interface GameState {
    board: Board;
    selectedGem: Position | null;
    score: number;
    moves: number;
    isProcessing: boolean;

    isGameOver: boolean;

    // Actions
    initializeGame: () => void;
    selectGem: (pos: Position) => Promise<void>;
}

const MAX_MOVES = 30;

export const useGameStore = create<GameState>((set, get) => ({
    board: [],
    selectedGem: null,
    score: 0,
    moves: 0,
    isProcessing: false,
    isGameOver: false,

    initializeGame: () => {
        set({ board: initializeBoard(), score: 0, moves: 0, isProcessing: false, isGameOver: false });
    },

    selectGem: async (pos: Position) => {
        const { board, selectedGem, isProcessing, isGameOver, moves } = get();
        if (isProcessing || isGameOver) return;

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
            const newMoves = moves + 1;
            set(state => ({ score: state.score + matchResult.score, moves: newMoves }));

            if (newMoves >= MAX_MOVES) {
                set({ isGameOver: true });
            }

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
