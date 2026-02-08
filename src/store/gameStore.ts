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

    // Retention State
    lastLoginDate: string | null;
    loginStreak: number;
    dailyQuests: Quest[];
    unlockedCollectibles: number[]; // IDs of SpecialGems (1-50)
    playerAvatar: number; // ID of selected SpecialGem

    // Retention Actions
    checkDailyLogin: () => void;
    refreshDailyQuests: () => void;
    updateQuestProgress: (type: QuestType, amount: number) => void;
    summonGacha: () => { success: boolean, rewardId?: number, isNew?: boolean };
    setAvatar: (id: number) => void;
    addGold: (amount: number) => void;

    // Debug
    debugUnlockAll: boolean;
    setDebugUnlockAll: (unlocked: boolean) => void;
    debugFreeStore: boolean;
    setDebugFreeStore: (free: boolean) => void;

    // Audio
    isMusicMuted: boolean;
    toggleMusic: () => void;
}

export type QuestType = 'collect_gold' | 'destroy_rocks' | 'score_points' | 'complete_levels' | 'match_gems';

export interface Quest {
    id: string;
    type: QuestType;
    target: number;
    progress: number;
    completed: boolean;
    reward: number; // Gold amount
    description: string;
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

    // Persisted State Defaults
    lastLoginDate: null,
    loginStreak: 0,
    dailyQuests: [],
    unlockedCollectibles: [],
    playerAvatar: 1,

    checkDailyLogin: () => {
        const { lastLoginDate, loginStreak } = get();
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        if (lastLoginDate === today) return; // Already logged in today

        let newStreak = loginStreak + 1;

        // Reset streak if missed a day
        if (lastLoginDate) {
            const last = new Date(lastLoginDate);
            const diffTime = Math.abs(now.getTime() - last.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 2) newStreak = 1;
        } else {
            newStreak = 1;
        }

        // Cycle repeats every 7 days
        if (newStreak > 7) newStreak = 1;

        // Rewards
        const rewards = [
            0,
            500, // Day 1
            1000, // Day 2
            1500, // Day 3
            2000, // Day 4
            100, // Day 5 (Score/Special... let's give Gold mainly) -> 2500
            3000, // Day 6
            5000 // Day 7
        ];

        const reward = rewards[newStreak];
        // Note: Day 7 could be free gacha, logic handled in UI or here. 
        // For now, simple gold.

        set(state => ({
            lastLoginDate: today,
            loginStreak: newStreak,
            collectedGold: (state.collectedGold || 0) + reward
        }));

        get().addFloatingText({ x: window.innerWidth / 2, y: window.innerHeight / 2, text: `Day ${newStreak} Login! +${reward} Gold`, color: '#ffd700' });

        get().refreshDailyQuests();
    },

    refreshDailyQuests: () => {
        // Simple generation logic
        const QUEST_TYPES: QuestType[] = ['collect_gold', 'destroy_rocks', 'score_points', 'match_gems'];
        const newQuests: Quest[] = Array.from({ length: 3 }, (_, i) => {
            const type = QUEST_TYPES[Math.floor(Math.random() * QUEST_TYPES.length)];
            let target = 10;
            let reward = 500;
            let description = "";

            switch (type) {
                case 'collect_gold':
                    target = 5 + Math.floor(Math.random() * 10); // 5-15
                    reward = target * 50;
                    description = `Collect ${target} Gold Nuggets`;
                    break;
                case 'destroy_rocks':
                    target = 10 + Math.floor(Math.random() * 20); // 10-30
                    reward = target * 20;
                    description = `Destroy ${target} Obsidian Rocks`;
                    break;
                case 'score_points':
                    target = 5000 + Math.floor(Math.random() * 10000);
                    reward = Math.floor(target / 10);
                    description = `Score ${target} Points`;
                    break;
                case 'match_gems':
                    target = 50 + Math.floor(Math.random() * 50);
                    reward = target * 5;
                    description = `Match ${target} Gems`;
                    break;
            }

            return {
                id: `quest-${Date.now()}-${i}`,
                type,
                target,
                progress: 0,
                completed: false,
                reward,
                description
            };
        });

        set({ dailyQuests: newQuests });
    },

    updateQuestProgress: (type: QuestType, amount: number) => {
        const { dailyQuests } = get();
        let updated = false;

        const newQuests = dailyQuests.map(q => {
            if (!q.completed && (q.type === type || (type === 'match_gems' && q.type === 'match_gems'))) { // Simplification
                const newProgress = q.progress + amount;
                if (newProgress >= q.target) {
                    // Completed!
                    get().addFloatingText({ x: window.innerWidth / 2, y: 100, text: `Quest Complete: ${q.reward} Gold!`, color: '#00ff00' });
                    set(state => ({ collectedGold: (state.collectedGold || 0) + q.reward }));
                    return { ...q, progress: q.target, completed: true };
                }
                updated = true;
                return { ...q, progress: newProgress };
            }
            return q;
        });

        if (updated) set({ dailyQuests: newQuests });
    },

    summonGacha: () => {
        const { collectedGold, unlockedCollectibles, debugFreeStore } = get();
        const cost = 1000;

        if (!debugFreeStore && collectedGold < cost) return { success: false };

        // Deduct Gold if not free
        if (!debugFreeStore) {
            set(state => ({ collectedGold: state.collectedGold - cost }));
        }

        // Random ID 1-50
        // Rarity Weighted? 
        // 1-20: Common (50%)
        // 21-40: Rare (35%)
        // 41-50: Legendary (15%)

        const rand = Math.random() * 100;
        let id = 1;
        if (rand < 50) {
            id = 1 + Math.floor(Math.random() * 20);
        } else if (rand < 85) {
            id = 21 + Math.floor(Math.random() * 20);
        } else {
            id = 41 + Math.floor(Math.random() * 10);
        }

        const isNew = !unlockedCollectibles.includes(id);
        const newCollectibles = isNew ? [...unlockedCollectibles, id] : unlockedCollectibles;

        set({ unlockedCollectibles: newCollectibles });

        return { success: true, rewardId: id, isNew };
    },

    setAvatar: (id: number) => set({ playerAvatar: id }),

    addGold: (amount: number) => set(state => ({ collectedGold: (state.collectedGold || 0) + amount })),

    debugUnlockAll: false,
    setDebugUnlockAll: (unlocked) => set({ debugUnlockAll: unlocked }),
    debugFreeStore: false,
    setDebugFreeStore: (free) => set({ debugFreeStore: free }),

    isMusicMuted: false, // Default Music ON
    toggleMusic: () => set(state => ({ isMusicMuted: !state.isMusicMuted })),

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
                get().updateQuestProgress('complete_levels', 1);
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

                    // Update Quests
                    get().updateQuestProgress('collect_gold', goldCheck.count);
                    get().updateQuestProgress('score_points', goldScore);

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

                // Update Quests
                get().updateQuestProgress('score_points', turnScore);
                get().updateQuestProgress('match_gems', cascadeMatches.matches.length);
                if (cascadeMatches.rocksDestroyed && cascadeMatches.rocksDestroyed.length > 0) {
                    get().updateQuestProgress('destroy_rocks', cascadeMatches.rocksDestroyed.length);
                }

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
