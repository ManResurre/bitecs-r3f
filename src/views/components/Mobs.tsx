import {useFrame, useLoader} from "@react-three/fiber";
import {FBXLoader} from "three/examples/jsm/Addons.js";
import FbxModel from "./FbxModel.tsx";
import {CuboidCollider, RapierRigidBody, RigidBody} from "@react-three/rapier";
import {useCallback, useEffect, useRef, useState} from "react";
import {PositionComponent, RotationComponent} from "../../logic/components";
import {useWorld} from "../hooks/useWorld.tsx";
import {mobsQuery} from "../../logic/queries";
import {enterQuery, exitQuery} from "bitecs";

export function Mobs() {
    const world = useWorld();
    const rigidBodiesRef = useRef<Map<number, RapierRigidBody>>(new Map());
    const [, setForceUpdate] = useState(0);

    // const handleCollision = (
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     {target, manifold, other}: CollisionEnterPayload) => {
    //     if (other.rigidBodyObject) {
    //         return;
    //     }
    // };

    useFrame(() => {
        const currentMobs = mobsQuery(world);
        // console.log(currentMobs);

        const oldMobs = exitQuery(mobsQuery)(world);
        const newMobs = enterQuery(mobsQuery)(world);

        // Удаляем старые мобы
        // if (oldMobs.length) {
        //     oldMobs.forEach(eid => {
        //         rigidBodiesRef.current.delete(eid);
        //     });
        // }

        // Форсируем перерисовку только при реальных изменениях
        if (newMobs.length || oldMobs.length)
            setForceUpdate(prev => prev + 1);

        // Обновляем позиции существующих мобов
        currentMobs.forEach((eid) => {
            const rigidBody = rigidBodiesRef.current.get(eid);
            if (rigidBody) {
                rigidBody.setTranslation(
                    {
                        x: PositionComponent.x[eid],
                        y: rigidBody.translation().y,
                        z: PositionComponent.z[eid]
                    },
                    true
                );
                rigidBody.setRotation(
                    {x: 0, y: (RotationComponent.y[eid] * Math.PI) / 2, z: 0, w: 1},
                    true
                );
            }
        });
    });

    const setRigidBodyRef = useCallback((eid: number) => (ref: RapierRigidBody | null) => {
        if (ref) {
            rigidBodiesRef.current.set(eid, ref);
        } else {
            rigidBodiesRef.current.delete(eid);
        }
    }, []);

    // Рендерим мобов как React компоненты
    const mobComponents = mobsQuery(world).map((eid) => (
        <RigidBody
            key={eid}
            ref={setRigidBodyRef(eid)}
            position={[
                PositionComponent.x[eid],
                5,
                PositionComponent.z[eid]
            ]}
            rotation={[0, (RotationComponent.y[eid] * Math.PI) / 2, 0]}
            colliders={false}
            lockRotations
        >
            <FbxModel url="/models/npc/bot.fbx"/>
            <CuboidCollider position={[0, 1, 0]} args={[0.5, 1, 0.5]}/>
        </RigidBody>
    ));


    // Очистка при размонтировании
    useEffect(() => {
        // console.log(mobsQuery(world));
        // mobsQuery(world).map((eid)=>{
        //     console.log(eid);
        // })

        return () => {
            rigidBodiesRef.current.clear();
        };
    }, []);


    return <>{mobComponents}</>;
}

useLoader.preload(FBXLoader, '/models/npc/bot.fbx');
