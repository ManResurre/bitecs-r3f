import {Suspense, useRef} from "react";
import {Environment, PerspectiveCamera, Plane, Sky, Stats} from '@react-three/drei';
import {Perf} from 'r3f-perf';
import {Physics, RigidBody} from '@react-three/rapier';
import {useLoaderData} from "@tanstack/react-router";
import {WorldContextProvider} from "../contexts/WorldContextProvider.tsx";
import CameraController from "./CameraController.tsx";
import {Mobs} from "./Mobs.tsx";
import Light from "./Light.tsx";
import Grid from "./Grid.tsx";
import {Particles} from "./Particles.tsx";
import {AdvancedRainMaterial} from "./AdvancedRainMaterial.tsx";

export function Game() {
    const rbRef = useRef(null);
    const planeRef = useRef(null);

    const {levelData} = useLoaderData({from: "/"});
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
                    {/*<Environment*/}
                    {/*    preset="city" // Более подходит для дождливой атмосферы чем park*/}
                    {/*    environmentIntensity={0.4} // Уменьшаем интенсивность для пасмурности*/}
                    {/*    environmentBlur={0.5} // Добавляем лёгкое размытие*/}
                    {/*/>*/}
                    {/*<Sky*/}
                    {/*    distance={450000} // Увеличиваем дистанцию для более масштабного неба*/}
                    {/*    sunPosition={[10, 2, 10]} // Низкое положение солнца для пасмурности*/}
                    {/*    inclination={0.52} // Сохраняем наклон*/}
                    {/*    azimuth={0.25} // Смещаем азимут*/}
                    {/*    mieCoefficient={0.005} // Увеличиваем для большей мутности*/}
                    {/*    mieDirectionalG={0.8} // Настройка рассеяния*/}
                    {/*    rayleigh={1.5} // Увеличиваем для сероватого оттенка*/}
                    {/*    turbidity={10} // Увеличиваем мутность для облачности*/}
                    {/*/>*/}
                    <Light/>
                    {/*<fog attach="fog" args={['#7a8c9c', 5, 20]}/>*/}


                    <Sky
                        distance={450000}
                        sunPosition={[0, -1, 0]} // Солнце за горизонтом
                        inclination={0}
                        azimuth={0.1}
                        mieCoefficient={0.01}
                        mieDirectionalG={0.7}
                        rayleigh={3} // Ещё более серый
                        turbidity={20} // Очень мутно, как в сильную облачность
                    />

                    {/* Мягкое окружающее освещение без четких теней */}
                    <ambientLight intensity={0.4} color="#8a9cad"/>
                    {/*<directionalLight*/}
                    {/*    position={[10, 10, 5]}*/}
                    {/*    intensity={0.2}*/}
                    {/*    color="#a8b8c8"*/}
                    {/*    castShadow={false} // Отключаем тени для рассеянного света*/}
                    {/*/>*/}

                    {/* Густой туман для дождливой атмосферы */}
                    <fog attach="fog" args={['#6d7b88', 3, 15]}/>
                    {/* Можно добавить текстуры мокрых поверхностей */}
                    {/*<Environment*/}
                    {/*    files="/textures/rainy_environment.hdr" // Если есть специальная HDR текстура*/}
                    {/*    environmentIntensity={0.3}*/}
                    {/*/>*/}
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
                                <AdvancedRainMaterial/>
                            </Plane>
                        </RigidBody>
                        {/*<Box castShadow position={[-2, 1, 0]}/>*/}
                        <Mobs/>
                    </Physics>
                    {/*<Grid position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}/>*/}
                    <Particles/>

                    <Stats className="stats"/>
                    <Perf position={"bottom-right"}/>
                </Suspense>
            </WorldContextProvider>
        </>
    );
}
