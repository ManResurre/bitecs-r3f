import {useMemo} from 'react';
import {BufferGeometry, Float32BufferAttribute} from 'three';
import {useThree} from '@react-three/fiber';

interface VisionHelperProps {
    fieldOfView: number;
    range: number;
    division?: number;
    color?: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
}

export const VisionHelper: React.FC<VisionHelperProps> = ({
                                                              fieldOfView,
                                                              range,
                                                              division = 8,
                                                              color = 'white',
                                                              position = [0, 0, 0],
                                                              rotation = [0, 0, 0]
                                                          }) => {
    const {scene} = useThree();

    const geometry = useMemo(() => {
        const geom = new BufferGeometry();
        const positions: number[] = [];

        const foV05 = fieldOfView / 2;
        const step = fieldOfView / division;

        // Создаем веер из треугольников в плоскости XZ
        for (let i = -foV05; i < foV05; i += step) {
            // Треугольник: начало -> точка i -> точка i+step
            positions.push(
                0, 0, 0, // начало
                Math.sin(i) * range, 0, Math.cos(i) * range, // точка i
                Math.sin(i + step) * range, 0, Math.cos(i + step) * range // точка i+step
            );
        }

        geom.setAttribute('position', new Float32BufferAttribute(positions, 3));
        geom.computeVertexNormals();

        return geom;
    }, [fieldOfView, range, division]);

    return (
        <mesh
            geometry={geometry}
            position={position}
            rotation={rotation}
        >
            <meshBasicMaterial
                color={color}
                wireframe={true}
                transparent={true}
                opacity={0.6}
            />
        </mesh>
    );
};
