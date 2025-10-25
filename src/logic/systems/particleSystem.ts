// systems/particleSystem.ts
import {ParticleComponent, PositionComponent} from "../components";
import {defineSystem, removeEntity} from "bitecs";
import {CustomWorld} from "../../types";
import {particleQuery} from "../queries";

export const particleSystem = defineSystem((world: CustomWorld) => {
    const particles = particleQuery(world);

    // Используем for loop вместо forEach для производительности
    for (let i = 0; i < particles.length; i++) {
        const eid = particles[i];

        // Уменьшаем время жизни
        ParticleComponent.life[eid] -= world.time.delta;

        // Удаляем "мертвые" частицы
        if (ParticleComponent.life[eid] <= 0) {
            removeEntity(world, eid);
            continue;
        }

        // Обновляем позицию
        const deltaTime = world.time.delta / 1000;
        PositionComponent.x[eid] += ParticleComponent.velocityX[eid] * deltaTime;
        PositionComponent.y[eid] += ParticleComponent.velocityY[eid] * deltaTime;
        PositionComponent.z[eid] += ParticleComponent.velocityZ[eid] * deltaTime;

        // Дополнительные эффекты (опционально)
        const lifeRatio = ParticleComponent.life[eid] / ParticleComponent.maxLife[eid];

        // Уменьшаем размер в конце жизни
        if (lifeRatio < 0.3) {
            ParticleComponent.size[eid] = ParticleComponent.size[eid] * 0.95;
        }
    }

    return world;
});