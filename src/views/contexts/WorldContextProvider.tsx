import {PropsWithChildren} from "react";
import {LevelData} from "../../types/LevelData.tsx";
import {createLevel} from "../../logic/createLevel.ts";
import {pipe} from "bitecs";
import {timeSystem} from "../../logic/systems/timeSystem.ts";
import {movementSystem} from "../../logic/systems/movementSystem.ts";
import {useFrame} from "@react-three/fiber";
import {WorldContext} from "./WorldContext.tsx";
import {spawnMobsSystem} from "../../logic/systems/spawnMobsSystem.ts";
import {selectCellSystem} from "../../logic/systems/selectCellSystem.ts";
import {astarPathSystem} from "../../logic/systems/astarPathSystem.ts";
import {decisionSystem} from "../../logic/systems/decisionSystem.ts";

export function WorldContextProvider({
                                         children,
                                         levelData,
                                     }: PropsWithChildren<{ levelData: LevelData }>) {
    const world = createLevel(levelData);

    // pathfindingSystem(world);
    // astarPathSystem(world);

    const pipeline = pipe(
        timeSystem,
        // spawnSystem,
        spawnMobsSystem,
        selectCellSystem,
        // steeringSystem,
        // circlePathSystem,
        decisionSystem,
        astarPathSystem,
        movementSystem,

        // damageSystem
    );

    useFrame(() => {
        pipeline(world);
    });

    return (
        <WorldContext.Provider value={world}>{children}</WorldContext.Provider>
    );
}
