import {Goal, SeekBehavior, Vector3} from 'yuka';
import {Mob} from "../../entities/Mob.ts";

export class SeekToPositionGoal extends Goal<Mob> {
    target: Vector3;

    constructor(owner: Mob, target = new Vector3()) {

        super(owner);

        this.target = target;

    }

    activate() {
        if (!this.owner)
            return;

        const owner = this.owner;

        // console.log(`Mob ${owner.eid} SeekToPositionGoal`);

        const seekBehavior: SeekBehavior = owner.steering.behaviors[2] as SeekBehavior;
        seekBehavior.target.copy(this.target);
        seekBehavior.active = true;
    }

    execute() {
        if (!this.owner)
            return;

        if (this.owner.atPosition(this.target)) {
            this.status = Goal.STATUS.COMPLETED;
        }
    }

    terminate() {
        if (!this.owner)
            return;

        const seekBehavior = this.owner.steering.behaviors[2];
        seekBehavior.active = false;
    }
}
