import { Level } from "@/lib/types";

export const LEVELS: Level[] = [
    {
        id: 1,
        targetScore: 1000,
        moves: 15,
    },
    {
        id: 2,
        targetScore: 2500,
        moves: 20,
        objectives: [{ type: 'collect_eth', count: 5 }]
    },
    {
        id: 3,
        targetScore: 5000,
        moves: 25,
        objectives: [{ type: 'collect_eth', count: 10 }]
    },
    {
        id: 4,
        targetScore: 10000,
        moves: 30,
        objectives: [{ type: 'collect_eth', count: 20 }]
    }
];
