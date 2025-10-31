import {HealthPackEntity} from "../entities/HealthPackEntity.ts";
import {healthPackQuery} from "../logic/queries";
import {Mob} from "../entities/Mob.ts";

export function findClosestHealthPack(owner: Mob): HealthPackEntity | null {
    const healthIds = healthPackQuery(owner.world);

    let closestItem = null;
    let minDistance = Infinity;
    for (const hpId of healthIds) {
        const health = owner.world.entityManager.getEntityByName(`healthPack${hpId}`) as HealthPackEntity;

        if (!health.active)
            continue;

        const fromRegion = owner.currentRegion!;
        const toRegion = health.currentRegion!;

        const from = owner.world.navMesh!.getNodeIndex(fromRegion);
        const to = owner.world.navMesh!.getNodeIndex(toRegion);

        const distance = owner.world.costTable!.get(from, to);
        if (distance < minDistance) {
            minDistance = distance;
            closestItem = health;
        }
    }

    return closestItem;
}
