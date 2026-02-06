export type GemColor = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type GemType = 'simple' | 'rocket_h' | 'rocket_v' | 'bomb' | 'rainbow';

export interface Gem {
    id: string; // Unique ID for keying
    color: GemColor;
    type: GemType;
    x: number;
    y: number;
    isMatched?: boolean;
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
    targetScore: number;
    moves: number;
    objectives?: {
        type: 'collect_eth';
        count: number;
    }[];
}
