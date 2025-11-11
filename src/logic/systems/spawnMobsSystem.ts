import {
    addComponent,
    addEntity,
    defineSystem,
} from "bitecs";
import {mobsQuery, spawnMobsQuery} from "../queries";
import {
    CircleMovementComponent,
    MobComponent, PathMovementComponent,
    PositionComponent,
    RotationComponent, SelectedCellComponent,
    SpawnComponent,
    SpeedComponent,
    VelocityComponent, MobYukaEntityComponent,
} from "../components";
import {CustomWorld} from "../../types";
import {Mob} from "../../entities/Mob.ts";
import {Vector3} from "yuka";

const textEncoder = new TextEncoder();

export const spawnMobsSystem = defineSystem((world: CustomWorld) => {
    if (!world.navMesh)
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

            addComponent(world, PositionComponent, eid);
            addComponent(world, RotationComponent, eid);
            addComponent(world, VelocityComponent, eid);
            addComponent(world, SpeedComponent, eid);
            addComponent(world, MobComponent, eid);
            addComponent(world, SelectedCellComponent, eid);
            addComponent(world, CircleMovementComponent, eid);
            addComponent(world, PathMovementComponent, eid);
            addComponent(world, MobYukaEntityComponent, eid);

            MobComponent.name[eid] = textEncoder.encode('zombie');

            //Добавляем Yuka Entity
            const yukaEntity = new Mob(eid, world);
            yukaEntity.initializePosition(new Vector3(
                PositionComponent.x[spawnId],
                PositionComponent.y[spawnId],
                PositionComponent.z[spawnId]
            ))
            world.entityManager.add(yukaEntity);
            MobYukaEntityComponent.entityId[eid] = textEncoder.encode(yukaEntity.name);

            SpawnComponent.cooldown[spawnId] += SpawnComponent.delay[spawnId];

        }
    }

    return world;
});
