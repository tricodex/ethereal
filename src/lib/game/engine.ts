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

    // Fill board ensuring no initial matches
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

// Simplified match finder + Special Gem Detection
export const findMatches = (board: Board): MatchResult => {
    const matches: Gem[] = [];
    const matchedIds = new Set<string>();

    // We need to group matches to detect special shapes
    // This simple version just detects lines > 3 for immediate rocket demo

    // Horizontal
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS - 2; x++) {
            const gem1 = board[y][x];
            if (!gem1) continue;

            let matchLen = 1;
            while (x + matchLen < COLS && board[y][x + matchLen]?.color === gem1.color) {
                matchLen++;
            }

            if (matchLen >= 3) {
                // Determine type
                let specialType: GemType | undefined;
                if (matchLen === 4) specialType = 'rocket_h';
                if (matchLen >= 5) specialType = 'rainbow';

                for (let i = 0; i < matchLen; i++) {
                    const gem = board[y][x + i];
                    if (gem && !matchedIds.has(gem.id)) {
                        // Mark the center/first gem to become special if applicable
                        // In a full implementation we'd need to know the SOURCE of the swap
                        matches.push({ ...gem });
                        matchedIds.add(gem.id);
                    }
                }
                x += matchLen - 1;
            }
        }
    }

    // Vertical
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS - 2; y++) {
            const gem1 = board[y][x];
            if (!gem1) continue;

            let matchLen = 1;
            while (y + matchLen < ROWS && board[y + matchLen][x]?.color === gem1.color) {
                matchLen++;
            }

            if (matchLen >= 3) {
                // Determine type
                if (matchLen === 4) {
                    // Hack: Just add a special flag to one of the matched gems to allow Spawning later
                    // For now, we just clear them. 
                    // TODO: Spawn logic requires engine refactor to return "Actions" not just matches
                }

                for (let i = 0; i < matchLen; i++) {
                    const gem = board[y + i][x];
                    if (gem && !matchedIds.has(gem.id)) {
                        matches.push({ ...gem });
                        matchedIds.add(gem.id);
                    }
                }
                y += matchLen - 1;
            }
        }
    }

    return { matches, score: matches.length * 10 };
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

export const removeMatches = (board: Board, matches: Gem[]): Board => {
    const newBoard = board.map(row => [...row]);

    matches.forEach(gem => {
        // Here we would handle special gem explosions
        // For rocket: clear entire row/col
        // For bomb: clear area

        if (gem.type === 'rocket_h') {
            // Clear row
            for (let x = 0; x < COLS; x++) newBoard[gem.y][x] = null;
        } else if (gem.type === 'rocket_v') {
            // Clear col
            for (let y = 0; y < ROWS; y++) newBoard[y][gem.x] = null;
        } else {
            newBoard[gem.y][gem.x] = null;
        }
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
