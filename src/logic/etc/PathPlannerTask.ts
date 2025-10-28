import {Task, Vector3} from 'yuka';
import {PathPlanner} from "./PathPlanner.ts";
import {Mob} from "../../entities/Mob.ts";

export class PathPlannerTask extends Task {
    callback;
    planner;
    vehicle;
    from;
    to;

    constructor(planner: PathPlanner, vehicle: Mob, from: Vector3, to: Vector3, callback: (owner: Mob, path: Vector3[]) => void) {
        super();

        this.callback = callback;
        this.planner = planner;
        this.vehicle = vehicle;
        this.from = from;
        this.to = to;
    }

    execute() {
        const path = this.planner.navMesh.findPath(this.from, this.to);
        this.callback(this.vehicle, path);
    }
}
