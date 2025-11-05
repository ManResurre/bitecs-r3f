import {addComponent, addEntity, defineSystem, removeEntity} from "bitecs";
import {CustomWorld} from "../../types";
import {bulletQuery} from "../queries";
import {BulletComponent} from "../components";
import {Projectile} from "../../entities/Projectile.ts";

const bullets = new Map();

export const spawnBulletSystem = defineSystem((world: CustomWorld) => {
    // if (!bullets.has('test')) {
    //     const bId = addEntity(world);
    //     addComponent(world, BulletComponent, bId);
    //     BulletComponent.from.x[bId] = 0;
    //     BulletComponent.from.y[bId] = 0;
    //     BulletComponent.from.z[bId] = 0;
    //
    //     BulletComponent.to.x[bId] = 0;
    //     BulletComponent.to.y[bId] = 1;
    //     BulletComponent.to.z[bId] = 0;
    //
    //     BulletComponent.time[bId] = 0;
    //     const bullet = new Projectile(bId);
    //     bullets.set('test', bullet);
    //     world.entityManager.add(bullet);
    // }

    // console.log(world.entityManager);

    const bulletIds = bulletQuery(world);
    for (const bId of bulletIds) {
        if (!bullets.has(bId)) {
            // Создаем пулю только один раз при первом обнаружении
            const bullet = new Projectile(bId);
            bullets.set(bId, bullet);
            world.entityManager.add(bullet);
        } else {
            // Проверяем истекло ли время жизни пули
            if (world.time.elapsed > BulletComponent.time[bId] + 5000) {
                const entity = bullets.get(bId);
                world.entityManager.remove(entity);
                bullets.delete(bId);
                removeEntity(world, bId);
            }
        }
    }

    return world;
});
