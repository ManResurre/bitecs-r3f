import {defineSystem} from "bitecs";
import {mobsQuery} from "../queries";
import {World} from "../../entities/World.ts";
import {Soldier} from "../../entities/Soldier.ts";

export const animationMobSystem = defineSystem((world: World) => {
    if (!world?.crowd)
        return world;

    const mobs = mobsQuery(world);
    for (const mobId of mobs) {
        const entity: Soldier = world.entityManager.get(mobId);
        if (entity)
            entity.update(world.time.delta);
    }
    // console.log(world.entityManager);

    return world;
});
