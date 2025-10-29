import { useFrame } from "@react-three/fiber";
import { useState, useMemo, useRef } from "react";
import { YukaEntityComponent } from "../../logic/components";
import { useWorld } from "../hooks/useWorld.tsx";
import { mobsQuery } from "../../logic/queries";
import FbxModel from "./FbxModel.tsx";
import { Vector3 } from "three";
import SoldierModel from "./GLBModel.tsx";

const textDecoder = new TextDecoder();

export function Mobs() {
    const world = useWorld();
    const [mobPositions, setMobPositions] = useState<Map<number, Vector3>>(new Map());
    const mobPositionsRef = useRef(mobPositions);

    // Обновляем позиции мобов каждый кадр
    useFrame(() => {
        const mobs = mobsQuery(world);
        const newPositions = new Map();

        let updated = false;
        for (const eid of mobs) {
            const mobName = textDecoder.decode(YukaEntityComponent.entityId[eid]);
            const yMob = world.entityManager.getEntityByName(mobName);

            if (yMob) {
                const newPos = new Vector3(yMob.position.x, yMob.position.y, yMob.position.z);
                const oldPos = mobPositionsRef.current.get(eid);

                // Обновляем только если позиция изменилась
                if (!oldPos || !oldPos.equals(newPos)) {
                    newPositions.set(eid, newPos);
                    updated = true;
                } else {
                    newPositions.set(eid, oldPos);
                }
            }
        }

        if (updated) {
            mobPositionsRef.current = newPositions;
            setMobPositions(newPositions);
        }
    });

    // Мемоизируем компоненты мобов
    const mobComponents = useMemo(() => {
        const mobs = mobsQuery(world);

        return mobs.map((eid) => {
            const position = mobPositions.get(eid);

            if (!position) {
                return null;
            }

            return (
                <SoldierModel key={eid} position={position} eid={eid}/>
                // <FbxModel
                //     position={position}
                //     // rotation={[0, 0, 0]}
                //     key={eid}
                //     url="/models/npc/bot.fbx"
                // />
            );
        }).filter(Boolean);
    }, [world, mobPositions]);

    return <>{mobComponents}</>;
}
