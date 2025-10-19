import {
    addComponent,
    addEntity,
    defineSystem,
    IWorld,
    removeEntity,
} from "bitecs";
import {mobsQuery, spawnMobsQuery, spawnQuery} from "../queries";
import {
    MobComponent,
    PositionComponent,
    RotationComponent, SelectedCellComponent,
    SpawnComponent,
    SpeedComponent,
    VelocityComponent,
} from "../components";
import {WithTime} from "../../types";

export const spawnMobsSystem = defineSystem((world: WithTime<IWorld>) => {
    const spawnPoints = spawnMobsQuery(world);

    for (const spawnId of spawnPoints) {
        SpawnComponent.cooldown[spawnId] -= world.time.delta;

        const mobs = mobsQuery(world);

        if (
            SpawnComponent.cooldown[spawnId] <= 0 &&
            mobs.length < SpawnComponent.max[spawnId]
        ) {
            //Add Mob
            const eid = addEntity(world);

            addComponent(world, PositionComponent, eid);
            addComponent(world, RotationComponent, eid);
            addComponent(world, VelocityComponent, eid);
            addComponent(world, SpeedComponent, eid);
            addComponent(world, MobComponent, eid);
            addComponent(world, SelectedCellComponent, eid);

            MobComponent.name[eid] = MobComponent.name[spawnId];
            PositionComponent.x[eid] = PositionComponent.x[spawnId];
            PositionComponent.y[eid] = PositionComponent.y[spawnId];
            PositionComponent.z[eid] = PositionComponent.z[spawnId];

            RotationComponent.y[eid] = Math.floor(Math.random() * 4);

            SpeedComponent.maxSpeed[eid] = 0.5;
            SpeedComponent.acceleration[eid] = 0.1;

            SpawnComponent.cooldown[spawnId] += SpawnComponent.delay[spawnId];
        }


        // if (
        //     SpawnComponent.cooldown[spawnId] <= 0 &&
        //     mobs.length === SpawnComponent.max[spawnId]
        // ) {
        //     const eid = mobs[Math.floor(Math.random() * mobs.length)];
        //
        //     removeEntity(world, eid);
        //
        //     SpawnComponent.cooldown[spawnId] += SpawnComponent.delay[spawnId];
        // }
    }

    return world;
});
