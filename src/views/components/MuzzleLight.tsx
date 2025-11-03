import React, {RefObject, useRef} from 'react';
import {PointLight, PointLightHelper, Vector3} from "three";
import {useHelper} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {mobsQuery} from "../../logic/queries";
import {useWorld} from "../hooks/useWorld.tsx";
import {Mob} from "../../entities/Mob.ts";

interface MuzzleLightProps {
    position?: Vector3;
    visible?: boolean;
    intensity?: number;
    distance?: number;
    color?: string;
}

const MuzzleLight = ({
                         position = new Vector3(0, 0, 0),
                         visible = true,
                         intensity = 20,
                         distance = 5,
                         color = "#ff7b2c"
                     }: MuzzleLightProps) => {
    const lightRef = useRef<PointLight>(null) as RefObject<PointLight>;
    const lightTime = useRef(0);
    const world = useWorld();


    // Визуальный помощник для света
    useHelper(lightRef, PointLightHelper, 0.5, 'hotpink');

    useFrame(() => {
        lightTime.current++
        if (lightTime.current % 2 == 0) {
            lightTime.current = 0;
            const mobIds = mobsQuery(world);
            for (const mid of mobIds) {
                const mob = world.entityManager.getEntityByName(`mob_${mid}`) as Mob;
                if (mob.weaponRef?.current) {
                    const mf = mob.weaponRef?.current.getObjectByName("MuzzleFlash");
                    const wp = mf?.getWorldPosition(new Vector3());
                    lightRef.current.position.copy(wp);
                }
            }
        }
    })

    return (
        <>
            <pointLight
                ref={lightRef}
                position={position}
                intensity={visible ? intensity : 0}
                distance={distance}
                color={color}
                decay={2}
                castShadow
            />
        </>
    );
};

export default React.memo(MuzzleLight);
