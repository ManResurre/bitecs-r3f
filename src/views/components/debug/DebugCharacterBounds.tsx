import {useFrame} from '@react-three/fiber';
import {useMemo, useRef} from 'react';
import * as THREE from 'three';
import {CharacterBounds} from "../../../logic/etc/CharacterBounds.ts";

interface DebugCharacterBoundsProps {
    characterBounds: CharacterBounds;
    color?: THREE.ColorRepresentation;
    outerColor?: THREE.ColorRepresentation;
    innerColor?: THREE.ColorRepresentation;
}

export const DebugCharacterBounds = ({
                                         characterBounds,
                                         color = 0xff0000,
                                         outerColor = 0xff0000,
                                         innerColor = 0x00ff00,
                                     }: DebugCharacterBoundsProps) => {

    // Refs для визуализации
    const outerBoxRef = useRef<THREE.LineSegments>(null);
    const innerBoxesRef = useRef<THREE.Group>(null);

    // Создаем геометрию для AABB
    const boxGeometry = useMemo(() => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        geometry.translate(0, 0.5, 0); // Центрируем по Y как в вашем AABB
        return geometry;
    }, []);

    // Материал для внешнего hitbox
    const outerMaterial = useMemo(() =>
        new THREE.LineBasicMaterial({
            color: outerColor || color,
            linewidth: 2
        }), [outerColor, color]);

    // Материал для внутренних hitbox'ов
    const innerMaterial = useMemo(() =>
        new THREE.LineBasicMaterial({
            color: innerColor || color,
            linewidth: 1
        }), [innerColor, color]);

    useFrame(() => {
        if (!characterBounds) return;

        // Обновляем позицию внешнего hitbox'а
        if (outerBoxRef.current) {
            const outerAABB = characterBounds._outerHitbox;

            // Вычисляем размер и позицию
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();
            outerAABB.getSize(size);
            outerAABB.getCenter(center);

            outerBoxRef.current.scale.set(size.x, size.y, size.z);
            outerBoxRef.current.position.copy(center);
        }

        // Обновляем внутренние hitbox'ы
        if (innerBoxesRef.current && characterBounds._innerHitboxes.length > 0) {
            // Удаляем старые children
            while (innerBoxesRef.current.children.length > 0) {
                innerBoxesRef.current.remove(innerBoxesRef.current.children[0]);
            }

            // Создаем новые визуализации для внутренних hitbox'ов
            characterBounds._innerHitboxes.forEach((hitbox) => {
                const bone = hitbox.bone;

                // Создаем LineSegments для этого hitbox'а
                const boxMesh = new THREE.LineSegments(
                    new THREE.EdgesGeometry(boxGeometry),
                    innerMaterial.clone()
                );

                // Вычисляем мировую матрицу для hitbox'а
                const worldMatrix = new THREE.Matrix4()
                    .multiplyMatrices(
                        bone.matrixWorld,
                        hitbox.bindMatrixInverse
                    );

                // Применяем матрицу к mesh
                boxMesh.applyMatrix4(worldMatrix);

                // Устанавливаем масштаб на основе размеров AABB
                const aabb = hitbox.aabb;
                const size = new THREE.Vector3();
                aabb.getSize(size);
                boxMesh.scale.set(size.x, size.y, size.z);

                innerBoxesRef.current!.add(boxMesh);
            });
        }
    });

    return (
        <group>
            {/* Внешний hitbox */}
            <lineSegments ref={outerBoxRef}>
                <edgesGeometry args={[boxGeometry]}/>
                <primitive object={outerMaterial}/>
            </lineSegments>

            {/* Внутренние hitbox'ы */}
            <group ref={innerBoxesRef}/>
        </group>
    );
};

// Hook для удобного использования
export const useDebugCharacterBounds = (
    characterBounds: CharacterBounds | null,
    options: {
        color?: THREE.ColorRepresentation;
        outerColor?: THREE.ColorRepresentation;
        innerColor?: THREE.ColorRepresentation;
        enabled?: boolean;
    } = {}
) => {
    const {enabled = true, ...colors} = options;

    if (!enabled || !characterBounds) {
        return null;
    }

    return <DebugCharacterBounds characterBounds={characterBounds} {...colors} />;
};
