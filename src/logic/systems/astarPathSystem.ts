import {defineSystem} from "bitecs";
import {mobsQuery} from "../queries";
import {CustomWorld} from "../../types";
import {AStarPathMovementComponent, PositionComponent, SelectedCellComponent, VelocityComponent} from "../components";
import {getCurrentPathPoint} from "./decisionSystem.ts";
import {CELL_SIZE} from "./selectCellSystem.ts";

const MOVEMENT_SPEED = 0.5;
const DISTANCE_THRESHOLD = 0.1;

// Функция для преобразования координат сетки в мировые координаты
function gridToWorld(i: number, j: number, worldSize: {width: number, height: number}) {
    const x = i * CELL_SIZE - (worldSize.height * CELL_SIZE) / 2;
    const z = -(j * CELL_SIZE - (worldSize.width * CELL_SIZE) / 2);
    return { x, z };
}

// Функция для расчета направления движения
function calculateDirection(fromX: number, fromZ: number, toX: number, toZ: number) {
    const dx = toX - fromX;
    const dz = toZ - fromZ;

    const length = Math.sqrt(dx * dx + dz * dz);

    if (length <= DISTANCE_THRESHOLD) {
        return {x: 0, z: 0, length: 0};
    }

    return {
        x: dx / length,
        z: dz / length,
        length
    };
}

// Функция для перехода к следующей точке пути
function moveToNextPathPoint(eid: number): boolean {
    const nextIndex = AStarPathMovementComponent.pathIndex[eid] + 1;
    const pathLength = AStarPathMovementComponent.pathLength[eid];

    if (nextIndex < pathLength) {
        AStarPathMovementComponent.pathIndex[eid] = nextIndex;
        return true;
    }
    return false; // Достигли конца пути
}

export const astarPathSystem = defineSystem((world: CustomWorld) => {
    const mobs = mobsQuery(world);

    for (const eid of mobs) {
        if (AStarPathMovementComponent.movement[eid] <= 0) continue;

        // Получаем текущую позицию в мировых координатах
        const currentWorldX = PositionComponent.x[eid];
        const currentWorldZ = PositionComponent.z[eid];

        // Получаем целевую точку пути в координатах сетки
        const targetGridX = AStarPathMovementComponent.target.x[eid];
        const targetGridY = AStarPathMovementComponent.target.y[eid];

        // Преобразуем целевую точку в мировые координаты
        const targetWorld = gridToWorld(targetGridX, targetGridY, world.size);

        // Вычисляем направление движения в мировых координатах
        const direction = calculateDirection(currentWorldX, currentWorldZ, targetWorld.x, targetWorld.z);

        if (direction.length === 0) {
            // Достигли текущей целевой точки - переходим к следующей
            const hasNextPoint = moveToNextPathPoint(eid);

            if (hasNextPoint) {
                // Устанавливаем следующую точку пути
                const nextPoint = getCurrentPathPoint(eid);
                if (nextPoint) {
                    AStarPathMovementComponent.target.x[eid] = nextPoint.x;
                    AStarPathMovementComponent.target.y[eid] = nextPoint.y;
                } else {
                    // Если следующей точки нет, завершаем движение
                    AStarPathMovementComponent.movement[eid] = 0;
                    VelocityComponent.x[eid] = 0;
                    VelocityComponent.z[eid] = 0;
                }
            } else {
                // Достигли конечной точки пути
                AStarPathMovementComponent.movement[eid] = 0;
                VelocityComponent.x[eid] = 0;
                VelocityComponent.z[eid] = 0;

                // Проверяем, достигли ли финальной цели
                const finalGridX = AStarPathMovementComponent.finalTarget.x[eid];
                const finalGridY = AStarPathMovementComponent.finalTarget.y[eid];

                // Получаем текущую позицию в координатах сетки
                const currentGridX = SelectedCellComponent.x[eid];
                const currentGridY = SelectedCellComponent.y[eid];

                const distanceToFinal = Math.sqrt(
                    Math.pow(currentGridX - finalGridX, 2) + Math.pow(currentGridY - finalGridY, 2)
                );

                if (distanceToFinal > DISTANCE_THRESHOLD) {
                    // Не достигли финальной цели - возможно нужен перерасчет пути
                    console.log(`Entity ${eid} не достиг финальной цели`);
                }
            }
        } else {
            // Продолжаем движение к текущей точке
            VelocityComponent.x[eid] = direction.x * MOVEMENT_SPEED;
            VelocityComponent.z[eid] = direction.z * MOVEMENT_SPEED;
        }
    }

    return world;
});