import {useEffect, useRef} from 'react';
import {Vector3} from "yuka";
import {useWorld} from "../hooks/useWorld.tsx";
import {BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial} from "three";

export const NavMeshDebug = () => {
    const {navMesh} = useWorld();

    const debugRef = useRef<Group>(null);

    useEffect(() => {
        if (!navMesh || !debugRef.current) return;

        // Очищаем предыдущую визуализацию
        debugRef.current.clear();

        // Проходим по всем регионам навмеша
        navMesh.regions.forEach((region, regionIndex) => {
            // Создаем массив для заполнения контуром
            const contour: Vector3[] = [];

            // Получаем контур региона
            region.getContour(contour);

            if (contour.length < 3) {
                console.log(`Region ${regionIndex} has no valid contour`);
                return;
            }

            // Создаем геометрию для контура
            const vertices: number[] = [];
            const indices: number[] = [];

            // Добавляем вершины контура
            contour.forEach(vertex => {
                vertices.push(vertex.x, vertex.y, vertex.z);
            });

            // Триангулируем полигон (простой способ - веером от первой вершины)
            for (let i = 1; i < contour.length - 1; i++) {
                indices.push(0, i, i + 1);
            }

            const geometry = new BufferGeometry();
            geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
            geometry.setIndex(indices);

            const material = new MeshBasicMaterial({
                color: new Color().setHSL(regionIndex / navMesh.regions.length, 0.8, 0.5),
                wireframe: true,
                transparent: true,
                opacity: 0.6,
                side: DoubleSide
            });

            const mesh = new Mesh(geometry, material);
            debugRef.current!.add(mesh);
        });

        return () => {
            if (debugRef.current) {
                debugRef.current.clear();
            }
        };
    }, [navMesh]);

    return <group ref={debugRef}/>;
};
