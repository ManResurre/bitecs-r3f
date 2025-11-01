import {LevelData} from "../types/LevelData.tsx";

export async function loadLevelData(): Promise<LevelData> {
    return {
        mobs: [
            {
                name: 'zombie',
                delay: 5000,
                max: 50,
                position: [0, 0]
            },
            // {
            //     name: 'hunter',
            //     delay: 2000,
            //     max: 5,
            //     position: [2, 0]
            // }
        ],
        healthPackSpawningPoints: [
            [-1, -3.5, 0], [33.5, -7, 18], [-27, -4.2, -27]
        ],
    };
}
