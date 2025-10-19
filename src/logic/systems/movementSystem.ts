import {defineSystem} from "bitecs";
import {movementQuery} from "../queries";
import {
    PositionComponent,
    RotationComponent,
    SpeedComponent,
    VelocityComponent,
} from "../components";
import {CustomWorld} from "../../types";

export const movementSystem = defineSystem((world: CustomWorld) => {
    const movingEntities = movementQuery(world);

    movingEntities.forEach((eid) => {
        PositionComponent.x[eid] +=
            (VelocityComponent.x[eid] * world.time.delta) / 1000;
        PositionComponent.y[eid] +=
            (VelocityComponent.y[eid] * world.time.delta) / 1000;
        PositionComponent.z[eid] +=
            (VelocityComponent.z[eid] * world.time.delta) / 1000;

        //В целом поворот скорее всего лучше делать где то в r3f наверное, хотя можно и в отдельной системе
        //Вообще это просто для дебага позиции
        // Поворачиваем моба в направлении скорости
        const speedX = VelocityComponent.x[eid];
        const speedZ = VelocityComponent.z[eid];

        // Вычисляем угол поворота в радианах
        // atan2(z, x) дает угол относительно положительной оси X
        RotationComponent.y[eid] = Math.atan2(speedX, speedZ);
    });

    return world;
});
