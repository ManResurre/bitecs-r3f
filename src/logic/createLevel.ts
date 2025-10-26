import {createWorld, addEntity, addComponent, IWorld} from "bitecs";
import {
    PositionComponent,
    SpawnComponent, MobComponent, ParticleEmitterComponent,
} from "./components";
import {LevelData} from "../types/LevelData";
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
        rigidBodies: new Map(),
    }) as CustomWorld;

    setSpawnMobs(levelData.mobs, world);
    createRainEmitter(world);

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

export function createRainEmitter(world: CustomWorld) {
    const emitterEid = addEntity(world);

    addComponent(world, PositionComponent, emitterEid);
    addComponent(world, ParticleEmitterComponent, emitterEid);

    // Позиция эмиттера (над сценой)
    PositionComponent.x[emitterEid] = 0;
    PositionComponent.y[emitterEid] = 5;
    PositionComponent.z[emitterEid] = 0;

    // Настройки эмиттера
    ParticleEmitterComponent.rate[emitterEid] = 50; // 50 частиц в секунду
    ParticleEmitterComponent.cooldown[emitterEid] = 0;
    ParticleEmitterComponent.maxParticles[emitterEid] = 500;
    ParticleEmitterComponent.emitterType[emitterEid] = 0; // точечный эмиттер
}
