import {useAnimations, useGLTF} from "@react-three/drei";
import React, {useEffect, useMemo, useRef} from "react";
import {cloneWithSkinning} from "../../utils/SceneHelper.ts";
import {Mob} from "../../entities/Mob.ts";
import {AnimationAction, Group, Mesh, MeshBasicMaterial, SphereGeometry, Vector3} from "three";
import {useWorld} from "../hooks/useWorld.tsx";
import {useFrame} from "@react-three/fiber";
import AssaultRifle from "./AssaultRifle.tsx";
import DebugArrows, {DebugArrowsRef} from "./DebugArrows.tsx";
import {VisionHelper} from "./VisionHelper.tsx";
import {Quaternion} from "yuka";
import CONFIG from "../../core/Config.ts";

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
    const visionHelperRef = useRef<Group>(null);
    const targetSpheresRef = useRef<Group>(null); // Ref для сфер целей


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

    // Находим кость головы для прикрепления VisionHelper
    const headBone = useMemo(() => {
        return clonedScene.getObjectByName("Armature_mixamorigHead"); // или другое имя кости головы
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

    // Создаем геометрию и материал для сфер целей
    const targetSphereGeometry = useMemo(() => new SphereGeometry(1, 8, 8), []);
    const targetSphereMaterial = useMemo(() => new MeshBasicMaterial({color: 0x0000A3}), []);

    // Временные векторы для вычислений
    const headWorldPosition = useMemo(() => new Vector3(), []);
    const headWorldDirection = useMemo(() => new Vector3(), []);

    // Обновляем направления в useFrame
    useFrame(() => {
        if (mobEntityRef.current && soldierRef.current) {
            // Позиция всегда синхронизирована
            soldierRef.current.position.copy(mobEntityRef.current.position.clone());

            // Вращение модели определяет направление взгляда (стрельбы)
            soldierRef.current.quaternion.copy(mobEntityRef.current.quaternion.clone());

            // ОБНОВЛЯЕМ РЕАЛЬНОЕ НАПРАВЛЕНИЕ ГОЛОВЫ ИЗ КОСТИ
            if (headBone && mobEntityRef.current) {
                const headWorldPosition = new Vector3();
                const headWorldDirection = new Vector3();

                headBone.getWorldPosition(headWorldPosition);
                headBone.getWorldDirection(headWorldDirection);

                // Передаем мировые координаты в Mob
                mobEntityRef.current.updateActualHeadDirection(headWorldDirection, headWorldPosition);
            }

            if (debugArrowsRef.current) {
                debugArrowsRef.current.position.copy(mobEntityRef.current.position);

                debugArrowsRef.current.lookDirection.copy(mobEntityRef.current.lookDirection);
                debugArrowsRef.current.moveDirection.copy(mobEntityRef.current.moveDirection);
            }

            // Обновляем VisionHelper напрямую из данных моба
            if (visionHelperRef.current) {
                visionHelperRef.current.position.copy(mobEntityRef.current.head.position);
                // visionHelperRef.current.quaternion.copy(mobEntityRef.current.head.quaternion);
                visionHelperRef.current.quaternion.copy(mobEntityRef.current.head.rotation);
                console.log('Head rotation:', mobEntityRef.current.head.rotation);
                console.log('Head forward:', mobEntityRef.current.head.forward);
                console.log('Head position:', mobEntityRef.current.head.position);
            }

            // Обновляем сферы целей
            if (targetSpheresRef.current && mobEntityRef.current.memoryRecords) {
                // Очищаем предыдущие сферы
                while (targetSpheresRef.current.children.length > 0) {
                    targetSpheresRef.current.remove(targetSpheresRef.current.children[0]);
                }

                // Создаем сферы для видимых целей
                mobEntityRef.current.memoryRecords.forEach((record, index) => {
                    if (record.visible && record.entity) {
                        const sphere = new Mesh(targetSphereGeometry, targetSphereMaterial);
                        sphere.position.copy(record.lastSensedPosition);
                        targetSpheresRef.current!.add(sphere);
                    }
                });
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

            {/* VisionHelper как отдельная entity, не привязанная к костям */}
            <group ref={visionHelperRef}>
                {mobEntityRef.current && (
                    <>
                        <VisionHelper
                            fieldOfView={mobEntityRef.current.vision.fieldOfView}
                            range={mobEntityRef.current.vision.range}
                            division={16}
                            color="white"
                        />
                        {/* Стрелка направления взгляда */}
                        <arrowHelper
                            args={[
                                new Vector3(0, 0, 1), // направление
                                new Vector3(0, 0, 0), // начало
                                2, // длина
                                0xff0000 // красный цвет
                            ]}
                        />
                    </>
                )}
            </group>
            {/* Группа для сфер целей */}
            <group ref={targetSpheresRef}/>

            <AssaultRifle ref={weaponRef} eid={mobEntityRef.current?.arId}/>
            <DebugArrows ref={debugArrowsRef}/>
        </>
    );
};

export default React.memo(SoldierModel);
