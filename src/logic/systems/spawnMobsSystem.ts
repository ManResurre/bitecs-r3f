import {
    addComponent,
    addEntity,
    defineSystem,
} from "bitecs";
import {mobsQuery, spawnMobsQuery} from "../queries";
import {
    MobComponent,
    SpawnComponent,
} from "../components";
import {World} from "../../entities/World.ts";
import {Vector3} from "three";

const textEncoder = new TextEncoder();

export enum MOB_STATE {
    IDLE,
    MOVING
}

export const spawnMobsSystem = defineSystem((world: World) => {
    if (!world.crowd)
        return world;

    const spawnPoints = spawnMobsQuery(world);

    for (const spawnId of spawnPoints) {
        if (SpawnComponent.cooldown[spawnId] > 0)
            SpawnComponent.cooldown[spawnId] -= world.time.delta;

        const mobs = mobsQuery(world);
        if (
            SpawnComponent.cooldown[spawnId] <= 0 &&
            mobs.length < SpawnComponent.max[spawnId]
        ) {
            //Add Mob
            const eid = addEntity(world);
            addComponent(world, MobComponent, eid);

            MobComponent.name[eid] = textEncoder.encode('zombie');
            MobComponent.state[eid] = MOB_STATE.IDLE;

            const nearestPoly = world.navMeshQuery?.findNearestPoly(
                new Vector3(),
                {halfExtents: {x: 2, y: 10, z: 2}}
            );

            const {agentIndex} = world.crowd.addAgent(nearestPoly?.nearestPoint!, {
                radius: 1,
                height: 1.8,
                maxAcceleration: 2.0,    // Убедитесь, что ускорение не 0
                maxSpeed: 2.5,           // Убедитесь, что скорость не 0
                collisionQueryRange: 2.5,
                separationWeight: 2.0,
                updateFlags: 7           // Убедитесь, что флаги включают движение
            });

            MobComponent.crowdId[eid] = agentIndex;

            console.log(mobs.length);

            SpawnComponent.cooldown[spawnId] += SpawnComponent.delay[spawnId];
        }
    }

    return world;
});
