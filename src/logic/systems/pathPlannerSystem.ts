import {defineSystem} from "bitecs";
import {CustomWorld} from "../../types";
import {PathPlanner} from "../etc/PathPlanner.ts";


export const pathPlannerSystem = defineSystem((world: CustomWorld) => {
    if (world.navMesh)
        world.pathPlanner = new PathPlanner(world.navMesh);

    return world;
});
