import { Board, Gem, GemColor, MatchResult, Position, GemType } from "../types";

export const ROWS = 8;
export const COLS = 8;
export const GEM_COLORS: GemColor[] = [1, 2, 3, 4, 5, 6, 7];

export const generateGem = (x: number, y: number, type: GemType = 'simple', color?: GemColor): Gem => {
    const finalColor = color || GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];
    return {
        id: `${x}-${y}-${Date.now()}-${Math.random()}`,
        color: finalColor,
        type,
        x,
        y,
    };
};

export const initializeBoard = (): Board => {
    const board: Board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            let gem: Gem;
            do {
                gem = generateGem(x, y);
            } while (
                (x >= 2 && board[y][x - 1]?.color === gem.color && board[y][x - 2]?.color === gem.color) ||
                (y >= 2 && board[y - 1][x]?.color === gem.color && board[y - 2][x]?.color === gem.color)
            );
            board[y][x] = gem;
        }
    }
    return board;
};

// --- CORE REWRITE FOR MECHANICS ---

export const findMatches = (board: Board): MatchResult => {
    const matchedIds = new Set<string>();
    const matches: Gem[] = [];
    const transformations: { gem: Gem, toType: GemType }[] = [];

    // We scan for lines and handle merges
    // Note: Simple greedy scan. Complex T/L detection requires graph/grouping logic
    // We'll prioritize longer linear matches first.

    // 1. Horizontal
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const gem = board[y][x];
            if (!gem) continue;

            let length = 1;
            while (x + length < COLS && board[y][x + length]?.color === gem.color) {
                length++;
            }

            if (length >= 3) {
                let toType: GemType | null = null;
                if (length === 4) toType = 'rocket_h';
                if (length >= 5) toType = 'rainbow';

                // Collect gems
                const lineGems: Gem[] = [];
                for (let i = 0; i < length; i++) {
                    const g = board[y][x + i];
                    if (g) lineGems.push(g);
                }

                // If special, pick center-ish gem to transform
                if (toType) {
                    const centerIdx = Math.floor(length / 2);
                    const targetGem = lineGems[centerIdx];

                    // Don't add transformation if it's already being transformed from another pass (rare collision)
                    if (!transformations.some(t => t.gem.id === targetGem.id)) {
                        transformations.push({ gem: targetGem, toType });
                        // Remove targetGem from clearing list so it stays
                        lineGems.splice(centerIdx, 1);
                    }
                }

                lineGems.forEach(g => {
                    if (!matchedIds.has(g.id)) {
                        matchedIds.add(g.id);
                        matches.push(g);
                    }
                });

                x += length - 1;
            }
        }
    }

    // 2. Vertical
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            const gem = board[y][x];
            if (!gem) continue;

            let length = 1;
            while (y + length < ROWS && board[y + length][x]?.color === gem.color) {
                length++;
            }

            if (length >= 3) {
                let toType: GemType | null = null;
                if (length === 4) toType = 'rocket_v';
                if (length >= 5) toType = 'rainbow';

                const lineGems: Gem[] = [];
                for (let i = 0; i < length; i++) {
                    const g = board[y + i][x];
                    if (g) lineGems.push(g);
                }

                if (toType) {
                    const centerIdx = Math.floor(length / 2);
                    const targetGem = lineGems[centerIdx];

                    if (!transformations.some(t => t.gem.id === targetGem.id)) {
                        transformations.push({ gem: targetGem, toType });
                        lineGems.splice(centerIdx, 1);
                    }
                }

                lineGems.forEach(g => {
                    if (!matchedIds.has(g.id)) {
                        matchedIds.add(g.id);
                        matches.push(g);
                    }
                });

                y += length - 1;
            }
        }
    }

    return {
        matches,
        transformations,
        score: matches.length * 10 + transformations.length * 50
    };
};

