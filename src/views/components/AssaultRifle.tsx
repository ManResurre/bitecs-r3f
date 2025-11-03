import {useGLTF} from "@react-three/drei";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import MuzzleFlash from "./MuzzleFlash.tsx";
import {TextureLoader, Vector3} from "three";
import {useFrame, useLoader} from "@react-three/fiber";
import {GLTFLoader} from "three/examples/jsm/Addons.js";
import MuzzleLight from "./GlobalMuzzleLight.tsx";

const AssaultRifle = ({
                          burstCount = 4,
                          ...props
                      }) => {
    const groupRef = useRef(null);
    const {scene} = useGLTF("./models/assaultRifle_high.glb");

    const clonedScene = useMemo(() => {
        return scene.clone();
    }, [scene]);

    const currentBurstRef = useRef(0);
    const shotTimerRef = useRef(0);
    const burstTimerRef = useRef(0);

    // Только одно состояние для видимости вспышки
    const [muzzleFlashVisible, setMuzzleFlashVisible] = useState(true);

    // Основная логика в useFrame
    // useFrame(() => {
    //     // Автоматически скрываем вспышку в следующем кадре
    //     if (muzzleFlashVisible) {
    //         setMuzzleFlashVisible(false);
    //     }
    //
    //     shotTimerRef.current++;
    //
    //     // Если очередь не завершена
    //     if (currentBurstRef.current < burstCount) {
    //         // Стреляем каждый 8-й кадр
    //         if (shotTimerRef.current >= 8) {
    //             setMuzzleFlashVisible(true);
    //             currentBurstRef.current++;
    //             shotTimerRef.current = 0;
    //         }
    //     } else {
    //         // Ждем 60 кадров перед новой очередью
    //         if (shotTimerRef.current >= 60) {
    //             currentBurstRef.current = 0;
    //             shotTimerRef.current = 0;
    //         }
    //     }
    // });

    return (
        <group ref={groupRef} {...props}>
            <primitive object={clonedScene}/>
            <MuzzleFlash
                name="MuzzleFlash"
                position={new Vector3(0, 0.05, 0.5)}
                visible={muzzleFlashVisible}
                size={0.4}
            />
            {/*<MuzzleLight*/}
            {/*    visible={muzzleFlashVisible}*/}
            {/*    intensity={15}*/}
            {/*    duration={32}*/}
            {/*/>*/}
        </group>
    );
};

useLoader.preload(GLTFLoader, './models/assaultRifle_high.glb');
useLoader.preload(TextureLoader, './textures/muzzle.png');
export default AssaultRifle;
