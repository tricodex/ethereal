import { Level } from "@/lib/types";

const GENERATED_LEVELS: Level[] = Array.from({ length: 20 }, (_, i) => {
    const id = i + 1;
    const isHard = id % 5 === 0;

    // World Logic
    // Levels 1-10: World 1 (Ether Plains)
    // Levels 11-20: World 2 (Frozen Staking)
    let worldId = 1;
    let iceCount = 0;

    if (id > 10) {
        worldId = 2;
        iceCount = 5 + (id - 10) * 2; // Increasing ice for World 2
    }

    let moves = 15 + Math.floor(id / 2) * 5;
    if (moves > 40) moves = 40;

    let targetScore = 1000 * id * (isHard ? 1.5 : 1);

    // Objectives
    const objectives: { type: 'collect_eth' | 'clear_ice', count: number }[] = [];

    if (id > 1) {
        objectives.push({
            type: 'collect_eth',
            count: 5 + Math.floor(id * 1.5)
        });
    }

    // Add Ice Objective for World 2
    if (worldId === 2) {
        objectives.push({
            type: 'clear_ice',
            count: iceCount
        });
    }

    return {
        id,
        worldId,
        targetScore,
        moves,
        iceCount: iceCount > 0 ? iceCount : undefined,
        objectives: objectives.length > 0 ? objectives : undefined
    };
});

export const LEVELS: Level[] = GENERATED_LEVELS;
