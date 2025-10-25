import { defineSystem } from "bitecs";
import { movementQuery } from "../queries";
import { PositionComponent, RotationComponent, VelocityComponent } from "../components";
import { CustomWorld } from "../../types";

export const physicsMovementSystem = defineSystem((world: CustomWorld) => {
    const movingEntities = movementQuery(world);

    movingEntities.forEach((eid) => {
        const rigidBody = world.rigidBodies.get(eid);

        if (rigidBody) {
            // Используем физику для движения
            const targetVelocity = {
                x: VelocityComponent.x[eid],
                y: VelocityComponent.y[eid],
                z: VelocityComponent.z[eid]
            };

            rigidBody.setLinvel(targetVelocity, true);
        } else {
            // Отладка без физики
            PositionComponent.x[eid] += (VelocityComponent.x[eid] * world.time.delta) / 1000;
            PositionComponent.y[eid] += (VelocityComponent.y[eid] * world.time.delta) / 1000;
            PositionComponent.z[eid] += (VelocityComponent.z[eid] * world.time.delta) / 1000;
        }

        // Поворот в направлении движения
        const speedX = VelocityComponent.x[eid];
        const speedZ = VelocityComponent.z[eid];
        const speed = Math.sqrt(speedX * speedX + speedZ * speedZ);

        if (speed > 0.1) {
            RotationComponent.y[eid] = Math.atan2(speedX, speedZ);
        }
    });

    return world;
});