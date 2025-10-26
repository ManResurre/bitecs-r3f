import React, {useLayoutEffect} from "react";
import {useLoader, useThree} from "@react-three/fiber";
import {GLTFLoader} from "three/examples/jsm/Addons.js";
import {TextureLoader} from "three";
import {useGLTF, useTexture} from '@react-three/drei';

const Level = () => {
    const {scene} = useGLTF('./models/level.glb');
    const lightmap = useTexture('./textures/lightmap.png');
    const {gl} = useThree();

    useLayoutEffect(() => {
        if (!scene || !lightmap) return;

        // Отключаем autoUpdate для всей сцены
        scene.matrixAutoUpdate = false;
        scene.updateMatrix();

        scene.traverse((object) => {
            object.matrixAutoUpdate = false;
            object.updateMatrix();
        });

        // Находим меш 'level' и настраиваем материалы
        const mesh = scene.getObjectByName('level');
        if (mesh && mesh.material) {
            // Настройка lightmap
            lightmap.flipY = false;
            mesh.material.lightMap = lightmap;
            mesh.material.lightMapIntensity = 1; // можно настроить интенсивность

            // Настройка anisotropy для основной текстуры
            if (mesh.material.map) {
                mesh.material.map.anisotropy = gl.capabilities.getMaxAnisotropy() || 4;
            }

            // Обновляем материал
            mesh.material.needsUpdate = true;
        }

    }, [scene, lightmap, gl]);

    return <primitive object={scene}/>;
}

// Предзагрузка ресурсов
useLoader.preload(GLTFLoader, './models/level.glb');
useLoader.preload(TextureLoader, './textures/lightmap.png');

export default React.memo(Level);
