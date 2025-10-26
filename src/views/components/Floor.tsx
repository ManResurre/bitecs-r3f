import {Color, FogExp2, RepeatWrapping, SRGBColorSpace, TextureLoader} from "three";
import { useLoader, useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

export function Floor() {
    const { gl, camera, scene } = useThree();
    const floorRef = useRef(null);
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    const [floorDiffuse, floorNormal] = useLoader(TextureLoader, [
        './FloorsCheckerboard_S_Diffuse.jpg',
        './FloorsCheckerboard_S_Normal.jpg'
    ]);

    useEffect(() => {
        const repeat = 16;

        [floorDiffuse, floorNormal].forEach(texture => {
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
            texture.repeat.set(repeat, repeat);
            texture.anisotropy = maxAnisotropy;
        });

        floorDiffuse.colorSpace = SRGBColorSpace;

        // Добавляем туман к сцене
        scene.fog = new FogExp2(0xcccccc, 0.04);
        scene.background = new Color(0xcccccc);
    }, [floorDiffuse, floorNormal, maxAnisotropy, scene]);

    // Обновляем позицию пола относительно камеры для создания бесконечности
    useFrame(() => {
        if (floorRef.current) {
            // Пол следует за камерой, создавая иллюзию бесконечного пола
            floorRef.current.position.x = camera.position.x;
            floorRef.current.position.z = camera.position.z;

            // Обновляем UV координаты для бесшовного повторения
            const material = floorRef.current.material;
            if (material.map) {
                material.map.offset.set(
                    -camera.position.x / 50,
                    -camera.position.z / 50
                );
            }
            if (material.normalMap) {
                material.normalMap.offset.set(
                    -camera.position.x / 50,
                    -camera.position.z / 50
                );
            }
        }
    });

    return (
        <group>
            {/* Бесконечный пол */}
            <mesh
                ref={floorRef}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
                scale={0.5}
            >
                <planeGeometry args={[200, 200, 50, 50]} />
                <meshStandardMaterial
                    map={floorDiffuse}
                    normalMap={floorNormal}
                    normalScale={[0.5, 0.5]}
                    color="#404040"
                    roughness={0.85}
                />
            </mesh>

            {/* Лампочка */}
            <pointLight
                position={[1, 0.1, -3]}
                color={0xffee88}
                intensity={2}
                distance={500}
                decay={2}
                castShadow
            >
                <mesh>
                    <sphereGeometry args={[0.05, 16, 8]} />
                    <meshStandardMaterial
                        emissive={0xffffee}
                        emissiveIntensity={1}
                        color={0x000000}
                    />
                </mesh>
            </pointLight>
        </group>
    );
}
