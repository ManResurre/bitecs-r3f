import {addComponent, addEntity, defineSystem, removeEntity} from "bitecs";
import {CustomWorld} from "../../types";
import {bulletQuery} from "../queries";
import {BulletComponent} from "../components";
import {Projectile} from "../../entities/Projectile.ts";
import {Vector3} from "yuka";
import {Vector3 as TreeVector3} from "three";

const bullets = new Map();

export const addBullet = (arId: number, from: TreeVector3, to: Vector3, world: CustomWorld) => {
    const bId = addEntity(world);
    addComponent(world, BulletComponent, bId);

    BulletComponent.arId[bId] = arId;

    BulletComponent.from.x[bId] = from.x;
    BulletComponent.from.y[bId] = from.y;
    BulletComponent.from.z[bId] = from.z;

    BulletComponent.to.x[bId] = to.x;
    BulletComponent.to.y[bId] = to.y;
    BulletComponent.to.z[bId] = to.z;

    BulletComponent.time[bId] = world.time.elapsed;
}

export const spawnBulletSystem = defineSystem((world: CustomWorld) => {
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
