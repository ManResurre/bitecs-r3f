// Система для построения spatial grid
import {defineSystem} from "bitecs";
import {CustomWorld} from "../../types";
import {SpatialHashGrid} from "../../utils/SpatialHashGrid.ts";
import {movementQuery} from "../queries";
import {PositionComponent} from "../components";

export const spatialGridSystem = defineSystem((world: CustomWorld & { spatialGrid?: SpatialHashGrid }) => {
    if (!world.spatialGrid) {
        world.spatialGrid = new SpatialHashGrid(2.0);
    }

    const grid = world.spatialGrid;
    grid.clear();

    const entities = movementQuery(world);
    entities.forEach((eid) => {
        grid.insertEntity(
            eid,
            PositionComponent.x[eid],
            PositionComponent.z[eid]
        );
    });

    return world;
});