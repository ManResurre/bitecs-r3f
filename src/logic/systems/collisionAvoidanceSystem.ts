// systems/collisionAvoidanceSystem.ts
import { defineSystem } from "bitecs";
import { CustomWorld } from "../../types";
import { movementQuery } from "../queries";
import { PositionComponent, VelocityComponent } from "../components";
import {SpatialHashGrid} from "../../utils/SpatialHashGrid.ts";

export const collisionAvoidanceSystem = defineSystem((world: CustomWorld & { spatialGrid?: SpatialHashGrid }) => {
    const movingEntities = movementQuery(world);
    const grid = world.spatialGrid;

    if (!grid) return world;

    movingEntities.forEach((eid) => {
        const currentPos = {
            x: PositionComponent.x[eid],
            y: PositionComponent.y[eid],
            z: PositionComponent.z[eid]
        };

        // Получаем nearby entities через spatial grid
        const nearbyEntities = grid.getNearbyEntities(currentPos.x, currentPos.z, 2.0);

        const avoidanceForce = { x: 0, z: 0 };
        let neighborCount = 0;

        nearbyEntities.forEach((otherEid) => {
            if (otherEid === eid) return;

            const otherPos = {
                x: PositionComponent.x[otherEid],
                z: PositionComponent.z[otherEid]
            };

            const dx = currentPos.x - otherPos.x;
            const dz = currentPos.z - otherPos.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            // Избегаем столкновений только с близкими объектами
            if (distance < 1.5 && distance > 0.1) {
                const force = (1.5 - distance) / 1.5;
                avoidanceForce.x += (dx / distance) * force * 0.8; // Увеличил силу
                avoidanceForce.z += (dz / distance) * force * 0.8;
                neighborCount++;
            }
        });

        // Нормализуем силу, если есть несколько соседей
        if (neighborCount > 0) {
            avoidanceForce.x /= neighborCount;
            avoidanceForce.z /= neighborCount;
        }

        // Применяем силу избегания к velocity
        if (avoidanceForce.x !== 0 || avoidanceForce.z !== 0) {
            // Сохраняем исходную скорость для сохранения общего направления
            const originalSpeed = Math.sqrt(
                VelocityComponent.x[eid] ** 2 +
                VelocityComponent.z[eid] ** 2
            );

            // Корректируем направление с учетом избегания
            VelocityComponent.x[eid] += avoidanceForce.x;
            VelocityComponent.z[eid] += avoidanceForce.z;

            // Сохраняем исходную скорость (только меняем направление)
            const newSpeed = Math.sqrt(
                VelocityComponent.x[eid] ** 2 +
                VelocityComponent.z[eid] ** 2
            );

            if (newSpeed > 0 && originalSpeed > 0) {
                VelocityComponent.x[eid] = (VelocityComponent.x[eid] / newSpeed) * originalSpeed;
                VelocityComponent.z[eid] = (VelocityComponent.z[eid] / newSpeed) * originalSpeed;
            }
        }
    });

    return world;
});