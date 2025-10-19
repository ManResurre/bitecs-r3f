import React from 'react';
import {ThreeElements} from '@react-three/fiber';
import GridCell from "./GridCell.tsx";
import {useWorld} from "../hooks/useWorld.tsx";

type GridProps = {
    rows?: number;
    cols?: number;
    cellSize?: number;
    objectPosition?: [number, number]; // Позиция объекта для подсветки
} & ThreeElements['group']

const Grid = ({
                  cellSize = 1,
                  rotation,
                  position,
                  ...rest
              }: GridProps) => {
    const world = useWorld();
    const cells = [];

    for (let i = 0; i < world.size.height; i++) {
        for (let j = 0; j < world.size.width; j++) {
            cells.push(
                <GridCell
                    key={`${i}-${j}`}
                    position={[i * cellSize - (world.size.height * cellSize) / 2, j * cellSize - (world.size.width * cellSize) / 2, 0]}
                    size={cellSize}
                    rowIndex={i}
                    colIndex={j}
                    {...rest}
                />
            );
        }
    }

    return <group position={position} rotation={rotation} {...rest}>{cells}</group>;
}

export default React.memo(Grid);
