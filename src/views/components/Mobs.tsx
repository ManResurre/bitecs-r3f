import React, {useState} from "react";
import {useWorld} from "../hooks/useWorld.tsx";
import {mobsQuery} from "../../logic/queries";
import SoldierModel from "./SoldierModel.tsx";
import {useFrame} from "@react-three/fiber";

const Mobs = () => {
    const world = useWorld();
    const [count, setCount] = useState(0);
    const mobs = mobsQuery(world);

    useFrame(() => {
        setCount(mobs.length)
    })

    console.log('enemy:', count);

    return mobs.map((eid) => {
        return <SoldierModel key={eid} eid={eid}/>;
    });
}

export default React.memo(Mobs)
