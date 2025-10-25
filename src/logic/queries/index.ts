import {defineQuery, enterQuery, exitQuery} from "bitecs";
import {
    ColorComponent, HealthComponent, MobComponent, ParticleComponent, ParticleEmitterComponent,
    PositionComponent,
    RotationComponent, SelectedCellComponent,
    SpawnComponent,
    SpeedComponent,
    TileComponent,
    VelocityComponent,
} from "../components";
import {FlowComponent} from "../components/FlowComponent";
import {GraphComponent} from "../components/GraphComponent";

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

export const graphQuery = defineQuery([PositionComponent, GraphComponent]);

export const flowQuery = defineQuery([
    ColorComponent,
    PositionComponent,
    FlowComponent,
]);

export const spawnQuery = defineQuery([
    PositionComponent,
    ColorComponent,
    SpawnComponent,
]);

export const spawnMobsQuery = defineQuery([
    PositionComponent,
    SpawnComponent,
    MobComponent
]);

export const enterSpawnQuery = enterQuery(spawnQuery);

export const carsQuery = defineQuery([
    PositionComponent,
    RotationComponent,
    ColorComponent,
]);

export const mobsQuery = defineQuery([
    PositionComponent,
    RotationComponent,
    MobComponent,
    SelectedCellComponent
]);

export const enterCarsQuery = enterQuery(carsQuery);

export const exitCarsQuery = exitQuery(carsQuery);

export const healthQuery = defineQuery([
    HealthComponent,
]);

export const particleQuery = defineQuery([ParticleComponent, PositionComponent]);
export const particleEmitterQuery = defineQuery([ParticleEmitterComponent]);