import React from "react";
import Level from "./Level.tsx";
import {NavMeshDebug} from "./NavigationDebug.tsx";
import HealthPackList from "./HealthPackList.tsx";
import Mobs from "./Mobs.tsx";
import MuzzleLight from "./MuzzleLight.tsx";
import BulletLine from "./Bullets.tsx";
import Bullets from "./Bullets.tsx";

const GameScene = () => {

    return <>
        <Level/>
        <NavMeshDebug/>
        <HealthPackList/>
        <Mobs/>
        <MuzzleLight/>
        <Bullets
            color={0x00ff00}
        />
    </>;
}

export default React.memo(GameScene);
