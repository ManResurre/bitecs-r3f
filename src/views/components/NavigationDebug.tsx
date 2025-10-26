import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {NavMesh, Vector3} from "yuka";

export const NavMeshDebug = ({navMesh}: { navMesh: NavMesh | null }) => {
    const debugRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (!navMesh || !debugRef.current) return;

        // Очищаем предыдущую визуализацию
        debugRef.current.clear();
        console.log('NavMesh regions count:', navMesh.regions.length);

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

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setIndex(indices);

            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(regionIndex / navMesh.regions.length, 0.8, 0.5),
                wireframe: true,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(geometry, material);
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
