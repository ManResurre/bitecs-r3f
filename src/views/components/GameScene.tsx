import React from "react";
import {Mobs} from "./Mobs.tsx";
import Level from "./Level.tsx";
import {NavMeshDebug} from "./NavigationDebug.tsx";
import {HealthPackList} from "./HealthPackList.tsx";

const GameScene = () => {


    return <>
        <Level/>
        <NavMeshDebug/>
        <HealthPackList/>
        <Mobs/>
    </>;
}

export default React.memo(GameScene);
