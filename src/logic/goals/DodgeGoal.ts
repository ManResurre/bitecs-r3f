import { Goal, CompositeGoal, Vector3 } from 'yuka';
import {Mob} from "../../entities/Mob.ts";

const right = new Vector3( 1, 0, 0 );
const left = new Vector3( - 1, 0, 0 );

export class DodgeGoal extends CompositeGoal<Mob> {
    right;
    targetPosition = new Vector3();
    constructor( owner:Mob, right ) {
        super( owner );
        this.right = right;
    }

    activate() {
        this.clearSubgoals();
        const owner = this.owner;
        if(!owner)
            return;

        if ( this.right ) {
            // dodge to right as long as there is enough space
            if ( owner.canMoveInDirection( right, this.targetPosition ) ) {
                this.addSubgoal( new SeekToPositionGoal( owner, this.targetPosition ) );
            } else {
                // no space anymore, now dodge to left
                this.right = false;
                this.status = Goal.STATUS.INACTIVE;
            }
        } else {
            // dodge to left as long as there is enough space
            if ( owner.canMoveInDirection( left, this.targetPosition ) ) {
                this.addSubgoal( new SeekToPositionGoal( owner, this.targetPosition ) );
            } else {
                // no space anymore, now dodge to right
                this.right = true;
                this.status = Goal.STATUS.INACTIVE;
            }
        }
    }

    execute() {
        if ( this.active() ) {
            const owner = this.owner;
            if(!owner)
                return;

            // stop executing if the traget is not visible anymore
            if ( owner.targetSystem.isTargetShootable() === false ) {
                this.status = Goal.STATUS.COMPLETED;
            } else {
                this.status = this.executeSubgoals();
                this.replanIfFailed();
                // if completed, set the status to inactive in order to repeat the goal
                if ( this.completed() ) this.status = Goal.STATUS.INACTIVE;
            }
        }
    }

    terminate() {
        this.clearSubgoals();
    }
}
