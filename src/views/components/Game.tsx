import {Suspense} from "react";
import {OrbitControls, Sky, Stats} from '@react-three/drei';
import {Perf} from 'r3f-perf';
import {useLoaderData} from "@tanstack/react-router";
import {WorldContextProvider} from "../contexts/WorldContextProvider.tsx";
import Light from "./Light.tsx";
import GameScene from "./GameScene.tsx";

export function Game() {
    const {levelData} = useLoaderData({from: "/"});

    return (
        <>
            {/*<CameraController/>*/}
            {/*<PerspectiveCamera*/}
            {/*    makeDefault*/}
            {/*/>*/}
            <OrbitControls/>

            <WorldContextProvider levelData={levelData}>
                <Suspense>
                    <ambientLight intensity={0.4}/>
                    <hemisphereLight
                        args={[0xffffff, 0x444444, 0.4]}
                        position={[0, 100, 0]}
                    />
                    {/*<directionalLight*/}
                    {/*    castShadow*/}
                    {/*    intensity={0.8}*/}
                    {/*    position={[-700, 1000, -750]}*/}
                    {/*    shadow-mapSize-width={2048}*/}
                    {/*    shadow-mapSize-height={2048}*/}
                    {/*    shadow-camera-far={500}*/}
                    {/*    shadow-camera-left={-100}*/}
                    {/*    shadow-camera-right={100}*/}
                    {/*    shadow-camera-top={100}*/}
                    {/*    shadow-camera-bottom={-100}*/}
                    {/*/>*/}

                    <Sky
                        distance={1000}
                        turbidity={5}
                        rayleigh={1.5}
                        sunPosition={[-700, 1000, -750]}
                    />

                    {/* Дополнительное окружение для лучшего освещения */}
                    {/*<Environment preset="city" environmentIntensity={0} />*/}

                    {/*<ambientLight intensity={1}/>*/}
                    {/*<directionalLight*/}
                    {/*    position={[10, 10, 5]}*/}
                    {/*    intensity={0.6}*/}
                    {/*    castShadow*/}
                    {/*/>*/}

                    {/*<Environment*/}
                    {/*    // preset="city"*/}
                    {/*    files="./vignaioli_night_4k.hdr"*/}
                    {/*    environmentIntensity={0.15}*/}
                    {/*/>*/}

                    {/*<Sky*/}
                    {/*    distance={450000}*/}
                    {/*    sunPosition={[-100, -10, -100]} // Солнце далеко за горизонтом*/}
                    {/*    inclination={0}*/}
                    {/*    azimuth={0.1}*/}
                    {/*    mieCoefficient={0.0005}*/}
                    {/*    mieDirectionalG={0.6}*/}
                    {/*    rayleigh={0.1} // Очень темное небо*/}
                    {/*    turbidity={1} // Очень ясная ночь*/}
                    {/*/>*/}

                    {/*<Stars*/}
                    {/*    radius={100}        // Радиус сферы звезд*/}
                    {/*    depth={50}          // Глубина рендеринга*/}
                    {/*    count={5000}        // Количество звезд*/}
                    {/*    factor={4}          // Размер звезд*/}
                    {/*    saturation={0}      // Насыщенность цвета*/}
                    {/*    // fade={true}         // Плавное появление*/}
                    {/*    speed={0.1}         // Скорость вращения*/}
                    {/*/>*/}
                    {/* Дополнительное ночное освещение */}
                    {/*<ambientLight intensity={0.05} color="#1a2b5f"/>*/}

                    <Light/>

                    {/*<Ground/>*/}
                    {/*<fog attach="fog" color={0x0a0a1a} far={20} />*/}


                    {/*<Sky*/}
                    {/*    distance={450000}*/}
                    {/*    sunPosition={[0, -1, 0]} // Солнце за горизонтом*/}
                    {/*    inclination={0}*/}
                    {/*    azimuth={0.1}*/}
                    {/*    mieCoefficient={0.01}*/}
                    {/*    mieDirectionalG={0.7}*/}
                    {/*    rayleigh={3} // Ещё более серый*/}
                    {/*    turbidity={20} // Очень мутно, как в сильную облачность*/}
                    {/*/>*/}


                    {/*<fog attach="fog" args={['#6d7b88', 3, 15]}/>*/}

                    {/*<Physics gravity={[0, -1, 0]}>*/}
                    {/*    <RigidBody position={[0, 0, 0]} ref={rbRef} type="fixed" colliders="trimesh">*/}
                    {/*        /!*<Plane*!/*/}
                    {/*        /!*    ref={planeRef}*!/*/}
                    {/*        /!*    args={[35, 35]}*!/*/}
                    {/*        /!*    rotation={[-Math.PI / 2, 0, 0]}*!/*/}
                    {/*        /!*    position={[0, 0.1, 0]}*!/*/}
                    {/*        /!*    onClick={handlePlaceClick}*!/*/}
                    {/*        /!*    receiveShadow*!/*/}
                    {/*        /!*>*!/*/}
                    {/*        /!*    <AdvancedRainMaterial/>*!/*/}
                    {/*        /!*</Plane>*!/*/}
                    {/*        <Floor/>*/}
                    <GameScene/>
                    {/*</RigidBody>*/}
                    {/*    /!*<Box castShadow position={[-2, 1, 0]}/>*!/*/}

                    {/*</Physics>*/}


                    {/*<Grid position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}/>*/}


                    {/*<UnifiedScene/>*/}

                    {/*<Particles/>*/}
                    {/*<mesh position={[0, 1, 0]}>*/}
                    {/*    <sphereGeometry args={[1, 32, 32]}/>*/}
                    {/*    <meshStandardMaterial metalness={1} roughness={0.5}/>*/}
                    {/*</mesh>*/}

                    <Stats className="stats"/>
                    <Perf position={"bottom-right"}/>
                </Suspense>
            </WorldContextProvider>
        </>
    );
}
