import * as THREE from 'three';
import {useRef} from "react";

export function Ground() {
    const meshRef = useRef<THREE.Mesh>(null);

    return (
        <mesh
            ref={meshRef}
            position={[0, 0.1, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
        >
            <planeGeometry args={[10, 10, 64, 64]}/>
            <meshStandardMaterial
                roughness={0.7}
                metalness={0.05}
                onBeforeCompile={(shader) => {
                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <dithering_fragment>',
                        `
                        // Добавляем градиент в зависимости от нормали
                        float gradient = dot(vNormal, vec3(0, 1, 0)) * 0.5 + 0.5;
                        vec3 groundColor = mix(vec3(0.1, 0.15, 0.1), vec3(0.3, 0.4, 0.3), gradient);
                        diffuseColor.rgb *= groundColor;
                        #include <dithering_fragment>
                        `
                    );
                }}
            />
        </mesh>
    );
}
