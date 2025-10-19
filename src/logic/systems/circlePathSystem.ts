import {defineSystem} from "bitecs";
import {mobsQuery} from "../queries";
import {CustomWorld} from "../../types";
import {CircleMovementComponent, PositionComponent, VelocityComponent} from "../components";

export const circlePathSystem = defineSystem((world: CustomWorld) => {
    const mobs = mobsQuery(world);

    for (const eid of mobs) {
        if (!CircleMovementComponent.centerX[eid]) continue;

        // Получаем параметры окружности
        const centerX = CircleMovementComponent.centerX[eid];
        const centerZ = CircleMovementComponent.centerZ[eid];
        const radius = CircleMovementComponent.radius[eid];
        const angularSpeed = CircleMovementComponent.angularSpeed[eid];

        // Обновляем угол
        CircleMovementComponent.angle[eid] += angularSpeed * (world.time.delta / 1000);
        const currentAngle = CircleMovementComponent.angle[eid];

        // Вычисляем текущую позицию на окружности
        const currentX = centerX + radius * Math.cos(currentAngle);
        const currentZ = centerZ + radius * Math.sin(currentAngle);

        // Вектор касательной скорости (перпендикулярно радиус-вектору)
        // Для движения по окружности скорость должна быть направлена по касательной
        const tangentX = -Math.sin(currentAngle); // Компонента X касательного вектора
        const tangentZ = Math.cos(currentAngle);  // Компонента Z касательного вектора

        // Скорость = касательный вектор × угловая скорость × радиус
        const speed = angularSpeed * radius;

        // Устанавливаем вектор скорости
        VelocityComponent.x[eid] = tangentX * speed;
        VelocityComponent.z[eid] = tangentZ * speed;
        VelocityComponent.y[eid] = 0; // Обнуляем Y, так как движение в плоскости XZ

        // Опционально: корректируем позицию для предотвращения накопления ошибок
        // PositionComponent.x[eid] = currentX;
        // PositionComponent.z[eid] = currentZ;
    }

    return world;
});
