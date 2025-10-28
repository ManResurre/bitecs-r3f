// systems/pathMovementSystem.ts
import { defineSystem } from "bitecs";
import { Vector3 } from "yuka";
import { mobsQuery } from "../queries";
import { PathMovementComponent, PositionComponent, VelocityComponent, SpeedComponent } from "../components";
import { CustomWorld } from "../../types";

const ARRIVAL_THRESHOLD = 0.5;
const DIRECTION_SMOOTHING = 0.1;

function hasActivePath(eid: number): boolean {
    return PathMovementComponent.movement[eid] === 1 &&
        PathMovementComponent.pathLength[eid] > 0 &&
        PathMovementComponent.pathIndex[eid] < PathMovementComponent.pathLength[eid];
}

function getCurrentWaypoint(eid: number): Vector3 {
    const index = PathMovementComponent.pathIndex[eid];
    return new Vector3(
        PathMovementComponent.pathXs[eid][index],
        PathMovementComponent.pathYs[eid][index],
        PathMovementComponent.pathZs[eid][index]
    );
}

function updateVelocityToTarget(eid: number, target: Vector3, world: CustomWorld): void {
    const position = new Vector3(
        PositionComponent.x[eid],
        PositionComponent.y[eid],
        PositionComponent.z[eid]
    );

    const direction = new Vector3();
    direction.subVectors(target, position);

    const distanceToTarget = direction.length();

    if (distanceToTarget < ARRIVAL_THRESHOLD) {
        // Достигли текущей точки пути
        PathMovementComponent.pathIndex[eid]++;

        if (PathMovementComponent.pathIndex[eid] >= PathMovementComponent.pathLength[eid]) {
            // Конец пути
            PathMovementComponent.movement[eid] = 0;
            VelocityComponent.x[eid] = 0;
            VelocityComponent.y[eid] = 0;
            VelocityComponent.z[eid] = 0;
            console.log(`Mob ${eid} reached end of path`);
        }
        return;
    }

    // Нормализуем направление и устанавливаем скорость
    direction.normalize();

    const speed = SpeedComponent.maxSpeed[eid] || 0.5;
    const deltaTime = world.time.delta / 1000; // Конвертируем в секунды

    // Плавное изменение velocity
    const targetVelocity = {
        x: direction.x * speed,
        y: direction.y * speed,
        z: direction.z * speed
    };

    // Интерполяция для плавности
    VelocityComponent.x[eid] = VelocityComponent.x[eid] * (1 - DIRECTION_SMOOTHING) + targetVelocity.x * DIRECTION_SMOOTHING;
    VelocityComponent.y[eid] = VelocityComponent.y[eid] * (1 - DIRECTION_SMOOTHING) + targetVelocity.y * DIRECTION_SMOOTHING;
    VelocityComponent.z[eid] = VelocityComponent.z[eid] * (1 - DIRECTION_SMOOTHING) + targetVelocity.z * DIRECTION_SMOOTHING;
}

export const pathMovementSystem = defineSystem((world: CustomWorld) => {
    const mobs = mobsQuery(world);

    for (const eid of mobs) {
        if (hasActivePath(eid)) {
            const waypoint = getCurrentWaypoint(eid);
            updateVelocityToTarget(eid, waypoint, world);
        } else if (PathMovementComponent.movement[eid] === 1) {
            // Нет активного пути, но движение включено - выключаем
            PathMovementComponent.movement[eid] = 0;
            VelocityComponent.x[eid] = 0;
            VelocityComponent.y[eid] = 0;
            VelocityComponent.z[eid] = 0;
        }
    }

    return world;
});
