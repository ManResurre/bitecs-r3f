import {healthPackQuery} from "../../logic/queries";
import {useWorld} from "../hooks/useWorld.tsx";
import {HealthPackEntity} from "../../entities/HealthPackEntity.ts";
import React, {useCallback, useRef, useState} from "react";
import {useFrame, useLoader} from "@react-three/fiber";
import {GLTFLoader} from "three/examples/jsm/Addons.js";
import HealthPack from "./HealthPack.tsx";

const HealthPackList = () => {
    const world = useWorld();
    const hpIds = healthPackQuery(world);
    const [update, setUpdate] = useState<boolean[]>([])

    const components = useCallback(
        () => hpIds.map((hpId) => {
            const healthPack = world.entityManager.getEntityByName(`healthPack${hpId}`) as HealthPackEntity;

            return healthPack.active && <HealthPack key={hpId}
                                                    position={[healthPack.position.x, healthPack.position.y, healthPack.position.z]}/>
        }), [hpIds, world.entityManager])

    useFrame(() => {
        const active = hpIds.map((hpId) => {
            const healthPack = world.entityManager.getEntityByName(`healthPack${hpId}`) as HealthPackEntity;
            return healthPack.active;
        });

        setUpdate((prev)=>{
            const areEqual = update.length === active.length &&
                active.every((value, index) => value === prev[index]);

            if(!areEqual)
                return active;

            return prev;
        })
        // console.log(active);
    })

    return <>
        {components()}
    </>
}
useLoader.preload(GLTFLoader, './models/level.glb');
export default React.memo(HealthPackList);
