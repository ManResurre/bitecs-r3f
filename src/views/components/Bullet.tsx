import {Line} from '@react-three/drei';
import {ColorRepresentation, Mesh} from "three";
import {useRef} from "react";
import {Line2} from "three-stdlib";
import {useWorld} from "../hooks/useWorld.tsx";
import {Projectile} from "../../entities/Projectile.ts";
import {useFrame} from '@react-three/fiber';

type BulletProps = {
    bid: number;
    color: ColorRepresentation;
    visible: boolean;
};

const Bullet = ({bid, color, visible}: BulletProps) => {
    const world = useWorld();
    const sphereRef = useRef<Mesh>(null);

    useFrame(() => {
        const bullet = world.entityManager.getEntityByName(`bullet_${bid}`) as Projectile;

        if (bullet && sphereRef.current) {
            // Обновляем позицию линии
            sphereRef.current.position.copy(bullet.position);
        }
    });

    return <mesh ref={sphereRef} position={[100, 0, 0]} visible={visible}>
        <sphereGeometry args={[0.05, 8, 6]}/>
        {/* Радиус 0.05, 8 сегментов ширины, 6 сегментов высоты */}
        <meshBasicMaterial color={color}/>
    </mesh>

};

export default Bullet;
