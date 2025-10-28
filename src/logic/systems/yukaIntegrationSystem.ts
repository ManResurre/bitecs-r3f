import {defineSystem} from "bitecs";
import {CustomWorld} from "../../types";

// const textDecoder = new TextDecoder();

export const yukaIntegrationSystem = defineSystem((world: CustomWorld) => {
    if (!world.navMesh)
        return world;

    // Обновляем менеджер сущностей
    world.entityManager.update(world.time.delta * 0.001);
    if (world.pathPlanner)
        world.pathPlanner.update();

    return world;
});
