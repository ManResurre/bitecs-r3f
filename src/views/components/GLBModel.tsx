import {useAnimations, useGLTF} from "@react-three/drei";
import {useEffect, useMemo, useRef, useState} from "react";
import {cloneWithSkinning} from "../../utils/SceneHelper.ts";
import {Mob} from "../../entities/Mob.ts";
import {AnimationAction, Quaternion as TREEQuaternion} from "three";
import {useWorld} from "../hooks/useWorld.tsx";
import {useFrame} from "@react-three/fiber";
import DebugArrows from "./DebugArrows.tsx";
import {Quaternion, Vector3} from "yuka";

export interface SoldierModelProps {
    eid: number;
    position?: Vector3;
    scale?: number;
    castShadow?: boolean;
    receiveShadow?: boolean;
    debug?: boolean;
}


const SoldierModel = ({eid, debug = true, position, ...props}: SoldierModelProps) => {
    const world = useWorld();
    const groupRef = useRef(null);
    const {scene, animations} = useGLTF("./models/soldier.glb");
    const {actions, names, mixer} = useAnimations(animations, groupRef);

    const [lookDirection, setLookDirection] = useState(new Vector3(0, 0, 1));
    const [moveDirection, setMoveDirection] = useState(new Vector3(0, 0, 1));
    const [quaternion, setQuaternion] = useState(new Quaternion());

    const clonedScene = useMemo(() => {
        return cloneWithSkinning(scene);
    }, [scene])

    useEffect(() => {
        // Сохраняем миксер в компонент Mob
        const mobEntity: Mob = world.entityManager?.getEntityByName(`mob_${eid}`) as Mob;
        if (mobEntity) {
            mobEntity.setAnimations(mixer, actions as Record<string, AnimationAction>, names);
        }
    }, [mixer, actions, eid, world.entityManager, names]);

    // Обновляем направления в useFrame
    useFrame(() => {
        const mobEntity: Mob = world.entityManager?.getEntityByName(`mob_${eid}`) as Mob;
        if (mobEntity) {
            setLookDirection(mobEntity.lookDirection.clone());
            setMoveDirection(mobEntity.moveDirection.clone());
            setQuaternion(mobEntity.rotation.clone());
        }
    });

    return (
        <>
            <primitive
                ref={groupRef}
                position={position}
                quaternion={new TREEQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w)}
                object={clonedScene}
                {...props}
            />
            {debug && (
                <DebugArrows
                    position={position!}
                    lookDirection={lookDirection}
                    moveDirection={moveDirection}
                />
            )}
        </>
    );
};

export default SoldierModel;
