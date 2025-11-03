import React, {useRef, useMemo} from 'react';
import {useFrame} from '@react-three/fiber';
import {Sprite, SpriteMaterial, Vector3} from 'three';
import {useTexture} from '@react-three/drei';

interface MuzzleFlashProps {
    position?: Vector3;
    visible?: boolean;
    size?: number;
    name?: string;
}

const MuzzleFlash = ({
                         position = new Vector3(0, 0, 0),
                         visible = false,
                         size = 0.3,
                         ...rest
                     }: MuzzleFlashProps) => {
    const spriteRef = useRef<Sprite>(null);

    // Загружаем текстуру через useTexture из drei (более удобно чем TextureLoader)
    const muzzleTexture = useTexture('./textures/muzzle.png');

    // Создаем материал один раз при монтировании
    const muzzleMaterial = useMemo(() => {
        const material = new SpriteMaterial({
            map: muzzleTexture,
            transparent: true,
            opacity: 1
        });
        muzzleTexture.matrixAutoUpdate = false;
        return material;
    }, [muzzleTexture]);

    useFrame(() => {
        if (spriteRef.current) {
            spriteRef.current.visible = visible;

            // Можно добавить анимацию пульсации когда видно
            if (visible && spriteRef.current.material) {
                const material = spriteRef.current.material as SpriteMaterial;
                material.rotation += 0.1; // Вращение для эффекта
            }
        }
    });

    return <sprite
        ref={spriteRef}
        position={position}
        scale={[size, size, 1]}
        material={muzzleMaterial}
        {...rest}
    />;
};

export default React.memo(MuzzleFlash);
