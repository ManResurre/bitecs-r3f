import { defineSystem } from "bitecs";
import { addEntity, addComponent } from "bitecs";
import { CustomWorld } from "../../types";
import {
    PositionComponent,
    ParticleComponent,
    ParticleEmitterComponent
} from "../components";
import {particleEmitterQuery} from "../queries";

export const particleEmitterSystem = defineSystem((world: CustomWorld) => {
    const emitters = particleEmitterQuery(world);

    emitters.forEach((emitterEid) => {
        const emitterPos = {
            x: PositionComponent.x[emitterEid],
            y: PositionComponent.y[emitterEid],
            z: PositionComponent.z[emitterEid]
        };

        // Обновляем кулдаун
        ParticleEmitterComponent.cooldown[emitterEid] -= world.time.delta;

        // Создаем новые частицы
        if (ParticleEmitterComponent.cooldown[emitterEid] <= 0) {
            const particleCount = Math.floor(Math.random() * 3) + 1; // 1-3 частицы за раз

            for (let i = 0; i < particleCount; i++) {
                const particleEid = addEntity(world);

                addComponent(world, PositionComponent, particleEid);
                addComponent(world, ParticleComponent, particleEid);

                // Начальная позиция (для дождя - сверху со случайным смещением)
                PositionComponent.x[particleEid] = emitterPos.x + (Math.random() - 0.5) * 10;
                PositionComponent.y[particleEid] = emitterPos.y + 2;
                PositionComponent.z[particleEid] = emitterPos.z + (Math.random() - 0.5) * 10;

                // Свойства частицы
                ParticleComponent.life[particleEid] = 2000; // 2 секунды жизни
                ParticleComponent.maxLife[particleEid] = 2000;
                ParticleComponent.size[particleEid] = 0.1 + Math.random() * 0.1;

                // Скорость (падающий дождь)
                ParticleComponent.velocityX[particleEid] = (Math.random() - 0.5) * 0.1;
                ParticleComponent.velocityY[particleEid] = -2.0 - Math.random() * 15.0; // вниз
                ParticleComponent.velocityZ[particleEid] = (Math.random() - 0.5) * 0.1;

                // Цвет (синий для дождя)
                ParticleComponent.colorR[particleEid] = 0.3;
                ParticleComponent.colorG[particleEid] = 0.5;
                ParticleComponent.colorB[particleEid] = 1.0;
            }

            // Сбрасываем кулдаун
            ParticleEmitterComponent.cooldown[emitterEid] = 1000 / ParticleEmitterComponent.rate[emitterEid];
        }
    });

    return world;
});
