import {useGLTF} from "@react-three/drei";
import React, {useMemo, useRef} from "react";

const HealthPack = ({...props}) => {
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
export default React.memo(HealthPack);
