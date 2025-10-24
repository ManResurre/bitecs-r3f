import {IWorld} from "bitecs";
import {RapierRigidBody} from "@react-three/rapier";

export type WithTime<T extends IWorld> = T & {
    time: {
        delta: number;
        elapsed: number;
        then: number;
    };
};

export type WithBoundaries<T extends IWorld> = T & {
    size: {
        width: number;
        height: number;
    };
};

export type WithRigidBody<T extends IWorld> = T & {
    rigidBodies: Map<number, RapierRigidBody>;
};

export type CustomWorld = WithRigidBody<WithTime<WithBoundaries<IWorld>>>;