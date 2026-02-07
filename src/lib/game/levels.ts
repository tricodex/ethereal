import { Level } from "@/lib/types";

const GENERATED_LEVELS: Level[] = Array.from({ length: 20 }, (_, i) => {
    const id = i + 1;
    const isHard = id % 5 === 0; // Every 5th level is hard

    let moves = 15 + Math.floor(id / 2) * 5; // Increase moves gradually
    if (moves > 40) moves = 40; // Cap at 40 moves

    let targetScore = 1000 * id * (isHard ? 1.5 : 1);

    // Objectives
    const objectives = [];
    if (id > 1) {
        objectives.push({
            type: 'collect_eth' as const,
            count: 10 + Math.floor(id * 2)
        });
    }

    return {
        id,
        targetScore,
        moves,
        objectives: objectives.length > 0 ? objectives : undefined
    };
});

export const LEVELS: Level[] = GENERATED_LEVELS;
