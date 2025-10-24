import {LevelData} from "../types/LevelData.tsx";

export async function loadLevelData(): Promise<LevelData> {
    return {
        mobs: [
            {
                name: 'zombie',
                delay: 2000,
                max: 4,
                position: [0, 0]
            },
            // {
            //     name: 'hunter',
            //     delay: 2000,
            //     max: 5,
            //     position: [2, 0]
            // }
        ]
    };
}
