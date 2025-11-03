import React from "react";
import Level from "./Level.tsx";
import {NavMeshDebug} from "./NavigationDebug.tsx";
import HealthPackList from "./HealthPackList.tsx";
import Mobs from "./Mobs.tsx";
import MuzzleLight from "./MuzzleLight.tsx";
import BulletLine from "./BulletLine.tsx";

const GameScene = () => {

    return <>
        <Level/>
        <NavMeshDebug/>
        <HealthPackList/>
        <Mobs/>
        <MuzzleLight/>

    </>;
}

export default React.memo(GameScene);
