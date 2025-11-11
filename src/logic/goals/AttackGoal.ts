import {Goal, CompositeGoal} from 'yuka';
import {Mob} from "../../entities/Mob.ts";
import {HuntGoal} from "./HuntGoal.ts";
import {MaintainDistanceGoal} from "./MaintainDistanceGoal.ts";

export class AttackGoal extends CompositeGoal<Mob> {
    constructor(owner: Mob) {
        super(owner);
    }

    activate() {
        this.clearSubgoals();

        const owner = this.owner;
        if (!owner)
            return;

        // owner.velocity.multiplyScalar(0);

        // console.log(`Mob ${owner.eid} AttackGoal`);

        if (owner.targetSystem.isTargetShootable()) {
            // Используем тактику поддержания дистанции вместо уклонения
            this.addSubgoal(new MaintainDistanceGoal(owner));
        } else {
            // Если цель не видна, идем на поиски
            this.addSubgoal(new HuntGoal(owner));
        }
    }

    execute() {
        const owner = this.owner;
        if (!owner)
            return;

        if (!owner.targetSystem.hasTarget()) {
            this.status = Goal.STATUS.COMPLETED;
        } else {
            const status = this.executeSubgoals();
            this.status = status;
            this.replanIfFailed();
        }
    }

    terminate() {
        this.clearSubgoals();
    }
}
