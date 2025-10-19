import React, {useRef} from "react";
import {ThreeElements} from "@react-three/fiber";

interface GridCellProps {
    position: ThreeElements['mesh']['position'],
    size: number;
    isHighlighted?: boolean;
}

const GridCell = ({
                      position,
                      size = 1,
                      isHighlighted = false,
                      ...rest
                  }: GridCellProps) => {

    const meshRef = useRef(null);

    return (
        <mesh
            {...rest}
            position={position}
            ref={meshRef}
        >
            <planeGeometry args={[size, size]}/>
            <meshBasicMaterial
                color={isHighlighted ? 0x00ff00 : 0xffffff}
                transparent
                opacity={0.5}
            />
        </mesh>
    );
}

export default React.memo(GridCell);
