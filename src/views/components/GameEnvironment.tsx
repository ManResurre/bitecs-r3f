export function GameEnvironment() {
    return (
        <>
            {/* Земля */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, 0]}
                receiveShadow
            >
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial
                    color="#3a4a3a"
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>

            {/* Разметка земли для ориентации */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[50, 50, 20, 20]} />
                <meshBasicMaterial
                    color="#555555"
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Несколько простых объектов как в оригинальном примере */}
            <mesh position={[5, 0.5, 5]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#8a6d3b" />
            </mesh>

            <mesh position={[-5, 0.75, -3]} castShadow>
                <cylinderGeometry args={[0.5, 0.5, 1.5, 8]} />
                <meshStandardMaterial color="#7b8d8e" />
            </mesh>

            <mesh position={[3, 0.25, -7]} castShadow>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="#a84343" />
            </mesh>
        </>
    );
}
