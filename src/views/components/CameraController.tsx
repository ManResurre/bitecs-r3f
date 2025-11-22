import {useRef, useEffect} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import {Vector3} from "../../core/math/Vector3.ts";
import {useWorld} from "../hooks/useWorld.tsx";
import {PlayerEntity} from "../../entities/soldier/PlayerEntity.ts";
import {useControls} from "leva";
import {Quaternion} from "../../core/math/Quaternion.ts";

const CameraController = () => {
    const {camera, gl} = useThree();
    const world = useWorld();
    const currentPosition = useRef(new Vector3());

    // Refs для хранения состояния мыши
    const isRightButtonPressed = useRef(false);
    const currentAngle = useRef(-45); // Начальный угол по умолчанию
    const previousMouseX = useRef(0);

    // Более естественные настройки камеры
    const { distance, height, offsetX, offsetZ, fov, smoothness } = useControls('Camera', {
        distance: { value: 8, min: 3, max: 20, step: 0.5 },
        height: { value: 4, min: 1, max: 10, step: 0.5 },
        offsetX: { value: 0, min: -5, max: 5, step: 0.1 },
        offsetZ: { value: 0, min: -5, max: 5, step: 0.1 },
        fov: { value: 60, min: 30, max: 90, step: 1 },
        smoothness: { value: 5, min: 1, max: 15, step: 0.5 }
    });

    // Настройка параметров камеры
    useEffect(() => {
        camera.fov = fov;
        camera.near = 0.1;
        camera.far = 1000;
        camera.updateProjectionMatrix();
    }, [fov, camera]);

    useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            if (event.button === 2) { // Правая кнопка мыши
                isRightButtonPressed.current = true;
                previousMouseX.current = event.clientX;
                gl.domElement.style.cursor = 'grabbing';
                gl.domElement.style.pointerEvents = 'auto';
                event.preventDefault();
            }
        };

        const handleMouseUp = (event: MouseEvent) => {
            if (event.button === 2) {
                isRightButtonPressed.current = false;
                gl.domElement.style.cursor = 'default';
                event.preventDefault();
            }
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!isRightButtonPressed.current) return;

            const deltaX = event.clientX - previousMouseX.current;
            // Более плавное вращение с учетом дельты времени
            currentAngle.current += deltaX * 0.3;

            previousMouseX.current = event.clientX;
            event.preventDefault();
        };

        const handleContextMenu = (event: Event) => {
            event.preventDefault();
        };

        // Предотвращаем скролл страницы при взаимодействии
        const handleWheel = (event: WheelEvent) => {
            if (event.target === gl.domElement) {
                event.preventDefault();
            }
        };

        const domElement = gl.domElement;
        domElement.addEventListener('mousedown', handleMouseDown);
        domElement.addEventListener('mouseup', handleMouseUp);
        domElement.addEventListener('mousemove', handleMouseMove);
        domElement.addEventListener('contextmenu', handleContextMenu);
        domElement.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            domElement.removeEventListener('mousedown', handleMouseDown);
            domElement.removeEventListener('mouseup', handleMouseUp);
            domElement.removeEventListener('mousemove', handleMouseMove);
            domElement.removeEventListener('contextmenu', handleContextMenu);
            domElement.removeEventListener('wheel', handleWheel);
        };
    }, [gl]);

    useFrame((_, delta) => {
        if (!world.playerId) return;

        const player = world.entityManager.get(world.playerId!) as PlayerEntity;
        if (!player) return;

        const playerPos = player.position;

        // Вычисляем позицию камеры в сферических координатах
        const angleInRadians = currentAngle.current * (Math.PI / 180);
        const horizontalDistance = distance * Math.cos((height * 0.1) * Math.PI / 180);
        const verticalHeight = height;

        const cameraOffsetX = Math.sin(angleInRadians) * horizontalDistance;
        const cameraOffsetZ = Math.cos(angleInRadians) * horizontalDistance;

        const targetCamPos = new Vector3(
            playerPos.x + cameraOffsetX,
            playerPos.y + verticalHeight,
            playerPos.z + cameraOffsetZ
        );

        // Плавное перемещение камеры
        currentPosition.current.lerp(targetCamPos, smoothness * delta);

        // Применяем ручное смещение
        camera.position.copy(currentPosition.current).add(new Vector3(offsetX, 0, offsetZ));

        // Точка взгляда - немного выше позиции игрока
        const lookAtTarget = new Vector3(
            playerPos.x,
            playerPos.y + 1.5, // Смотрим на уровень груди персонажа
            playerPos.z
        );

        camera.lookAt(lookAtTarget);

        // Обновляем кватернион камеры игрока
        if (player.setCameraQuaternion) {
            player.setCameraQuaternion(camera.quaternion as Quaternion);
        }
    });

    return null;
};

export default CameraController;
