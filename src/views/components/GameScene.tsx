import React from "react";
import Level_new from "./Level.tsx";
import {NavMeshDebug} from "./debug/NavigationDebug.tsx";
import HealthPackList from "./HealthPackList.tsx";
import Mobs from "./Mobs.tsx";
import MuzzleLight from "./MuzzleLight.tsx";
import Bullets from "./Bullets.tsx";
import Player from "./Player.tsx";

const GameScene = () => {
    return <>
        <Level_new/>
        <NavMeshDebug/>
        {/*<HealthPackList/>*/}
        <Mobs/>
        <MuzzleLight/>
        {/*<Bullets*/}
        {/*    color={0x00ff00}*/}
        {/*/>*/}

        {/*<Watching*/}
        {/*    position={[0, 0, 0]}*/}
        {/*    visionRange={5}*/}
        {/*    fov={Math.PI * 0.5}*/}
        {/*/>*/}
        <Player/>

    </>;
}

export default React.memo(GameScene);
