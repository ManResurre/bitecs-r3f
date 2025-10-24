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

export function WorldContextProvider({
                                         children,
                                         levelData,
                                     }: PropsWithChildren<{ levelData: LevelData }>) {
    const world = createLevel(levelData);

    const pipeline = pipe(
        timeSystem,
        spawnMobsSystem,
        selectCellSystem,
        // Система для построения spatial grid
        spatialGridSystem,
        // AI системы
        decisionSystem,
        // Рассчитываем пути
        astarPathSystem,
        // Избегание столкновений
        collisionAvoidanceSystem,
        // Движение через физику
        physicsMovementSystem,

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
