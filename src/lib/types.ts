export type GemColor = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type GemType = 'simple' | 'shiny' | 'special';

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
    score: number;
}
