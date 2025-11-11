import {defineQuery} from "bitecs";
import {
    ColorComponent,
    HealthComponent,
    MobComponent,
    ParticleComponent,
    ParticleEmitterComponent,
    PositionComponent,
    RotationComponent,
    SpawnComponent,
    SpeedComponent,
    TileComponent,
    VelocityComponent,
    MobYukaEntityComponent,
    HealthPackSpawnComponent,
    HealthPackComponent,
    AssaultRifleComponent,
    BulletComponent, MobSpawnComponent,
} from "../components";
import {FlowComponent} from "../components/FlowComponent";

export const movementQuery = defineQuery([
    PositionComponent,
    RotationComponent,
    VelocityComponent,
    SpeedComponent,
]);

export const tilesQuery = defineQuery([
    PositionComponent,
    RotationComponent,
    TileComponent,
]);

export const flowQuery = defineQuery([
    ColorComponent,
    PositionComponent,
    FlowComponent,
]);

export const spawnMobsQuery = defineQuery([
    PositionComponent,
    SpawnComponent,
    MobSpawnComponent
]);

export const mobsQuery = defineQuery([
    MobComponent,
]);

export const assaultRifleQuery = defineQuery([
    AssaultRifleComponent
]);

export const bulletQuery = defineQuery([
    BulletComponent
]);

export const yukaQuery = defineQuery([
    MobYukaEntityComponent
])

export const healthPackSpawnQuery = defineQuery([
    SpawnComponent,
    PositionComponent,
    HealthPackSpawnComponent
])

export const healthPackQuery = defineQuery([
    HealthPackComponent,
])

export const healthQuery = defineQuery([
    HealthComponent,
]);

export const particleQuery = defineQuery([ParticleComponent, PositionComponent]);
export const particleEmitterQuery = defineQuery([ParticleEmitterComponent]);
