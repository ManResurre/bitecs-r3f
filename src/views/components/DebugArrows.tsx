import {useRef} from 'react';
import {Vector3 as TREEVector3, ArrowHelper} from 'three';
import {useFrame} from '@react-three/fiber';
import {Vector3} from "yuka";

interface DebugArrowsProps {
    position: TREEVector3;
    lookDirection: Vector3;
    moveDirection: Vector3;
    enabled?: boolean;
}

const DebugArrows = ({position, lookDirection, moveDirection, enabled = true}: DebugArrowsProps) => {
    const lookArrowRef = useRef<ArrowHelper>(null);
    const moveArrowRef = useRef<ArrowHelper>(null);
    const ld = lookDirection.clone().normalize()
    const md = moveDirection.clone().normalize();

    useFrame(() => {
        if (!enabled) return;

        // Обновляем стрелку направления взгляда (красная)
        if (lookArrowRef.current) {
            lookArrowRef.current.position.copy(position);
            lookArrowRef.current.setDirection(new TREEVector3(ld.x, ld.y, ld.z));
            lookArrowRef.current.setLength(1, 0.2, 0.1);
        }

        // Обновляем стрелку направления движения (синяя)
        if (moveArrowRef.current) {
            moveArrowRef.current.position.copy(position);
            moveArrowRef.current.setDirection(new TREEVector3(md.x, md.y, md.z));
            moveArrowRef.current.setLength(0.8, 0.15, 0.08);
        }
    });

    if (!enabled) return null;

    return (
        <group>
            <arrowHelper
                ref={lookArrowRef}
                args={[new TREEVector3(ld.x, ld.y, ld.z), position, 1, 0xff0000]} // Красный - взгляд
            />
            <arrowHelper
                ref={moveArrowRef}
                args={[new TREEVector3(md.x, md.y, md.z), position, 0.8, 0x0000ff]} // Синий - движение
            />
        </group>
    );
};

export default DebugArrows;
