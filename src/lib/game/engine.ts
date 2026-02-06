import { Board, Gem, GemColor, MatchResult, Position } from "../types";

export const ROWS = 8;
export const COLS = 8;
export const GEM_COLORS: GemColor[] = [1, 2, 3, 4, 5, 6, 7];

export const generateGem = (x: number, y: number): Gem => {
    const color = GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];
    return {
        id: `${x}-${y}-${Date.now()}-${Math.random()}`,
        color,
        type: 'simple',
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

export const findMatches = (board: Board): MatchResult => {
    const matches: Gem[] = [];
    const matchedIds = new Set<string>();

    // Horizontal matches
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS - 2; x++) {
            const gem1 = board[y][x];
            const gem2 = board[y][x + 1];
            const gem3 = board[y][x + 2];

            if (gem1 && gem2 && gem3 && gem1.color === gem2.color && gem1.color === gem3.color) {
                let matchLen = 3;
                while (x + matchLen < COLS && board[y][x + matchLen]?.color === gem1.color) {
                    matchLen++;
                }

                for (let i = 0; i < matchLen; i++) {
                    const gem = board[y][x + i];
                    if (gem && !matchedIds.has(gem.id)) {
                        matches.push(gem);
                        matchedIds.add(gem.id);
                    }
                }
                x += matchLen - 1;
            }
        }
    }

    // Vertical matches
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS - 2; y++) {
            const gem1 = board[y][x];
            const gem2 = board[y + 1][x];
            const gem3 = board[y + 2][x];

            if (gem1 && gem2 && gem3 && gem1.color === gem2.color && gem1.color === gem3.color) {
                let matchLen = 3;
                while (y + matchLen < ROWS && board[y + matchLen][x]?.color === gem1.color) {
                    matchLen++;
                }

                for (let i = 0; i < matchLen; i++) {
                    const gem = board[y + i][x];
                    if (gem && !matchedIds.has(gem.id)) {
                        matches.push(gem);
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

    // Swap logic
    newBoard[pos1.y][pos1.x] = { ...gem2, x: pos1.x, y: pos1.y };
    newBoard[pos2.y][pos2.x] = { ...gem1, x: pos2.x, y: pos2.y };

    return newBoard;
};

export const removeMatches = (board: Board, matches: Gem[]): Board => {
    const newBoard = board.map(row => [...row]);
    matches.forEach(gem => {
        newBoard[gem.y][gem.x] = null;
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

        // Fill top with new gems
        for (let y = 0; y < emptySlots; y++) {
            newBoard[y][x] = generateGem(x, y);
        }
    }

    return newBoard;
};
