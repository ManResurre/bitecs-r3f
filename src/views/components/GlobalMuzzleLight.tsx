import React, {useRef, useEffect, useState} from 'react';
import {useFrame} from '@react-three/fiber';
import {PointLight, Vector3} from "three";

// Глобальный менеджер для всех muzzle lights
const muzzleLightsManager = {
    lights: new Map<number, { position: Vector3; intensity: number; startTime: number }>(),
    nextId: 0,

    addLight(position: Vector3, intensity: number = 20) {
        const id = this.nextId++;
        this.lights.set(id, {position, intensity, startTime: performance.now()});
        return id;
    },

    removeLight(id: number) {
        this.lights.delete(id);
    },

    getActiveLights() {
        return Array.from(this.lights.entries());
    }
};

interface MuzzleLightProps {
    position?: Vector3;
    visible?: boolean;
    intensity?: number;
    duration?: number; // Длительность в миллисекундах
}

const MuzzleLight: React.FC<MuzzleLightProps> = ({
                                                     position = new Vector3(0, 0, 0.5),
                                                     visible = false,
                                                     intensity = 20,
                                                     duration = 100
                                                 }) => {

    const lightIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (visible) {
            // Регистрируем свет в менеджере
            lightIdRef.current = muzzleLightsManager.addLight(position, intensity);

            // Автоматически удаляем через duration
            // const timer = setTimeout(() => {
            //     if (lightIdRef.current !== null) {
            //         muzzleLightsManager.removeLight(lightIdRef.current);
            //         lightIdRef.current = null;
            //     }
            // }, duration);

            // return () => {
            //     clearTimeout(timer);
            //     if (lightIdRef.current !== null) {
            //         muzzleLightsManager.removeLight(lightIdRef.current);
            //     }
            // };
        } else if (lightIdRef.current !== null) {
            muzzleLightsManager.removeLight(lightIdRef.current);
            lightIdRef.current = null;
        }
    }, [visible, position, intensity, duration]);

    return null; // Этот компонент не рендерит свет самостоятельно
};

// Главный компонент, который рендерит все активные lights
export const GlobalMuzzleLights: React.FC = () => {
    const lightRef = useRef<PointLight>(null);
    const [activeLights, setActiveLights] = useState<[number, any][]>([]);

    useFrame(() => {
        const lights = muzzleLightsManager.getActiveLights();
        setActiveLights(lights);

        if (lightRef.current && lights.length > 0) {
            // Можно добавить логику объединения света здесь
        }
    });

    // Рендерим несколько источников света (ограниченное количество)
    const lightsToRender = activeLights.slice(0, 4); // Максимум 4 источника

    return (
        <>
            {lightsToRender.map(([id, lightData]) => (
                <pointLight
                    key={id}
                    position={lightData.position}
                    intensity={lightData.intensity}
                    distance={8}
                    color="#ff7b2c"
                    decay={2}
                    castShadow={lightsToRender.length <= 2} // Включаем тени только для 1-2 источников
                />
            ))}
        </>
    );
};

export default MuzzleLight;
