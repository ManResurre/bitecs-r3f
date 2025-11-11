import {Vector3Tuple} from "three";

export type LevelData = {
    mobs: {
        name: 'zombie' | 'hunter';
        delay: number;
        max: number;
        position: Vector3Tuple;
    }[];
    healthPackSpawningPoints: number[][]
};
