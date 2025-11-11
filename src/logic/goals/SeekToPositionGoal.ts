import {Goal, NavMesh, Polygon, SeekBehavior, Vector3} from 'yuka';
import {Mob} from "../../entities/Mob.ts";

export class SeekToPositionGoal extends Goal<Mob> {
    target: Vector3;
    targetRegion?: Polygon;

    constructor(owner: Mob, target = new Vector3()) {
        super(owner);
        this.target = target;
    }

    activate() {
        if (!this.owner)
            return;

        const owner = this.owner;
        const navMesh = owner.world.navMesh as NavMesh;

        // Простая корректировка цели
        this.targetRegion = navMesh.getRegionForPoint(this.target, 4);

        if (this.targetRegion) {
            const seekBehavior: SeekBehavior = owner.steering.behaviors[2] as SeekBehavior;
            seekBehavior.target.copy(this.targetRegion.centroid);
            seekBehavior.active = true;
        }
    }

    execute() {
        if (!this.owner)
            return;

        if (this.targetRegion && this.owner.atPosition(this.targetRegion.centroid)) {
            this.status = Goal.STATUS.COMPLETED;
        }

        if (!this.targetRegion) {
            console.log('fail seek');
        }
    }

    terminate() {
        if (!this.owner)
            return;

        const seekBehavior = this.owner.steering.behaviors[2];
        seekBehavior.active = false;
    }
}
