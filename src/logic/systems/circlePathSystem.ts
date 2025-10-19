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

        // Вычисляем желаемую позицию на окружности
        const targetX = centerX + radius * Math.cos(currentAngle);
        const targetZ = centerZ + radius * Math.sin(currentAngle);

        // Текущая позиция
        const currentX = PositionComponent.x[eid];
        const currentZ = PositionComponent.z[eid];

        // Вектор от текущей позиции к целевой
        const correctionX = targetX - currentX;
        const correctionZ = targetZ - currentZ;

        // Вектор касательной скорости (перпендикулярно радиус-вектору)
        // Для движения по окружности скорость должна быть направлена по касательной
        const tangentX = -Math.sin(currentAngle); // Компонента X касательного вектора
        const tangentZ = Math.cos(currentAngle);  // Компонента Z касательного вектора

        // Основная скорость по касательной
        const baseSpeed = angularSpeed * radius;

        // Корректирующая скорость к целевой позиции (можно настроить коэффициент)
        const correctionStrength = 0.1; // Чем больше, тем быстрее коррекция
        const correctionSpeedX = correctionX * correctionStrength;
        const correctionSpeedZ = correctionZ * correctionStrength;

        // Устанавливаем вектор скорости
        VelocityComponent.x[eid] = tangentX * baseSpeed + correctionSpeedX;
        VelocityComponent.z[eid] = tangentZ * baseSpeed + correctionSpeedZ;
        VelocityComponent.y[eid] = 0; // Обнуляем Y, так как движение в плоскости XZ

        // Опционально: корректируем позицию для предотвращения накопления ошибок
        // PositionComponent.x[eid] = currentX;
        // PositionComponent.z[eid] = currentZ;
    }

    return world;
});
