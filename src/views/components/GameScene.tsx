import React from "react";
import Level_new from "./Level.tsx";
import {NavMeshDebug} from "./debug/NavigationDebug.tsx";
import Mobs from "./Mobs.tsx";
import MuzzleLight from "./MuzzleLight.tsx";
import Player from "./Player.tsx";

const GameScene = () => {
    return <>
        <Level_new/>
        <NavMeshDebug/>
        <Mobs/>
        <MuzzleLight/>
        <Player/>
        {/*<HealthPackList/>*/}
        {/*<Bullets*/}
        {/*    color={0x00ff00}*/}
        {/*/>*/}

        {/*<Watching*/}
        {/*    position={[0, 0, 0]}*/}
        {/*    visionRange={5}*/}
        {/*    fov={Math.PI * 0.5}*/}
        {/*/>*/}

    </>;
}

export default React.memo(GameScene);
