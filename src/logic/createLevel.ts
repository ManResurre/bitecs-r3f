import {createWorld, addEntity, addComponent, IWorld} from "bitecs";
import {
    PositionComponent,
    SpawnComponent, MobComponent,
} from "./components";
import {LevelData} from "../types/LevelData";
import {RapierRigidBody} from "@react-three/rapier";
import {CustomWorld} from "../types";

const textEncoder = new TextEncoder();

// const textDecoder = new TextDecoder();

export function createLevel(levelData: LevelData) {
    const world = createWorld({
        time: {delta: 0, elapsed: 0, then: performance.now()},
        size: {
            width: 20,
            height: 20,
        },
        rigidBodies: new Map()
    }) as CustomWorld;

    setSpawnMobs(levelData.mobs, world);

    return world;
}

export function setSpawnMobs(mobs: LevelData["mobs"], world: IWorld) {
    for (let i = 0; i < mobs.length; i++) {
        const eid = addEntity(world);

        addComponent(world, SpawnComponent, eid);
        addComponent(world, PositionComponent, eid);
        addComponent(world, MobComponent, eid);

        PositionComponent.x[eid] = mobs[i].position[0];
        PositionComponent.z[eid] = mobs[i].position[1];

        SpawnComponent.delay[eid] = mobs[i].delay;
        SpawnComponent.max[eid] = mobs[i].max;
        SpawnComponent.cooldown[eid] = 0;

        MobComponent.name[eid] = textEncoder.encode(mobs[i].name);
    }
}
