import {Html} from "@react-three/drei";
import {Vector3} from "three";
import {useWorld} from "../hooks/useWorld.tsx";
import {useFrame} from "@react-three/fiber";
import {healthQuery} from "../../logic/queries";
import {HealthComponent} from "../../logic/components";
import {useCallback, useState} from "react";

export function Health() {
    const [healthText, setHealthText] = useState(100);
    const world = useWorld();


    const getHealth = useCallback(() => {
        const health = healthQuery(world);
        if (!health.length)
            return;
        return HealthComponent.value[health[0]];
    }, [world])


    useFrame(() => {
        setHealthText((h) => {
            if (getHealth() != healthText) {
                return getHealth() ?? 0
            }
            return h
        })
    })

    return <Html position={new Vector3(5, 1, 5)}>
        {healthText}
    </Html>
}
