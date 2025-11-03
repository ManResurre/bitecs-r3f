import React from "react";
import Level from "./Level.tsx";
import {NavMeshDebug} from "./NavigationDebug.tsx";
import HealthPackList from "./HealthPackList.tsx";
import Mobs from "./Mobs.tsx";
import {GlobalMuzzleLights} from "./GlobalMuzzleLight.tsx";
import MuzzleLight from "./MuzzleLight.tsx";

const GameScene = () => {


    return <>
        <Level/>
        <NavMeshDebug/>
        <HealthPackList/>
        <Mobs/>
        <MuzzleLight/>
        {/*<GlobalMuzzleLights/>*/}
    </>;
}

export default React.memo(GameScene);
