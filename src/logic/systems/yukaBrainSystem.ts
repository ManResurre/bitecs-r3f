import {defineSystem} from "bitecs";
import {CustomWorld} from "../../types";
import {mobsQuery} from "../queries";

// const textDecoder = new TextDecoder();

export const yukaBrainSystem = defineSystem((world: CustomWorld) => {
    if (!world.navMesh)
        return world;

    // const mobs = mobsQuery(world);
    // for (const mobId of mobs) {
    //
    // }
    // console.log(world.entityManager);

    return world;
});
