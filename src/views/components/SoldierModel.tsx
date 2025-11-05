import {useAnimations, useGLTF} from "@react-three/drei";
import React, {useEffect, useMemo, useRef} from "react";
import {cloneWithSkinning} from "../../utils/SceneHelper.ts";
import {Mob} from "../../entities/Mob.ts";
import {AnimationAction, Group} from "three";
import {useWorld} from "../hooks/useWorld.tsx";
import {useFrame} from "@react-three/fiber";
import AssaultRifle, {AssaultRifleRef} from "./AssaultRifle.tsx";
import DebugArrows, {DebugArrowsRef} from "./DebugArrows.tsx";

export interface SoldierModelProps {
    eid: number;
    scale?: number;
    castShadow?: boolean;
    receiveShadow?: boolean;
    debug?: boolean;
}

const SoldierModel = ({eid, ...props}: SoldierModelProps) => {
    const world = useWorld();
    const soldierRef = useRef<Group>(null);
    const weaponRef = useRef<Group>(null);
    const debugArrowsRef = useRef<DebugArrowsRef>(null);

    const mobEntityRef = useRef<Mob | null>(
        world.entityManager?.getEntityByName(`mob_${eid}`) as Mob
    );

    const {scene, animations} = useGLTF("./models/soldier.glb");
    const {actions, names, mixer} = useAnimations(animations, soldierRef);

    const clonedScene = useMemo(() => {
        return cloneWithSkinning(scene);
    }, [scene])

    // Находим кость руки для прикрепления оружия
    const rightHandBone = useMemo(() => {
        return clonedScene.getObjectByName("Armature_mixamorigRightHand");
    }, [clonedScene]);

    // Привязываем оружие к кости один раз при монтировании
    useEffect(() => {
        if (weaponRef.current && rightHandBone) {
            if (weaponRef.current.parent) {
                if (weaponRef.current.parent != rightHandBone) {
                    weaponRef.current.parent.remove(weaponRef.current);
                }
            }

            if (!weaponRef.current.parent) {
                rightHandBone.add(weaponRef.current);
                weaponRef.current.position.set(-5, 20, 7);
                weaponRef.current.rotation.set(Math.PI / 2.15, Math.PI, 0);
                weaponRef.current.scale.set(100, 100, 100);
            }
        }
    }, [rightHandBone]);

    useEffect(() => {
        if (!mobEntityRef.current)
            return;

        mobEntityRef.current.weaponRef = weaponRef;
        mobEntityRef.current.setAnimations(mixer, actions as Record<string, AnimationAction>, names);

    }, [mixer, actions, names]);

    // Обновляем направления в useFrame
    useFrame(() => {
        if (mobEntityRef.current && soldierRef.current) {
            // Позиция всегда синхронизирована
            soldierRef.current.position.copy(mobEntityRef.current.position.clone());

            // Вращение модели определяет направление взгляда (стрельбы)
            soldierRef.current.quaternion.copy(mobEntityRef.current.quaternion.clone());

            if (debugArrowsRef.current) {
                debugArrowsRef.current.position.copy(mobEntityRef.current.position);

                debugArrowsRef.current.lookDirection.copy(mobEntityRef.current.lookDirection);
                debugArrowsRef.current.moveDirection.copy(mobEntityRef.current.moveDirection);
            }
        }
    });

    return (
        <>
            <primitive
                ref={soldierRef}
                object={clonedScene}
                {...props}
            />

            <AssaultRifle ref={weaponRef} eid={mobEntityRef.current?.arId}/>
            <DebugArrows ref={debugArrowsRef}/>
        </>
    );
};

export default React.memo(SoldierModel);
