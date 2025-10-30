import {HealthPack} from "./HealthPack.tsx";
import {healthPackQuery} from "../../logic/queries";
import {useWorld} from "../hooks/useWorld.tsx";
import {HealthPackEntity} from "../../entities/HealthPackEntity.ts";
import {useCallback} from "react";

export function HealthPackList() {
    const world = useWorld();
    const hpIds = healthPackQuery(world)

    const components = useCallback(() => hpIds.map((hpId) => {
        const healthPack = world.entityManager.getEntityByName(`healthPack${hpId}`) as HealthPackEntity;

        return <HealthPack key={hpId} position={[healthPack.position.x, healthPack.position.y, healthPack.position.z]}/>
    }), [hpIds, world.entityManager])

    return <>
        {components()}
    </>
}
