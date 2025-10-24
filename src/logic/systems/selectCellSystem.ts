import {defineSystem} from "bitecs";
import {CustomWorld} from "../../types";
import {mobsQuery} from "../queries";
import {PositionComponent, SelectedCellComponent} from "../components";

export const CELL_SIZE = 1;
export const selectCellSystem = defineSystem((world: CustomWorld) => {
    const {size} = world;
    const mobs = mobsQuery(world);

    const getHighlightedCell = (x: number, y: number) => {
        const i = Math.round((x + (size.height * CELL_SIZE) / 2) / CELL_SIZE);
        const j = Math.round((y + (size.width * CELL_SIZE) / 2) / CELL_SIZE);
        return {i, j};
    };
    mobs.map((mobId) => {
        const {i, j} = getHighlightedCell(PositionComponent.x[mobId], -PositionComponent.z[mobId])
        SelectedCellComponent.x[mobId] = i;
        SelectedCellComponent.y[mobId] = j;
    })

    return world;
});
