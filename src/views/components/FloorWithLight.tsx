import {Sky} from "@react-three/drei";
import {Color, FogExp2, RepeatWrapping, SRGBColorSpace, TextureLoader} from "three";
import {useEffect} from "react";
import {useLoader, useThree} from "@react-three/fiber";

export function UnifiedScene() {
    const { gl, scene } = useThree();
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

        // Синхронизированные настройки тумана и фона
        scene.fog = new FogExp2(0x0c0c1c, 0.012);
        scene.background = new Color(0x0c0c1c);
    }, [floorDiffuse, floorNormal, maxAnisotropy, scene]);

    return (
        <group>
            {/* Небо с уменьшенной интенсивностью */}
            <Sky
                distance={450000}
                sunPosition={[-100, -10, -100]}
                inclination={0}
                azimuth={0.1}
                mieCoefficient={0.0003}  // Еще меньше для лучшего смешивания
                mieDirectionalG={0.5}
                rayleigh={0.05}          // Еще темнее
                turbidity={0.8}
            />

            {/* Пол */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50, 50, 50]}/>
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
                    <sphereGeometry args={[0.05, 16, 8]}/>
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
