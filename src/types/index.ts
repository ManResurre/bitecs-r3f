import {IWorld} from "bitecs";
import {RapierRigidBody} from "@react-three/rapier";
import {CostTable, EntityManager, NavMesh} from "yuka";
import {PathPlanner} from "../logic/etc/PathPlanner.ts";

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

export type WithNavMesh<T extends IWorld> = T & {
    navMesh?: NavMesh;
    costTable?: CostTable;
    entityManager: EntityManager;
    pathPlanner?: PathPlanner;
};

export type CustomWorld = WithNavMesh<WithRigidBody<WithTime<WithBoundaries<IWorld>>>>;
