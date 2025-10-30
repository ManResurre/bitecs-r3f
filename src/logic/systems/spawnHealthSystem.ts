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
            SpawnComponent.cooldown[spawnId] <= 0 &&
            healthPacks.length < spawns.length
        ) {
            SpawnComponent.cooldown[spawnId] += SpawnComponent.delay[spawnId];
            const eid = addEntity(world);

            addComponent(world, HealthPackComponent, eid);

            const name = `healthPack${eid}`;
            HealthPackComponent.entityId[eid] = textEncoder.encode(name);
            const healthPack = new HealthPackEntity(eid, name, world);
            healthPack.position = new Vector3(PositionComponent.x[spawnId], PositionComponent.y[spawnId], PositionComponent.z[spawnId]);

            world.entityManager.add(healthPack);
        }
    }

    return world;
});