export const swapGems = (board: Board, pos1: Position, pos2: Position): Board => {
    const newBoard = board.map(row => [...row]);
    const gem1 = newBoard[pos1.y][pos1.x];
    const gem2 = newBoard[pos2.y][pos2.x];
    if (!gem1 || !gem2) return board;

    newBoard[pos1.y][pos1.x] = { ...gem2, x: pos1.x, y: pos1.y };
    newBoard[pos2.y][pos2.x] = { ...gem1, x: pos2.x, y: pos2.y };
    return newBoard;
};

// Recursive explosion logic
const getExplosionTargets = (board: Board, gem: Gem, visitedIds: Set<string>): Gem[] => {
    if (visitedIds.has(gem.id)) return [];
    visitedIds.add(gem.id);

    const targets: Gem[] = [gem]; // Always remove self

    // SIMPLE GEMS: Stop recursion
    if (gem.type === 'simple') return targets;

    // SPECIAL GEMS: Explode and Recurse
    if (gem.type === 'rocket_h') {
        for (let x = 0; x < COLS; x++) {
            const target = board[gem.y][x];
            if (target && !visitedIds.has(target.id)) {
                targets.push(...getExplosionTargets(board, target, visitedIds));
            }
        }
    } else if (gem.type === 'rocket_v') {
        for (let y = 0; y < ROWS; y++) {
            const target = board[y][gem.x];
            if (target && !visitedIds.has(target.id)) {
                targets.push(...getExplosionTargets(board, target, visitedIds));
            }
        }
    } else if (gem.type === 'bomb') { // Placeholder if we add Bomb later
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const ny = gem.y + dy;
                const nx = gem.x + dx;
                if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
                    const target = board[ny][nx];
                    if (target && !visitedIds.has(target.id))
                        targets.push(...getExplosionTargets(board, target, visitedIds));
                }
            }
        }
    } else if (gem.type === 'rainbow') { // Explode all of random color (or most abundant)
        // For complexity, let's just pick a random color or the color of gem it swapped with (if passed context)
        // Without context, we'll clear all of its own color (which is weird for rainbow)
        // Or just clear all Red gems as default? 
        // Let's make Rainbow act as "Clear All of Color X" where X is random for now in cascade
        const targetColor = GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];
        board.flat().forEach(g => {
            if (g && g.color === targetColor && !visitedIds.has(g.id)) {
                targets.push(...getExplosionTargets(board, g, visitedIds));
            }
        });
    }

    return targets;
};

export const removeMatches = (board: Board, matches: Gem[], transformations: { gem: Gem, toType: GemType }[] = []): Board => {
    const newBoard = board.map(row => [...row]);
    const visitedIds = new Set<string>();
    const allExplodedGems: Gem[] = [];

    // 1. Calculate all explosions (including chains)
    matches.forEach(match => {
        // If this match is NOT a transformation target, explode it
        if (!transformations.some(t => t.gem.id === match.id)) {
            const exploded = getExplosionTargets(board, match, visitedIds);
            allExplodedGems.push(...exploded);
        }
    });

    // 2. Remove exploded gems
    allExplodedGems.forEach(g => {
        // Don't remove if it's becoming a special gem
        if (!transformations.some(t => t.gem.id === g.id)) {
            newBoard[g.y][g.x] = null;
        }
    });

    // 3. Apply Transformations (Morph source gems into special ones)
    transformations.forEach(t => {
        newBoard[t.gem.y][t.gem.x] = {
            ...t.gem,
            type: t.toType
        };
    });

    return newBoard;
};

export const applyGravity = (board: Board): Board => {
    const newBoard = board.map(row => [...row]);

    for (let x = 0; x < COLS; x++) {
        let emptySlots = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            if (newBoard[y][x] === null) {
                emptySlots++;
            } else if (emptySlots > 0) {
                const gem = newBoard[y][x]!;
                newBoard[y + emptySlots][x] = { ...gem, y: y + emptySlots };
                newBoard[y][x] = null;
            }
        }

        for (let y = 0; y < emptySlots; y++) {
            newBoard[y][x] = generateGem(x, y);
        }
    }
    return newBoard;
};
