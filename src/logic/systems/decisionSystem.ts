import {defineSystem} from "bitecs";
import {CustomWorld} from "../../types";
import {AStarPathMovementComponent, SelectedCellComponent, VelocityComponent} from "../components";
import {mobsQuery} from "../queries";
import PF from "pathfinding";

const THINK_INTERVAL = 5000;
const MAX_PATH_LENGTH = 100; // Максимальная длина пути для хранения

function getRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Создаем finder с настройками один раз
const finder = new PF.AStarFinder({
    diagonalMovement: PF.DiagonalMovement.Never // или Always, OnlyWhenNoObstacles
});

function createEmptyMatrix(width: number, height: number): number[][] {
    return Array.from({length: width}, () =>
        new Array(height).fill(0)
    );
}

function savePathToComponent(eid: number, path: number[][]) {
    // Очищаем предыдущий путь
    for (let i = 0; i < MAX_PATH_LENGTH; i++) {
        AStarPathMovementComponent.pathXs[eid][i] = 0;
        AStarPathMovementComponent.pathYs[eid][i] = 0;
    }

    // Сохраняем новый путь (пропускаем первую точку - это текущая позиция)
    const pathToSave = path.slice(1); // убираем стартовую позицию
    AStarPathMovementComponent.pathLength[eid] = Math.min(pathToSave.length, MAX_PATH_LENGTH);
    AStarPathMovementComponent.pathIndex[eid] = 0;

    for (let i = 0; i < AStarPathMovementComponent.pathLength[eid]; i++) {
        const point = pathToSave[i];
        AStarPathMovementComponent.pathXs[eid][i] = point[0];
        AStarPathMovementComponent.pathYs[eid][i] = point[1];
    }
}

export function getCurrentPathPoint(eid: number): { x: number, y: number } | null {
    const index = AStarPathMovementComponent.pathIndex[eid];
    const length = AStarPathMovementComponent.pathLength[eid];

    if (index >= length) return null;

    return {
        x: AStarPathMovementComponent.pathXs[eid][index],
        y: AStarPathMovementComponent.pathYs[eid][index]
    };
}



export const decisionSystem = defineSystem((world: CustomWorld) => {
    const mobs = mobsQuery(world);

    // Создаем матрицу препятствий
    const matrix = createEmptyMatrix(world.size.width, world.size.height);

    // Заполняем матрицу препятствиями (мобы)
    for (const eid of mobs) {
        const x = SelectedCellComponent.x[eid];
        const y = SelectedCellComponent.y[eid];
        if (x >= 0 && x < world.size.width && y >= 0 && y < world.size.height) {
            matrix[x][y] = 1;
        }
    }

    const grid = new PF.Grid(matrix);

    // Система принятия решений
    for (const eid of mobs) {
        AStarPathMovementComponent.timeToNextThink[eid] -= world.time.delta;

        if (AStarPathMovementComponent.timeToNextThink[eid] <= 0) {
            AStarPathMovementComponent.timeToNextThink[eid] = THINK_INTERVAL;

            // Генерируем новую цель
            const targetX = getRandom(0, world.size.width - 1);
            const targetY = getRandom(0, world.size.height - 1);

            const startX = SelectedCellComponent.x[eid];
            const startY = SelectedCellComponent.y[eid];

            try {
                const foundPath = finder.findPath(startX, startY, targetX, targetY, grid.clone());

                // Проверяем валидность пути
                if (foundPath && foundPath.length > 1) {
                    AStarPathMovementComponent.finalTarget.x[eid] = targetX;
                    AStarPathMovementComponent.finalTarget.y[eid] = targetY;

                    // Сохраняем весь путь
                    savePathToComponent(eid, foundPath);

                    // Устанавливаем первую точку пути как текущую цель
                    const firstPoint = getCurrentPathPoint(eid);
                    if (firstPoint) {
                        AStarPathMovementComponent.target.x[eid] = firstPoint.x;
                        AStarPathMovementComponent.target.y[eid] = firstPoint.y;
                        AStarPathMovementComponent.movement[eid] = 1;
                    }
                } else {
                    // Путь не найден - останавливаем моба
                    AStarPathMovementComponent.movement[eid] = 0;
                    AStarPathMovementComponent.pathLength[eid] = 0;
                    VelocityComponent.x[eid] = 0;
                    VelocityComponent.z[eid] = 0;
                }
            } catch (error) {
                console.warn('Pathfinding error for entity', eid, error);
                AStarPathMovementComponent.movement[eid] = 0;
                AStarPathMovementComponent.pathLength[eid] = 0;
            }
        }
    }

    return world;
});
