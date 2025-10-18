import {LevelData} from "../types/LevelData.tsx";

export async function loadLevelData(): Promise<LevelData> {
    // Вариант 1: Загрузка из JSON файла
    // const response = await fetch('/levels/level1.json');
    // const data = await response.json();
    // return data;

    // Вариант 2: Статические данные для тестирования
    return {
        layers: [
            {
                tiles: [
                    [9, 9, 9, 9, 9, 9, 9],
                    [9, 9, 9, 9, 9, 9, 9],
                    [9, 9, 9, 9, 9, 9, 9],
                    [9, 9, 9, 9, 9, 9, 9],
                    [9, 9, 9, 9, 9, 9, 9],
                    [9, 9, 9, 9, 9, 9, 9],
                    [9, 9, 9, 9, 9, 9, 9],
                ],
                rotations: [
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0]
                ]
            }
        ],
        edges: [
            [-1, -1, -1, -1, -1, -1],
            [0, 0, 0, 1, 0, -1],
            [0, 0, -1, -1, 0, -1],
            [0, 0, -1, 0, 0, -1],
            [0, 0, -1, -1, -1, -1],
            [0, 0, 0, 0, 0, -1],
            [0, 0, 0, 0, 0, -1],

        ],
        groups: [
            {
                "color": 16711680,
                "start": [1, 0],
                "delay": 2000,
                "max": 50,
                "end": [5, 6]
            },
            {
                "color": 10711680,
                "start": [1, 0],
                "delay": 2000,
                "max": 50,
                "end": [3, 4]
            },
            {
                "color": 10711680,
                "start": [3, 1],
                "delay": 2000,
                "max": 50,
                "end": [5, 1]
            },
        ]
    };
}