import React from "react";
import Level from "./Level.tsx";
import {NavMeshDebug} from "./NavigationDebug.tsx";
import HealthPackList from "./HealthPackList.tsx";
import Mobs from "./Mobs.tsx";

const GameScene = () => {


    return <>
        <Level/>
        <NavMeshDebug/>
        <HealthPackList/>
        <Mobs/>
    </>;
}

export default React.memo(GameScene);
