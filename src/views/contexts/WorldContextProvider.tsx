import {PropsWithChildren} from "react";
import {LevelData} from "../../types/LevelData.tsx";
import {createLevel} from "../../logic/createLevel.ts";
import {pipe} from "bitecs";
import {timeSystem} from "../../logic/systems/timeSystem.ts";
import {useFrame} from "@react-three/fiber";
import {WorldContext} from "./WorldContext.tsx";
import {spawnMobsSystem} from "../../logic/systems/spawnMobsSystem.ts";
import {selectCellSystem} from "../../logic/systems/selectCellSystem.ts";
import {astarPathSystem} from "../../logic/systems/astarPathSystem.ts";
import {decisionSystem} from "../../logic/systems/decisionSystem.ts";
import {collisionAvoidanceSystem} from "../../logic/systems/collisionAvoidanceSystem.ts";
import {spatialGridSystem} from "../../logic/systems/spatialGridSystem.ts";
import {physicsMovementSystem} from "../../logic/systems/physicsMovementSystem.ts";
import {cleanupSystem} from "../../logic/systems/cleanupSystem.ts";
import {particleSystem} from "../../logic/systems/particleSystem.ts";
import {particleEmitterSystem} from "../../logic/systems/particleEmitterSystem.ts";
import {loadNavMeshSystem} from "../../logic/systems/loadNavMeshSystem.ts";
import {pathFindSystem} from "../../logic/systems/pathFindSystem.ts";

export function WorldContextProvider({
                                         children,
                                         levelData,
                                     }: PropsWithChildren<{ levelData: LevelData }>) {
    const world = createLevel(levelData);

    loadNavMeshSystem(world);

    const pipeline = pipe(
        timeSystem,
        spawnMobsSystem,
        pathFindSystem,
        // selectCellSystem,
        // Система для построения spatial grid
        // spatialGridSystem,
        // AI системы
        // decisionSystem,
        // Рассчитываем пути
        // astarPathSystem,
        // Избегание столкновений
        // collisionAvoidanceSystem,
        // Движение через физику
        physicsMovementSystem,

        // particleEmitterSystem, // ← добавляем систему эмиттера
        // particleSystem,        // ← добавляем систему обновления частиц

        // Очистка
        cleanupSystem
    );

    useFrame(() => {
        pipeline(world);
    });

    return (
        <WorldContext.Provider value={world}>{children}</WorldContext.Provider>
    );
}
