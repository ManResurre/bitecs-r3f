import React, {useState} from 'react';
import {ThreeElements, useFrame} from '@react-three/fiber';
import GridCell from "./GridCell.tsx";
import {mobsQuery} from "../../logic/queries";
import {useWorld} from "../hooks/useWorld.tsx";
import {PositionComponent, SelectedCellComponent} from "../../logic/components";

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
                  objectPosition = [1, 0],
                  ...rest
              }: GridProps) => {
    const world = useWorld();
    const [highlightedCell, setHighlightedCell] = useState({i: 0, j: 0})

    useFrame(() => {
        const mobs = mobsQuery(world);
        mobs.map((mobId) => {
            // console.log(PositionComponent.x[mobId], PositionComponent.z[mobId]);
            // const cell = [SelectedCellComponent.x[mobId], SelectedCellComponent.y[mobId]];
            // console.log(cell);
            setHighlightedCell((prev) => {
                if (prev.i != SelectedCellComponent.x[mobId] || prev.j != SelectedCellComponent.y[mobId]) {
                    return {i: SelectedCellComponent.x[mobId], j: SelectedCellComponent.y[mobId]}
                }
                return prev;
            })
        })
    })

    // Функция для определения ячейки под объектом
    // const getHighlightedCell = (objPos: [number, number]) => {
    //     const [x, y] = objPos;
    //     const i = Math.floor((x + (world.size.height * cellSize) / 2) / cellSize);
    //     const j = Math.floor((y + (world.size.width * cellSize) / 2) / cellSize);
    //     return {i, j};
    // };
    //
    // const highlightedCell = getHighlightedCell(objectPosition);

    const cells = [];

    for (let i = 0; i < world.size.height; i++) {
        for (let j = 0; j < world.size.width; j++) {
            const isHighlighted = (i === highlightedCell.i && j === highlightedCell.j);

            cells.push(
                <GridCell
                    key={`${i}-${j}`}
                    position={[i * cellSize - (world.size.height * cellSize) / 2, j * cellSize - (world.size.width * cellSize) / 2, 0]}
                    size={cellSize}
                    isHighlighted={isHighlighted}
                    {...rest}
                />
            );
        }
    }

    return <group position={position} rotation={rotation} {...rest}>{cells}</group>;
}

export default React.memo(Grid);
