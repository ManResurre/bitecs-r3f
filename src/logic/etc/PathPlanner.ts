import {NavMesh, TaskQueue, Vector3} from 'yuka';
import {PathPlannerTask} from "./PathPlannerTask.ts";
import {Mob} from "../../entities/Mob.ts";

export class PathPlanner {
    navMesh: NavMesh;
    taskQueue = new TaskQueue();

    constructor(navMesh: NavMesh) {
        this.navMesh = navMesh;
    }

    findPath(vehicle: Mob, from: Vector3, to: Vector3, callback: (owner: Mob, path: Vector3[]) => void) {
        const task = new PathPlannerTask(this, vehicle, from, to, callback);
        this.taskQueue.enqueue(task);
    }

    update() {
        this.taskQueue.update();
    }
}
