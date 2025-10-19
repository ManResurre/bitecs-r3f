import React, {RefObject, useEffect, useRef} from "react";
import {CameraHelper, DirectionalLight, DirectionalLightHelper} from "three";
import {useHelper} from "@react-three/drei";
import {useControls} from "leva";
import {useThree} from "@react-three/fiber";

const Light = () => {
    const {scene} = useThree();
    const dr = useRef<DirectionalLight>(null)
    useHelper(dr as RefObject<DirectionalLight>, DirectionalLightHelper, 1, "red");
    const {intensity, x, y, z} = useControls('Light', {
        intensity: {value: 1, min: 0, max: 5},
        x: {value: 10, min: -10, max: 10},
        y: {value: 10, min: -10, max: 10},
        z: {value: 10, min: -10, max: 10},
    })

    useEffect(() => {
        if (!dr.current) return;
        const helper = new CameraHelper(dr.current.shadow.camera);
        scene.add(helper);

        return () => {
            scene.remove(helper);
        };
    }, [scene]);

    return (

        <directionalLight
            ref={dr}
            position={[x, y, z]}
            castShadow
            intensity={intensity}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-camera-near={0.1}
            shadow-camera-far={40}
        />

    )
}

export default React.memo(Light);
