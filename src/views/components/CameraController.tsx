import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "../../core/math/Vector3.ts";
import { useWorld } from "../hooks/useWorld.tsx";
import { PlayerEntity } from "../../entities/soldier/PlayerEntity.ts";

const CameraController = () => {
    const { camera } = useThree();
    const world = useWorld();
    const cameraOffset = useRef(new Vector3(0, 10, 5));
    const targetPosition = useRef(new Vector3());
    const currentPosition = useRef(new Vector3());

    useFrame((_, delta) => {
        if (!world.playerId) return;

        const player = world.entityManager.get(world.playerId!) as PlayerEntity;
        if (!player) return;

        // Используем позицию игрока
        const playerPos = player.position;

        targetPosition.current.copy(playerPos).add(cameraOffset.current);
        currentPosition.current.lerp(targetPosition.current, 5 * delta);
        camera.position.copy(currentPosition.current);

        const lookAtTarget = new Vector3(playerPos.x, playerPos.y + 2, playerPos.z);
        camera.lookAt(lookAtTarget);
    });

    return null;
};

export default CameraController;
