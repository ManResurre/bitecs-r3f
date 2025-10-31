import {
    addComponent,
    addEntity,
    defineSystem,
} from "bitecs";

import {CustomWorld} from "../../types";
import {healthPackQuery, healthPackSpawnQuery} from "../queries";
import {HealthPackComponent, PositionComponent, SpawnComponent} from "../components";
import {HealthPackEntity} from "../../entities/HealthPackEntity.ts";
import {Vector3} from "yuka";

const textEncoder = new TextEncoder();
export const spawnHealthSystem = defineSystem((world: CustomWorld) => {
    if (!world.navMesh)
        return world;

    const spawns = healthPackSpawnQuery(world)

    for (const spawnId of spawns) {
        if (SpawnComponent.cooldown[spawnId] > 0)
            SpawnComponent.cooldown[spawnId] -= world.time.delta;

        const healthPacks = healthPackQuery(world)
        if (
            healthPacks.length < spawns.length
        ) {
            const eid = addEntity(world);
            addComponent(world, HealthPackComponent, eid);
            const name = `healthPack${eid}`;
            HealthPackComponent.entityId[eid] = textEncoder.encode(name);
            const healthPack = new HealthPackEntity(eid, name, world);
            healthPack.setPosition(new Vector3(PositionComponent.x[spawnId], PositionComponent.y[spawnId], PositionComponent.z[spawnId]))
            world.entityManager.add(healthPack);
        }


        for (const hpId of healthPacks) {
            const hp = world.entityManager.getEntityByName(`healthPack${hpId}`) as HealthPackEntity

            if (!hp?.active) {
                hp.respawnTimer -= world.time.delta/1000;
                if (hp.respawnTimer < 0) {
                    hp?.setActive(true);
                    hp.respawnTimer = 30;
                }
            }
        }

    }

    return world;
});
