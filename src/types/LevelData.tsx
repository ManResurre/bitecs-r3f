import {Vector2Tuple} from "three";

export type LevelData = {
    mobs: {
        name: 'zombie' | 'hunter';
        delay: number;
        max: number;
        position: Vector2Tuple;
    }[]
};
