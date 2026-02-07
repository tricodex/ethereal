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

// --- REFINED MATCHING LOGIC (L/T Shapes) ---

export const findMatches = (board: Board): MatchResult => {
    const matchedIds = new Set<string>();
    const matches: Gem[] = [];
    const transformations: { gem: Gem, toType: GemType }[] = [];

    // Helper to get connected gems of same color
    const getConnected = (startGem: Gem, dx: number, dy: number): Gem[] => {
        const connected: Gem[] = [startGem];
        let x = startGem.x + dx;
        let y = startGem.y + dy;

        while (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
            const current = board[y][x];
            if (current && current.color === startGem.color && current.type !== 'rainbow') { // Rainbow doesn't match color normally
                connected.push(current);
                x += dx;
                y += dy;
            } else {
                break;
            }
        }
        return connected;
    };

    // We need to track processed gems to avoid double counting for transformation
    const processedForTransform = new Set<string>();

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const gem = board[y][x];
            if (!gem || processedForTransform.has(gem.id)) continue;
            // Skip rainbows for standard matching
            if (gem.type === 'rainbow') continue;

            const horz = [
                ...getConnected(gem, -1, 0).slice(1).reverse(), // Left
                gem,
                ...getConnected(gem, 1, 0).slice(1) // Right
            ];

            const vert = [
                ...getConnected(gem, 0, -1).slice(1).reverse(), // Up
                gem,
                ...getConnected(gem, 0, 1).slice(1) // Down
            ];

            const hLen = horz.length;
            const vLen = vert.length;

            let isMatch = false;
            let toType: GemType | null = null;
            let matchGroup: Gem[] = [];

            // Check for L / T / + Shapes (Bomb)
            // L/T/Cross: At least 3 horizontal AND 3 vertical sharing the same gem
            if (hLen >= 3 && vLen >= 3) {
                isMatch = true;
                toType = 'bomb'; // Wrapped Candy equivalent
                matchGroup = [...new Set([...horz, ...vert])]; // Unique gems
            }
            // Check for 5+ Line (Rainbow)
            else if (hLen >= 5 || vLen >= 5) {
                isMatch = true;
                toType = 'rainbow';
                matchGroup = hLen >= 5 ? horz : vert;
            }
            // Check for 4 Line (Rocket)
            else if (hLen === 4) {
                isMatch = true;
                toType = 'rocket_v'; // Horizontal match creates Vertical Rocket (usually)
                matchGroup = horz;
            }
            else if (vLen === 4) {
                isMatch = true;
                toType = 'rocket_h'; // Vertical match creates Horizontal Rocket
                matchGroup = vert;
            }
            // Simple 3 Match
            else if (hLen >= 3) {
                isMatch = true;
                matchGroup = horz;
            }
            else if (vLen >= 3) {
                isMatch = true;
                matchGroup = vert;
            }

            if (isMatch) {
                // Add to matches
                matchGroup.forEach(g => {
                    if (!matchedIds.has(g.id)) {
                        matchedIds.add(g.id);
                        matches.push(g);
                    }
                });

                // Handle Transformation
                if (toType) {
                    // Prefer the current gem as the transformation target if it's in the group
                    // In a real game, this should be the gem that was SWAPPED to trigger the match
                    // For now, simple logic: current gem is anchor
                    const target = gem;

                    if (!processedForTransform.has(target.id)) {
                        transformations.push({ gem: target, toType });
                        processedForTransform.add(target.id);

                        // Prevent target from being strictly removed (it transforms instead)
                        // It's handled in removeMatches separately
                    }
                }

                // Mark all as processed for transform check to avoid creating multiple specials for same group
                matchGroup.forEach(g => processedForTransform.add(g.id));
            }
        }
    }

    return {
        matches,
        transformations,
        score: matches.length * 10 + transformations.length * 50
    };
};

export const checkSpecialInteraction = (board: Board, gem1: Gem, gem2: Gem): { triggered: boolean, matches: Gem[], score: number } => {
    // 1. Rainbow + Rainbow = Clear Screen
    if (gem1.type === 'rainbow' && gem2.type === 'rainbow') {
        return {
            triggered: true,
            matches: board.flat().filter(g => g !== null) as Gem[],
            score: 5000
        };
    }

    // 2. Rainbow + Color/Special
    if (gem1.type === 'rainbow' || gem2.type === 'rainbow') {
        const rainbow = gem1.type === 'rainbow' ? gem1 : gem2;
        const other = gem1.type === 'rainbow' ? gem2 : gem1;

        if (other.type === 'simple') {
            // Clear all of that color
            return {
                triggered: true,
                matches: board.flat().filter(g => g?.color === other.color) as Gem[],
                score: 2000
            };
        } else {
            // Rainbow + Special (Turn all of that color into that Special!)
            // We need a way to Signal "Transform then Explode" - handled in Store usually?
            // For engine purity, we'll return all matching color gems, but we need the Store to know to Transform them first.
            // Simplified for now: Just explode them all.
            // In Phase 9 Polish, we ideally return a specific "Action" type. 
            // We'll treat it as a massive match for now.
            return {
                triggered: true,
                matches: board.flat().filter(g => g?.color === other.color) as Gem[],
                score: 3000
            };
        }
    }

    // 3. Rocket + Bomb = Giant Cross (3 rows/cols)
    if ((gem1.type.includes('rocket') && gem2.type === 'bomb') || (gem2.type.includes('rocket') && gem1.type === 'bomb')) {
        // We will simulate this by returning a list of targets centered on gem1
        // Actually, we need to return "triggered" and let the store handle the complex explosion logic via removeMatches
        // But removeMatches needs 'matches'.
        // Let's identify the cross area.
        const targets: Gem[] = [];
        for (let r = -1; r <= 1; r++) {
            for (let x = 0; x < COLS; x++) {
                if (gem1.y + r >= 0 && gem1.y + r < ROWS) targets.push(board[gem1.y + r][x]!);
            }
        }
        for (let c = -1; c <= 1; c++) {
            for (let y = 0; y < ROWS; y++) {
                if (gem1.x + c >= 0 && gem1.x + c < COLS) targets.push(board[y][gem1.x + c]!);
            }
        }
        return {
            triggered: true,
            matches: [...new Set(targets.filter(t => t))],
            score: 1000
        };
    }

    return { triggered: false, matches: [], score: 0 };
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
