import {PropsWithChildren, useEffect} from "react";
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
import {spawnBulletSystem} from "../../logic/systems/spawnBulletSystem.ts";
import {useControls} from "leva";
import {spawnMobsQuery} from "../../logic/queries";
import {SpawnComponent} from "../../logic/components";

export function WorldContextProvider({
                                         children,
                                         levelData,
                                     }: PropsWithChildren<{ levelData: LevelData }>) {
    const world = createLevel(levelData);
    const spawnPoints = spawnMobsQuery(world);
    const {countMobs} = useControls('World', {
        countMobs: {min: 0, max: 50, value: 2, step: 1}
    })

    useEffect(() => {
        for (const spawnId of spawnPoints) {
            SpawnComponent.max[spawnId] = countMobs;
        }
    }, [countMobs])

    loadNavMeshSystem(world);
    // pathPlannerSystem(world);

    const pipeline = pipe(
        timeSystem,
        spawnMobsSystem,
        spawnHealthSystem,
        yukaIntegrationSystem,
        spawnBulletSystem
    );

    useFrame(() => {
        pipeline(world);
    });

    return (
        <WorldContext.Provider value={world}>{children}</WorldContext.Provider>
    );
}
