import {
    addComponent,
    addEntity,
    defineSystem,
    IWorld,
    removeEntity,
} from "bitecs";
import {mobsQuery, spawnMobsQuery} from "../queries";
import {
    AStarPathMovementComponent,
    CircleMovementComponent,
    MobComponent,
    PositionComponent,
    RotationComponent, SelectedCellComponent,
    SpawnComponent,
    SpeedComponent,
    VelocityComponent,
} from "../components";
import {WithTime} from "../../types";

const radius = 5;

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
            addComponent(world, CircleMovementComponent, eid);
            addComponent(world, AStarPathMovementComponent, eid);

            MobComponent.name[eid] = MobComponent.name[spawnId];

            const currentX = PositionComponent.x[spawnId] + radius * Math.cos(0);
            const currentZ = PositionComponent.z[spawnId] + radius * Math.sin(0);

            PositionComponent.x[eid] = currentX;
            PositionComponent.y[eid] = PositionComponent.y[spawnId];
            PositionComponent.z[eid] = currentZ;

            RotationComponent.y[eid] = Math.floor(Math.random() * 4);

            SpeedComponent.maxSpeed[eid] = 0.5;
            SpeedComponent.acceleration[eid] = 0.5;

            SpawnComponent.cooldown[spawnId] += SpawnComponent.delay[spawnId];

            CircleMovementComponent.angle[eid] = 0;
            CircleMovementComponent.radius[eid] = radius;
            CircleMovementComponent.centerX[eid] = PositionComponent.x[spawnId];
            CircleMovementComponent.centerZ[eid] = PositionComponent.z[spawnId];
            CircleMovementComponent.angularSpeed[eid] = 0.2;

            AStarPathMovementComponent.timeToNextThink[eid] = 5000;
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
