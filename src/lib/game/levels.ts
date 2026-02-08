import { Level } from "@/lib/types";

const GENERATED_LEVELS: Level[] = Array.from({ length: 50 }, (_, i) => {
    const id = i + 1;
    const isHard = id % 5 === 0;

    // World Logic
    // L1-10: Etheria Genesis (Standard)
    // L11-20: Cryo-Vault (Ice)
    // L21-30: Obsidian Wastes (Rocks)
    // L31-40: Golden Vein (Gold)
    // L41-50: Merge Singularity (Chaos)

    let worldId = 1;
    let iceCount = 0;
    let rockCount = 0;
    let goldPreload = 0;
    let objectives: { type: 'collect_eth' | 'clear_ice' | 'collect_gold', count: number }[] = [];

    if (id <= 10) {
        worldId = 1;
    } else if (id <= 20) {
        worldId = 2;
        iceCount = 5 + (id - 10) * 2;
        objectives.push({ type: 'clear_ice', count: iceCount });
    } else if (id <= 30) {
        worldId = 3;
        rockCount = 5 + (id - 20) * 2;
        // Rocks are an obstacle, not always an objective, but lets add Collect ETH as primary
    } else if (id <= 40) {
        worldId = 4;
        goldPreload = 2 + Math.floor((id - 30) / 2);
        objectives.push({ type: 'collect_gold', count: goldPreload });
    } else {
        worldId = 5;
        // Chaos: Everything
        iceCount = 10;
        rockCount = 5;
        goldPreload = 3;
        objectives.push({ type: 'collect_gold', count: 3 });
        objectives.push({ type: 'clear_ice', count: 10 });
    }

    let moves = 15 + Math.floor(id / 2) * 2;
    if (moves > 50) moves = 50;

    let targetScore = 1000 * id * (isHard ? 1.5 : 1);

    // Base Objective (ETH) for almost all levels
    objectives.push({
        type: 'collect_eth',
        count: 5 + Math.floor(id * 1.2)
    });

    return {
        id,
        worldId,
        targetScore,
        moves,
        iceCount: iceCount > 0 ? iceCount : undefined,
        rockCount: rockCount > 0 ? rockCount : undefined,
        goldPreload: goldPreload > 0 ? goldPreload : undefined,
        objectives: objectives.length > 0 ? objectives : undefined
    };
});

export const LEVELS: Level[] = GENERATED_LEVELS;
