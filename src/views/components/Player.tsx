import React, {useRef, useState} from "react";
import {useWorld} from "../hooks/useWorld.tsx";
import SoldierModel from "./SoldierModel.tsx";
import {playersQuery} from "../../logic/queries";
import {useFrame, useThree} from "@react-three/fiber";
import {Vector3} from "../../core/math/Vector3.ts";
import {Raycaster} from "three";
import {PlayerEntity} from "../../entities/soldier/PlayerEntity.ts";

const Player = () => {
    const world = useWorld();
    const players = playersQuery(world);
    const [, setCount] = useState(0);

    const cameraOffset = useRef(new Vector3(0, 15, 10)); // Смещение камеры сверху-сзади
    const {camera, pointer} = useThree();
    const raycaster = useRef(new Raycaster());
    const mousePosition = useRef(new Vector3());
    const targetPosition = useRef(new Vector3());
    const currentPosition = useRef(new Vector3());

    useFrame((_,delta) => {
        setCount(players.length)
        raycaster.current.setFromCamera(pointer, camera);

        if (!world.levelRef.current)
            return;

        const intersects = raycaster.current.intersectObjects(world.levelRef.current.children);

        if (!intersects.length)
            return;

        mousePosition.current.copy(intersects[0].point);
        const player = world.entityManager.get(world.playerId!) as PlayerEntity;

        if (!player)
            return;

        player.setMousePosition(mousePosition.current);

        // targetPosition.current.copy(player.position).add(cameraOffset.current);
        // currentPosition.current.lerp(targetPosition.current, 5 * delta);
        // camera.position.copy(currentPosition.current);
        //
        // const lookAtTarget = new Vector3(player.position.x, player.position.y + 2, player.position.z);
        // camera.lookAt(lookAtTarget);
    })

    return <>
        {world.playerId && <SoldierModel eid={world.playerId}/>}
    </>
}

export default React.memo(Player)
