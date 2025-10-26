import {useRef, useEffect, useState, useCallback} from 'react';
import {useFrame} from '@react-three/fiber';
import {Vector3 as ThreeVector3} from 'three';
import {NavMesh, Vector3 as YukaVector3} from 'yuka';
import {CustomNPC} from './CustomNPC';

interface NPCProps {
    navMesh: NavMesh | null;
}

export const NPC = ({navMesh}: NPCProps) => {
    const npcRef = useRef<THREE.Group>(null);
    const [npcEntity, setNpcEntity] = useState<CustomNPC | null>(null);
    const [position, setPosition] = useState<ThreeVector3>(new ThreeVector3());

    // Колбэк для обновления позиции
    const updatePosition = useCallback((yukaPosition: YukaVector3) => {
        setPosition(new ThreeVector3(yukaPosition.x, yukaPosition.y, yukaPosition.z));
    }, []);

    useEffect(() => {
        if (!navMesh) {
            console.log('NavMesh not available for NPC');
            return;
        }

        console.log('Creating NPC with navmesh');
        const entity = new CustomNPC(navMesh);

        // Получаем случайную стартовую позицию на навмеше
        const startPos = entity.getRandomPosition();
        if (!startPos) {
            console.error('Cannot get start position for NPC');
            return;
        }

        entity.position.set(startPos.x, startPos.y, startPos.z);
        setPosition(startPos);
        setNpcEntity(entity);

        // Устанавливаем первую цель
        entity.setRandomTarget();

        return () => {
            console.log('Cleaning up NPC');
            setNpcEntity(null);
        };
    }, [navMesh]);

    useFrame((_, delta) => {
        if (npcEntity) {
            npcEntity.update(delta, updatePosition);
        }
    });

    return (
        <group ref={npcRef} position={[position.x, position.y + 1, position.z]}>
            <mesh castShadow>
                <cylinderGeometry args={[0.5, 0.5, 2, 8]}/>
                <meshStandardMaterial color="blue"/>
            </mesh>

            {/* Стрелка направления */}
            <mesh position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.2, 0.5, 4]}/>
                <meshStandardMaterial color="red"/>
            </mesh>
        </group>
    );
};
