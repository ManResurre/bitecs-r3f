import React, {useRef, useState} from "react";
import {ThreeElements, useFrame} from "@react-three/fiber";
import {SelectedCellComponent} from "../../logic/components";
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
    const meshRef = useRef(null);
    const [highlighted, setHighlighted] = useState(false);

    useFrame(() => {
        const mobs = mobsQuery(world);
        setHighlighted(false)
        mobs.some((mobId) => {
            if (rowIndex === SelectedCellComponent.x[mobId] && colIndex == SelectedCellComponent.y[mobId]) {
                setHighlighted(true)
                return
            }
        })
    })

    return (
        <mesh
            {...rest}
            position={position}
            ref={meshRef}
        >
            <planeGeometry args={[size, size]}/>
            <meshBasicMaterial
                color={highlighted ? 0x00ff00 : 0xffffff}
                transparent
                opacity={0.5}
            />
        </mesh>
    );
}

export default React.memo(GridCell);
