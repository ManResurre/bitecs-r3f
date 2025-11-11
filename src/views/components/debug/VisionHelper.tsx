import {useMemo} from 'react';
import {BufferGeometry, Float32BufferAttribute} from 'three';

interface VisionHelperProps {
    fieldOfView: number;
    range: number;
    division?: number;
    color?: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
}

export const VisionHelper = ({
                                 fieldOfView,
                                 range,
                                 division = 8,
                                 color = 'white',
                                 ...rest
                             }: VisionHelperProps) => {

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
            {...rest}
        >
            <meshBasicMaterial
                color={color}
                wireframe
                transparent
                opacity={0.6}
            />
        </mesh>
    );
};
