import {Suspense, useRef} from "react";
import {Box, Environment, PerspectiveCamera, Plane, Sky, Stats} from '@react-three/drei';
import {Perf} from 'r3f-perf';
import {Physics, RigidBody} from '@react-three/rapier';

// import {Cars} from "./Cars";
import {useLoaderData} from "@tanstack/react-router";
import {Health} from "./Health.tsx";
import {Mobs} from "./Mobs.tsx";
// import {useControls} from "leva";
import Light from "./Light.tsx";
import {WorldContextProvider} from "../contexts/WorldContextProvider.tsx";
import CameraController from "./CameraController.tsx";
import Grid from "./Grid.tsx";

export function Game() {
    const rbRef = useRef(null);
    const planeRef = useRef(null);

    const {levelData} = useLoaderData({from: "/"});
    // const [{mobs}] = useControls('NPC', () => ({
    //     mobs: 5,
    // }));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handlePlaceClick = (event: MouseEvent) => {
        // console.log(event);
    };

    return (
        <>
            <CameraController/>
            <PerspectiveCamera
                makeDefault
            />

            <WorldContextProvider levelData={levelData}>

                <Suspense>
                    <Environment preset="park"/>
                    <Sky inclination={0.52} sunPosition={[100, 20, 100]}/>
                    <Light/>
                    {/*<Cars/>*/}
                    {/*<Tilemap/>*/}
                    {/*<Health/>*/}
                    <Physics debug gravity={[0, -1, 0]}>
                        <RigidBody position={[0, 0, 0]} ref={rbRef} type="fixed" colliders="trimesh">
                            <Plane
                                ref={planeRef}
                                args={[35, 35]}
                                rotation={[-Math.PI / 2, 0, 0]}
                                position={[0, 0, 0]}
                                onClick={handlePlaceClick}
                                receiveShadow
                            >
                                <shadowMaterial transparent opacity={0.2}/>
                                <meshStandardMaterial attach="material" color="#ccc"/>
                            </Plane>
                        </RigidBody>
                        {/*<Box castShadow position={[-2, 1, 0]}/>*/}
                        <Mobs/>
                    </Physics>
                    <Grid position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}/>
                    <Stats className="stats"/>
                    <Perf position={"bottom-right"}/>
                </Suspense>
            </WorldContextProvider>
        </>
    );
}
