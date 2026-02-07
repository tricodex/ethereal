import { create } from 'zustand';
import { Board, Position, Level, MatchResult } from '@/lib/types';
import { initializeBoard, swapGems, findMatches, removeMatches, applyGravity, checkSpecialInteraction, checkGoldCollection } from '@/lib/game/engine';
import { LEVELS } from '@/lib/game/levels';
import { FloatingText } from '@/components/game/FloatingScore';

interface GameState {
    board: Board;
    selectedGem: Position | null;
    score: number;
    moves: number;
    isProcessing: boolean;
    isGameOver: boolean;

    // Level State
    currentLevelId: number;
    levelConfig: Level | null;
    collectedEth: number;
    collectedGold: number; // New
    comboCount: number;
    floatingTexts: FloatingText[];

    // Actions
    initializeGame: (levelId?: number) => void;
    selectGem: (pos: Position) => Promise<void>;
    nextLevel: () => void;
    addFloatingText: (text: Omit<FloatingText, 'id'>) => void;

    // Debug
    debugUnlockAll: boolean;
    setDebugUnlockAll: (unlocked: boolean) => void;
}

const DEFAULT_LEVEL = LEVELS[0];

export const useGameStore = create<GameState>((set, get) => ({
    board: [],
    selectedGem: null,
    score: 0,
    moves: 0,
    isProcessing: false,
    isGameOver: false,

    currentLevelId: 1,
    levelConfig: DEFAULT_LEVEL,
    collectedEth: 0,
    collectedGold: 0,
    comboCount: 0,
    floatingTexts: [],

    addFloatingText: (item) => {
        const id = Math.random().toString(36).substr(2, 9);
        set(state => ({ floatingTexts: [...state.floatingTexts, { ...item, id }] }));
        setTimeout(() => {
            set(state => ({ floatingTexts: state.floatingTexts.filter(t => t.id !== id) }));
        }, 1200);
    },

    debugUnlockAll: false,
    setDebugUnlockAll: (unlocked) => set({ debugUnlockAll: unlocked }),

    initializeGame: (levelId?: number) => {
        const targetLevelId = levelId || get().currentLevelId;
        const config = LEVELS.find(l => l.id === targetLevelId) || DEFAULT_LEVEL;

        set({
            board: initializeBoard(config.iceCount || 0, config.rockCount || 0, config.goldPreload || 0),
            score: 0,
            moves: 0,
            isProcessing: false,
            isGameOver: false,
            currentLevelId: targetLevelId,
            levelConfig: config,
            collectedEth: 0,
            collectedGold: 0,
            comboCount: 0,
            floatingTexts: []
        });
    },

    nextLevel: () => {
        const { currentLevelId } = get();
        const nextId = currentLevelId + 1;
        if (LEVELS.find(l => l.id === nextId)) {
            get().initializeGame(nextId);
        }
    },

    selectGem: async (pos: Position) => {
        const { board, selectedGem, isProcessing, isGameOver, moves, levelConfig, collectedEth } = get();
        if (isProcessing || isGameOver || !levelConfig) return;

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

        // Check for Special Gem Interactions (Prioritize over Match-3)
        // Check for Special Gem Interactions (Prioritize over Match-3)
        // Find full Gem objects from positions
        const gem1 = newBoard[selectedGem.y][selectedGem.x];
        const gem2 = newBoard[pos.y][pos.x];

        let matchResult: MatchResult; // Explicitly type matchResult here

        if (gem1 && gem2) {
            const interaction = checkSpecialInteraction(newBoard, gem1, gem2);
            if (interaction.triggered) {
                matchResult = {
                    matches: interaction.matches,
                    transformations: [],
                    score: interaction.score
                };
            } else {
                matchResult = findMatches(newBoard);
            }
        } else {
            matchResult = findMatches(newBoard);
        }

        if (matchResult.matches.length > 0) {
            // Valid swap with matches or special interaction
            const newMoves = moves + 1;

            // Calculate ETH gems collected
            const ethCollectedInTurn = matchResult.matches.filter(g => g.color === 7).length;
            const totalEth = collectedEth + ethCollectedInTurn;

            set(state => ({
                score: state.score + matchResult.score,
                moves: newMoves,
                collectedEth: state.collectedEth + ethCollectedInTurn
            }));

            // Check Win Condition (Target Score + Objectives)
            const objectiveMet = !levelConfig.objectives?.some(obj =>
                obj.type === 'collect_eth' && totalEth < obj.count
            );

            if (objectiveMet && (get().score >= levelConfig.targetScore)) {
                set({ isGameOver: true });
            } else if (newMoves >= levelConfig.moves) {
                set({ isGameOver: true });
            }

            let currentBoard = newBoard;
            let comboCount = 1;

            // Initial removal with transformations
            currentBoard = removeMatches(currentBoard, matchResult.matches, matchResult.transformations);

            // Floating Text for Initial Match
            const centerGem = matchResult.matches[Math.floor(matchResult.matches.length / 2)];
            if (centerGem) {
                const xPos = centerGem.x * 60 + 30; // approx center of tile
                const yPos = centerGem.y * 60;
                get().addFloatingText({ x: xPos, y: yPos, text: `+${matchResult.score}`, color: '#ffff00' });
            }

            set({ board: currentBoard, comboCount: 1 });
            await new Promise(r => setTimeout(r, 400)); // Initial match hesitation

            // Cascade loop
            while (true) {
                // Apply gravity
                currentBoard = applyGravity(currentBoard);

                // Check Gold Collection (New)
                const goldCheck = checkGoldCollection(currentBoard);
                if (goldCheck.count > 0) {
                    currentBoard = applyGravity(goldCheck.board); // Fill gaps from collected gold
                    // Add gold score
                    const goldScore = goldCheck.count * 500;
                    const accumulatedGold = get().collectedGold || 0;

                    set(state => ({
                        score: state.score + goldScore,
                        collectedGold: (state.collectedGold || 0) + goldCheck.count
                    }));

                    get().addFloatingText({
                        x: 200, y: 500, // Approximate mid-bottom
                        text: `GOLD COLLECTED! +${goldScore}`,
                        color: '#ffd700'
                    });
                }

                set({ board: currentBoard });
                await new Promise(r => setTimeout(r, 300)); // Drop speed

                const cascadeMatches = findMatches(currentBoard);
                if (cascadeMatches.matches.length === 0) break;

                comboCount++;

                // Remove cascade matches (faster delay for combos)
                // Pass transformations if any (recursive special generation!)
                currentBoard = removeMatches(
                    currentBoard,
                    cascadeMatches.matches,
                    cascadeMatches.transformations
                );

                // Bonus score for combo
                const comboBonus = comboCount * 50;
                const turnScore = cascadeMatches.score + comboBonus;

                // Floating Text for Cascade
                const cascadeCenter = cascadeMatches.matches[Math.floor(cascadeMatches.matches.length / 2)];
                if (cascadeCenter) {
                    const xPos = cascadeCenter.x * 60 + 30;
                    const yPos = cascadeCenter.y * 60;
                    get().addFloatingText({ x: xPos, y: yPos, text: `+${turnScore}`, color: comboCount > 2 ? '#ff00ff' : '#00ff00' });
                }

                set(state => ({
                    board: currentBoard,
                    score: state.score + turnScore,
                    comboCount: comboCount
                }));

                // Speed up combos: "fast but one by one"
                await new Promise(r => setTimeout(r, Math.max(150, 400 - (comboCount * 50))));
            }

            // Turn ended
            setTimeout(() => set({ comboCount: 0 }), 1000);
        } else {
            // Invalid swap, revert
            const revertedBoard = swapGems(newBoard, pos, selectedGem);
            set({ board: revertedBoard });
        }

        set({ isProcessing: false });
    },
}));
