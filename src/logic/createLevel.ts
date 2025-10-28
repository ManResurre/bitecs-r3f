import {addComponent, addEntity, createWorld, IWorld} from "bitecs";
import {ParticleEmitterComponent, PositionComponent, SpawnComponent,} from "./components";
import {LevelData} from "../types/LevelData";
import {CustomWorld} from "../types";
import {CellSpacePartitioning, EntityManager} from "yuka";

export function createLevel(levelData: LevelData) {
    const world = createWorld({
        time: {delta: 0, elapsed: 0, then: performance.now()},
        size: {
            width: 20,
            height: 20,
        },
        rigidBodies: new Map(),
        entityManager: new EntityManager()
    }) as CustomWorld;

    world.entityManager.spatialIndex = new CellSpacePartitioning(
        world.size.width,
        world.size.height,
        10, // Глубина для 2D-мира
        10, // Количество ячеек по X
        10, // Количество ячеек по Y
        10 // Количество ячеек по Z
    );

    setSpawnMobs(levelData.mobs, world);
    createRainEmitter(world);

    return world;
}

export function setSpawnMobs(mobs: LevelData["mobs"], world: IWorld) {
    for (let i = 0; i < mobs.length; i++) {
        const eid = addEntity(world);

        addComponent(world, SpawnComponent, eid);
        addComponent(world, PositionComponent, eid);

        PositionComponent.x[eid] = mobs[i].position[0];
        PositionComponent.z[eid] = mobs[i].position[1];

        SpawnComponent.delay[eid] = mobs[i].delay;
        SpawnComponent.max[eid] = mobs[i].max;
        SpawnComponent.cooldown[eid] = 0;
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
