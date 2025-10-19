import {PropsWithChildren} from "react";
import {LevelData} from "../../types/LevelData.tsx";
import {createLevel} from "../../logic/createLevel.ts";
import {pathfindingSystem} from "../../logic/systems/pathfindingSystem.ts";
import {pipe} from "bitecs";
import {timeSystem} from "../../logic/systems/timeSystem.ts";
import {spawnSystem} from "../../logic/systems/spawnSystem.ts";
import {steeringSystem} from "../../logic/systems/steeringSystem.ts";
import {movementSystem} from "../../logic/systems/movementSystem.ts";
import {damageSystem} from "../../logic/systems/damageSystem.ts";
import {useFrame} from "@react-three/fiber";
import {WorldContext} from "./WorldContext.tsx";
import {spawnMobsSystem} from "../../logic/systems/spawnMobsSystem.ts";
import {selectCellSystem} from "../../logic/systems/selectCellSystem.ts";

export function WorldContextProvider({
                                         children,
                                         levelData,
                                     }: PropsWithChildren<{ levelData: LevelData }>) {
    const world = createLevel(levelData);

    // pathfindingSystem(world);

    const pipeline = pipe(
        timeSystem,
        // spawnSystem,
        spawnMobsSystem,
        selectCellSystem,
        // steeringSystem,
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
