// SoldierModel.tsx
import {useAnimations, useGLTF} from "@react-three/drei";
import React, {RefObject, useEffect, useMemo, useRef} from "react";
import {cloneWithSkinning} from "../../utils/SceneHelper.ts";
import {Mob} from "../../entities/Mob.ts";
import {AnimationAction, Group, Vector3 as TreeVector3} from "three";
import {useWorld} from "../hooks/useWorld.tsx";
import {useFrame} from "@react-three/fiber";
import AssaultRifle from "./AssaultRifle.tsx";
import DebugArrows, {DebugArrowsRef} from "./DebugArrows.tsx";
import {Vector3} from "yuka";

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
    const weaponRef = useRef<Group>(null) as RefObject<Group>;
    const debugArrowsRef = useRef<DebugArrowsRef>(null);

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
        // Сохраняем миксер в компонент Mob
        const mobEntity: Mob = world.entityManager?.getEntityByName(`mob_${eid}`) as Mob;
        if (mobEntity) {
            mobEntity.weaponRef = weaponRef;
            mobEntity.setAnimations(mixer, actions as Record<string, AnimationAction>, names);
        }
    }, [mixer, actions, eid, world.entityManager, names]);

    // Временные векторы для вычислений
    const lookDirection = useMemo(() => new Vector3(), []);
    const moveDirection = useMemo(() => new Vector3(), []);

    // Обновляем направления в useFrame
    useFrame(() => {
        const mobEntity: Mob = world.entityManager?.getEntityByName(`mob_${eid}`) as Mob;
        if (mobEntity && soldierRef.current) {
            // Позиция всегда синхронизирована
            soldierRef.current.position.copy(mobEntity.position.clone());

            // Вращение модели определяет направление взгляда (стрельбы)
            // soldierRef.current.quaternion.copy(mobEntity.rotation.clone());
            soldierRef.current.quaternion.copy(mobEntity.quaternion.clone());

            if (debugArrowsRef.current) {
                debugArrowsRef.current.position.copy(mobEntity.position);

                debugArrowsRef.current.lookDirection.copy(mobEntity.lookDirection);
                debugArrowsRef.current.moveDirection.copy(mobEntity.moveDirection);
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

            <AssaultRifle ref={weaponRef}/>
            <DebugArrows ref={debugArrowsRef}/>
        </>
    );
};

export default React.memo(SoldierModel);
