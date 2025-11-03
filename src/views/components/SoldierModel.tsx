import {useAnimations, useGLTF} from "@react-three/drei";
import React, {RefObject, useEffect, useMemo, useRef} from "react";
import {cloneWithSkinning} from "../../utils/SceneHelper.ts";
import {Mob} from "../../entities/Mob.ts";
import {AnimationAction, Group} from "three";
import {useWorld} from "../hooks/useWorld.tsx";
import {useFrame} from "@react-three/fiber";
import AssaultRifle from "./AssaultRifle.tsx";

export interface SoldierModelProps {
    eid: number;
    scale?: number;
    castShadow?: boolean;
    receiveShadow?: boolean;
    debug?: boolean;
}

const SoldierModel = ({eid, ...props}: SoldierModelProps) => {
    const world = useWorld();
    const groupRef = useRef<Group>(null);
    const weaponRef = useRef<Group>(null) as RefObject<Group>;
    const {scene, animations} = useGLTF("./models/soldier.glb");
    const {actions, names, mixer} = useAnimations(animations, groupRef);

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
                // console.log("Оружие привязано к кости");
                // Устанавливаем локальную позицию относительно кости
                weaponRef.current.position.set(-5, 20, 7);
                weaponRef.current.rotation.set(Math.PI / 2.15, Math.PI, 0);
                weaponRef.current.scale.set(100, 100, 100); // Увеличиваем масштаб
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

    // Обновляем направления в useFrame
    useFrame(() => {
        const mobEntity: Mob = world.entityManager?.getEntityByName(`mob_${eid}`) as Mob;
        if (mobEntity && groupRef.current) {
            groupRef.current.position.copy(mobEntity.position.clone())
            groupRef.current.quaternion.copy(mobEntity.rotation.clone());
        }
    });

    return (
        <>
            <primitive
                ref={groupRef}
                object={clonedScene}
                {...props}
            />

            <AssaultRifle ref={weaponRef}/>
        </>
    );
};

export default React.memo(SoldierModel);
