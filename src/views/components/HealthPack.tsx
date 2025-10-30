import {useGLTF} from "@react-three/drei";
import {useMemo, useRef} from "react";

export function HealthPack({...props}) {
    const groupRef = useRef(null);
    const {scene} = useGLTF("./models/healthPack.glb");

    const clonedScene = useMemo(() => {
        return scene.clone();
    }, [scene])

    return <primitive
        ref={groupRef}
        object={clonedScene}
        {...props}
    />
}
