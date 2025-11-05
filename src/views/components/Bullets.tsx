import {useWorld} from "../hooks/useWorld.tsx";
import {bulletQuery} from "../../logic/queries";
import {ColorRepresentation} from "three";
import Bullet from "./Bullet.tsx";
import {useState} from "react";
import {useFrame} from "@react-three/fiber";

type BulletsProps = {
    color: ColorRepresentation;
}

const Bullets = (
    {
        color = 0xfbf8e6,
    }: BulletsProps) => {

    const world = useWorld();
    const bIds = bulletQuery(world);
    const [count, setCount] = useState(0);

    useFrame(() => {
        setCount(bIds.length)
    })

    return (
        <>
            {bIds.map((bid) => (
                <Bullet key={bid} bid={bid} color={color} visible/>
            ))}
        </>
    );
};

export default Bullets;
