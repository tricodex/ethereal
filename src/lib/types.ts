export type GemColor = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type GemType = 'simple' | 'rocket_h' | 'rocket_v' | 'bomb' | 'rainbow';

export interface Gem {
    id: string; // Unique ID for keying
    color: GemColor;
    type: GemType;
    x: number;
    y: number;
    isMatched?: boolean;
    isFrozen?: boolean; // New: Frozen state
}

export type Board = (Gem | null)[][];

export interface Position {
    x: number;
    y: number;
}

export interface MatchResult {
    matches: Gem[];
    transformations?: { gem: Gem, toType: GemType }[];
    score: number;
}

export interface Level {
    id: number;
    worldId: number; // New: World grouping
    targetScore: number;
    moves: number;
    iceCount?: number; // New: Initial frozen gems
    objectives?: {
        type: 'collect_eth' | 'clear_ice'; // Added clear_ice
        count: number;
    }[];
}
