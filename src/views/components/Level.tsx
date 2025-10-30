import React, {useLayoutEffect} from "react";
import {useLoader} from "@react-three/fiber";
import {GLTFLoader} from "three/examples/jsm/Addons.js";
import {Mesh, MeshBasicMaterial, MeshStandardMaterial, TextureLoader} from "three";
import {useGLTF, useTexture} from '@react-three/drei';

const Level = () => {
    const {scene} = useGLTF('./models/level.glb');
    const lightmap = useTexture('./textures/lightmap.png');

    useLayoutEffect(() => {
        if (!scene || !lightmap) return;

        const mesh = scene.getObjectByName('level') as Mesh;
        if (mesh && mesh.isMesh) {
            const material = mesh.material as MeshBasicMaterial;
            // Настройка lightmap
            lightmap.flipY = false;

            // Создаем новый материал с явным указанием свойств
            const newMaterial = new MeshStandardMaterial({
                map: material.map || null,
                color: material.color,
                transparent: material.transparent,
                opacity: material.opacity,

                // Настройки lightmap
                lightMap: lightmap,
            });

            // Настройка anisotropy для основной текстуры
            if (newMaterial.map) {
                newMaterial.map.anisotropy = 4;
            }

            mesh.material = newMaterial;
            // Обновляем материал меша
            mesh.material.needsUpdate = true;
        }

        scene.traverse((child) => {
            if ((child as Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

    }, [scene, lightmap]);

    return <>
        <primitive object={scene}/>
    </>;
}

// Предзагрузка ресурсов
useLoader.preload(GLTFLoader, './models/level.glb');
useLoader.preload(TextureLoader, './textures/lightmap.png');

export default React.memo(Level);
