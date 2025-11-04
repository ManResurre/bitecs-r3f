import {IWorld} from "bitecs";
import {RapierRigidBody} from "@react-three/rapier";
import {CostTable, EntityManager, NavMesh} from "yuka";
import {PathPlanner} from "../logic/etc/PathPlanner.ts";
import {Vector3} from "three";
import {LevelEntity} from "../entities/LevelEntity.ts";

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

// interface MuzzleFlashSystem {
//     addFlashToQueue: (position: Vector3, intensity?: number) => void;
// }


export type WithNavMesh<T extends IWorld> = T & {
    navMesh?: NavMesh;
    costTable?: CostTable;
    entityManager: EntityManager;
    pathPlanner?: PathPlanner;

    muzzleFlashSystem: Map<string, (position: Vector3, intensity?: number) => void>;
    level?: LevelEntity
};

export type CustomWorld = WithNavMesh<WithRigidBody<WithTime<WithBoundaries<IWorld>>>>;
