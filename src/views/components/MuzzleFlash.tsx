import React, {useRef, useMemo, JSX, useImperativeHandle} from 'react';
import {useFrame} from '@react-three/fiber';
import {Sprite, SpriteMaterial, Vector3} from 'three';
import {useTexture} from '@react-three/drei';
import {useWorld} from "../hooks/useWorld.tsx";

type MuzzleFlashRef = Sprite;
type MuzzleFlashProps = JSX.IntrinsicElements['sprite'] & {
    visible?: boolean;
    size?: number;
}

const MuzzleFlash = ({
                         position = new Vector3(0, 0, 0),
                         visible = false,
                         size = 0.3,
                         ...rest
                     }: MuzzleFlashProps, forwardedRef: React.ForwardedRef<MuzzleFlashRef>) => {
    const world = useWorld();
    const spriteRef = useRef<Sprite>(null);
    // Синхронизируем внешний и внутренний ref
    useImperativeHandle(forwardedRef, () => spriteRef.current!, []);

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
            if (world.muzzleFlashSystem && visible) {
                const muzzlePosition = new Vector3();
                const addFlashToQueue = world.muzzleFlashSystem.get('addFlashToQueue');
                spriteRef.current.getWorldPosition(muzzlePosition);
                if (addFlashToQueue)
                    addFlashToQueue(
                        muzzlePosition,
                        25, // интенсивность
                    );
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

export default React.memo(React.forwardRef(MuzzleFlash));
