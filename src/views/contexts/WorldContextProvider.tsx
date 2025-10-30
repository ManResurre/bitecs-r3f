import {PropsWithChildren} from "react";
import {LevelData} from "../../types/LevelData.tsx";
import {createLevel} from "../../logic/createLevel.ts";
import {pipe} from "bitecs";
import {timeSystem} from "../../logic/systems/timeSystem.ts";
import {useFrame} from "@react-three/fiber";
import {WorldContext} from "./WorldContext.tsx";
import {spawnMobsSystem} from "../../logic/systems/spawnMobsSystem.ts";
import {loadNavMeshSystem} from "../../logic/systems/loadNavMeshSystem.ts";
import {yukaIntegrationSystem} from "../../logic/systems/yukaIntegrationSystem.ts";
import {spawnHealthSystem} from "../../logic/systems/spawnHealthSystem.ts";

export function WorldContextProvider({
                                         children,
                                         levelData,
                                     }: PropsWithChildren<{ levelData: LevelData }>) {
    const world = createLevel(levelData);

    loadNavMeshSystem(world);
    // pathPlannerSystem(world);

    const pipeline = pipe(
        timeSystem,
        spawnMobsSystem,
        spawnHealthSystem,
        yukaIntegrationSystem
        // pathDecisionSystem,    // Принятие решений о путях
        // pathMovementSystem,    // Движение по пути
        // physicsMovementSystem,
    );

    useFrame(() => {
        pipeline(world);
    });

    return (
        <WorldContext.Provider value={world}>{children}</WorldContext.Provider>
    );
}
