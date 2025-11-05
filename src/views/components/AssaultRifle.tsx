import {useGLTF} from "@react-three/drei";
import {RefObject, useMemo, useRef, useState} from "react";
import MuzzleFlash from "./MuzzleFlash.tsx";
import {Group, Object3DEventMap, Sprite, TextureLoader, Vector3} from "three";
import {useFrame, useLoader} from "@react-three/fiber";
import {GLTFLoader} from "three/examples/jsm/Addons.js";
import {useWorld} from "../hooks/useWorld.tsx";
import {AssaultRifleComponent} from "../../logic/components";
import Bullets, {BulletsRef} from "./Bullets.tsx";

export type AssaultRifleRef = {
    eid: number
} & Group;

type AssaultRifleProps = {
    ref: RefObject<Group<Object3DEventMap> | null>;
    eid?: number
} & Partial<Group>;
const AssaultRifle = ({
                          eid,
                          ...rest
                      }: AssaultRifleProps) => {

    const world = useWorld();
    const weaponRef = useRef(null);
    const muzzleFlashRef = useRef<Sprite>(null);

    const {scene} = useGLTF("./models/assaultRifle_high.glb");

    const clonedScene = useMemo(() => {
        return scene.clone();
    }, [scene]);

    const [muzzleFlashVisible, setMuzzleFlashVisible] = useState(true);

    // Основная логика в useFrame
    useFrame(() => {
        if (muzzleFlashVisible) {
            setMuzzleFlashVisible(false);
        }

        if (eid && AssaultRifleComponent.shoot[eid]) {
            setMuzzleFlashVisible(true);
        //     if (bulletRef.current)
        //         // bulletRef.current.target = new Vector3(
        //         //     AssaultRifleComponent.target.x[eid],
        //         //     AssaultRifleComponent.target.y[eid],
        //         //     AssaultRifleComponent.target.z[eid]
        //         // )
        //         setMuzzleFlashVisible(true);
        //     if (world.muzzleFlashSystem && muzzleFlashRef.current && bulletRef.current) {
        //         bulletRef.current.position.copy(muzzleFlashRef.current.position)
        //     }
        }
    });

    return (
        <group {...rest}>
            <primitive ref={weaponRef} object={clonedScene}/>
            <MuzzleFlash
                name="MuzzleFlash"
                ref={muzzleFlashRef}
                position={new Vector3(0, 0.05, 0.5)}
                visible={muzzleFlashVisible}
                size={0.4}
            />
        </group>
    );
};

useLoader.preload(GLTFLoader, './models/assaultRifle_high.glb');
useLoader.preload(TextureLoader, './textures/muzzle.png');
export default AssaultRifle;
