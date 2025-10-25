import React, {useRef, useMemo} from "react";
import {ThreeElements, useFrame} from "@react-three/fiber";
import {AStarPathMovementComponent, SelectedCellComponent} from "../../logic/components";
import {mobsQuery} from "../../logic/queries";
import {useWorld} from "../hooks/useWorld.tsx";

interface GridCellProps {
    position: ThreeElements['mesh']['position'],
    size: number,
    isHighlighted?: boolean,
    rowIndex?: number,
    colIndex?: number
}

const GridCell = ({
                      position,
                      size = 1,
                      rowIndex,
                      colIndex,
                      ...rest
                  }: GridCellProps) => {
    const world = useWorld();
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);

    // Кэшируем вычисления с useMemo
    const cellData = useMemo(() => ({
        row: rowIndex,
        col: colIndex
    }), [rowIndex, colIndex]);

    useFrame(() => {
        if (!materialRef.current) return;
        if (Math.floor(performance.now() / 16) % 3 !== 0) return;

        const mobs = mobsQuery(world);
        let isHighlighted = false;
        let isInPath = false;

        // Используем for вместо some для лучшей производительности
        for (let i = 0; i < mobs.length; i++) {
            const mobId = mobs[i];

            // Проверка выбранной ячейки
            if (cellData.row === SelectedCellComponent.x[mobId] &&
                cellData.col === SelectedCellComponent.y[mobId]) {
                isHighlighted = true;
                break; // Если нашли выделение, прерываем цикл
            }

            // Проверка пути только если еще не нашли выделение
            if (!isHighlighted) {
                const pathLength = AStarPathMovementComponent.pathLength[mobId];
                const pathXs = AStarPathMovementComponent.pathXs[mobId];
                const pathYs = AStarPathMovementComponent.pathYs[mobId];

                for (let j = 0; j < pathLength; j++) {
                    if (pathXs[j] === cellData.row && pathYs[j] === cellData.col) {
                        isInPath = true;
                        break;
                    }
                }
                if (isInPath) break;
            }
        }

        // Обновляем цвет напрямую, избегая ререндеров
        if (isHighlighted) {
            // console.log(rowIndex, colIndex);
            materialRef.current.color.setHex(0x00ff00);
        } else if (isInPath) {
            materialRef.current.color.setHex(0xff0000);
        } else {
            materialRef.current.color.setHex(0x000000);
        }
    });

    return (
        <mesh
            {...rest}
            position={position}
            ref={meshRef}
        >
            <planeGeometry args={[size, size]}/>
            <meshBasicMaterial
                ref={materialRef}
                transparent
                opacity={0.5}
                color={0xffffff}
            />
        </mesh>
    );
}

export default React.memo(GridCell);