import { defineSystem } from "bitecs";
import { exitQuery } from "bitecs";
import { mobsQuery } from "../queries";
import { CustomWorld } from "../../types";

export const cleanupSystem = defineSystem((world: CustomWorld) => {
    const removedMobs = exitQuery(mobsQuery)(world);

    removedMobs.forEach((eid) => {
        // Удаляем RigidBody при удалении entity
        if (world.rigidBodies.has(eid)) {
            world.rigidBodies.delete(eid);
        }
    });

    return world;
});