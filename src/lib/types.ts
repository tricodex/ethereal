export type GemColor = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type GemType = 'simple' | 'rocket_h' | 'rocket_v' | 'bomb' | 'rainbow' | 'rock' | 'gold';

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
    rocksDestroyed?: Position[]; // New tracking for rock fx
    goldCollected?: number; // New tracking
}

export interface Level {
    id: number;
    worldId: number;
    targetScore: number;
    moves: number;
    iceCount?: number;
    rockCount?: number; // New: Initial rocks
    goldPreload?: number; // New: Initial gold
    objectives?: {
        type: 'collect_eth' | 'clear_ice' | 'collect_gold'; // Added collect_gold
        count: number;
    }[];
}
