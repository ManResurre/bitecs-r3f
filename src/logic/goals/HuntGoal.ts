import {Goal, CompositeGoal, Vector3} from 'yuka';
import {FollowPathGoal} from './FollowPathGoal.js';
import {FindPathGoal} from './FindPathGoal.js';
import {Mob} from "../../entities/Mob.ts";

class HuntGoal extends CompositeGoal<Mob> {
    constructor(owner: Mob) {
        super(owner);
    }

    activate() {
        this.clearSubgoals();
        const owner = this.owner;
        if (!owner) {
            return;
        }

        // seek to the last sensed position
        const targetPosition = owner.targetSystem.getLastSensedPosition();

        // it's important to use path finding since there might be obstacle
        // between the current and target position
        const from = new Vector3().copy(owner.position);
        const to = new Vector3().copy(targetPosition);

        // setup subgoals
        this.addSubgoal(new FindPathGoal(owner, from, to));
        this.addSubgoal(new FollowPathGoal(owner));
    }

    execute() {
        const owner = this.owner;
        if (!owner) {
            return;
        }

        // hunting is not necessary if the target becomes visible again
        if (owner.targetSystem.isTargetShootable()) {
            this.status = Goal.STATUS.COMPLETED;
        } else {
            this.status = this.executeSubgoals();

            // if the enemy is at the last sensed position, forget about
            // the bot, update the target system and consider this goal as completed
            if (this.completed()) {
                const target = owner.targetSystem.getTarget();
                owner.removeEntityFromMemory(target);
                owner.targetSystem.update();
            } else {
                this.replanIfFailed();
            }
        }
    }

    terminate() {
        this.clearSubgoals();
    }
}
