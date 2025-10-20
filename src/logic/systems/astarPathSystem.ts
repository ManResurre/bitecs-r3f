import {defineSystem} from "bitecs";
import {mobsQuery} from "../queries";
import {CustomWorld} from "../../types";
import {AStarPathMovementComponent, SelectedCellComponent, VelocityComponent} from "../components";
import {getCurrentPathPoint} from "./decisionSystem.ts";

const MOVEMENT_SPEED = 0.5;
const DISTANCE_THRESHOLD = 0.1;

function calculateDirection(fromX: number, fromY: number, toX: number, toY: number) {
    const direction = {
        x: toX - fromX,
        y: toY - fromY
    };

    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);

    if (length <= DISTANCE_THRESHOLD) {
        return {x: 0, y: 0, length: 0};
    }

    return {
        x: direction.x / length,
        y: direction.y / length,
        length
    };
}

function moveToNextPathPoint(eid: number): boolean {
    const nextIndex = AStarPathMovementComponent.pathIndex[eid] + 1;
    const length = AStarPathMovementComponent.pathLength[eid];

    if (nextIndex < length) {
        AStarPathMovementComponent.pathIndex[eid] = nextIndex;
        return true;
    }
    return false; // Достигли конца пути
}

export const astarPathSystem = defineSystem((world: CustomWorld) => {
    const mobs = mobsQuery(world);

    // Система движения
    for (const eid of mobs) {
        if (AStarPathMovementComponent.movement[eid] <= 0) continue;

        const currentX = SelectedCellComponent.x[eid];
        const currentY = SelectedCellComponent.y[eid];
        const targetX = AStarPathMovementComponent.target.x[eid];
        const targetY = AStarPathMovementComponent.target.y[eid];

        const direction = calculateDirection(currentX, currentY, targetX, targetY);

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
                const finalX = AStarPathMovementComponent.finalTarget.x[eid];
                const finalY = AStarPathMovementComponent.finalTarget.y[eid];
                const distanceToFinal = Math.sqrt(
                    Math.pow(currentX - finalX, 2) + Math.pow(currentY - finalY, 2)
                );

                if (distanceToFinal > DISTANCE_THRESHOLD) {
                    // Не достигли финальной цели - возможно нужен перерасчет
                    console.log(`Entity ${eid} не достиг финальной цели`);
                }
            }
        } else {
            // Продолжаем движение к текущей точке
            VelocityComponent.x[eid] = direction.x * MOVEMENT_SPEED;
            VelocityComponent.z[eid] = -direction.y * MOVEMENT_SPEED;
        }
    }

    return world;
});
