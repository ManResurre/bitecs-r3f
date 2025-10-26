import {useFrame} from "@react-three/fiber";
import {CuboidCollider, RapierRigidBody, RigidBody} from "@react-three/rapier";
import {useCallback, useEffect, useState} from "react";
import {PositionComponent, RotationComponent} from "../../logic/components";
import {useWorld} from "../hooks/useWorld.tsx";
import {mobsQuery} from "../../logic/queries";
import FbxModel from "./FbxModel.tsx";
import {enterQuery, exitQuery} from "bitecs";

export function Mobs() {
    const world = useWorld();
    const [update, setForceUpdate] = useState(false);

    // Callback для установки RigidBody в мир
    const setRigidBodyRef = useCallback((eid: number) => (ref: RapierRigidBody | null) => {
        if (ref) {
            world.rigidBodies.set(eid, ref);
        } else {
            world.rigidBodies.delete(eid);
        }
    }, [world]);

    useFrame(() => {
        const currentMobs = mobsQuery(world);
        const oldMobs = exitQuery(mobsQuery)(world);
        const newMobs = enterQuery(mobsQuery)(world);

        // Удаляем RigidBody для удаленных мобов
        oldMobs.forEach((eid) => {
            world.rigidBodies.delete(eid);
        });

        // Форсируем перерисовку при изменениях
        if (newMobs.length || oldMobs.length) {
            setForceUpdate(!update);
        }

        // Синхронизируем позиции RigidBody с ECS (физика -> визуал)
        currentMobs.forEach((eid) => {
            const rigidBody = world.rigidBodies.get(eid);
            if (rigidBody) {
                // Берем позицию из физики и применяем к визуальному представлению
                const physPos = rigidBody.translation();

                // Синхронизируем PositionComponent с физикой
                PositionComponent.x[eid] = physPos.x;
                PositionComponent.z[eid] = physPos.z;

                // Для Y можно оставить как есть или тоже синхронизировать
                // PositionComponent.y[eid] = physPos.y;

                // Обновляем вращение
                rigidBody.setRotation(
                    {x: 0, y: RotationComponent.y[eid], z: 0, w: 1},
                    true
                );
            } else {
                // Если RigidBody еще нет, используем позицию из ECS
                // Это нужно для начальной позиции при спавне
                const rigidBody = world.rigidBodies.get(eid);
                if (rigidBody) {
                    rigidBody.setTranslation(
                        {
                            x: PositionComponent.x[eid],
                            y: 0, // или PositionComponent.y[eid]
                            z: PositionComponent.z[eid]
                        },
                        true
                    );
                }
            }
        });
    });

    // Рендерим мобов
    const mobComponents = mobsQuery(world).map((eid) => (
        <RigidBody
            key={eid}
            ref={setRigidBodyRef(eid)}
            position={[
                PositionComponent.x[eid],
                0, // начальная высота
                PositionComponent.z[eid]
            ]}
            rotation={[0, RotationComponent.y[eid], 0]}
            colliders={false}
            lockRotations
            enabledRotations={[false, false, false]} // блокируем все вращения
        >
            <FbxModel url="/models/npc/bot.fbx"/>
            <CuboidCollider
                position={[0, 1, 0]}
                args={[0.5, 1, 0.5]}
                restitution={0.1}
                friction={0.5}
            />
        </RigidBody>
    ));

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            // Очищаем все RigidBody при размонтировании компонента
            mobsQuery(world).forEach((eid) => {
                world.rigidBodies.delete(eid);
            });
        };
    }, [world]);

    return <>{mobComponents}</>;
}
