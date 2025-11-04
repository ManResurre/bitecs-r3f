import {GoalEvaluator} from 'yuka';
import {Mob} from "../../entities/Mob.ts";
import {AttackGoal} from "../goals/AttackGoal.ts";

export class AttackEvaluator extends GoalEvaluator<Mob> {
    constructor(characterBias = 1) {
        super(characterBias);
    }

    calculateDesirability(owner: Mob) {
        if (owner.targetSystem.hasTarget())
            return 1;

        return 0;
    }

    setGoal(owner: Mob) {
        const currentSubgoal = owner.brain.currentSubgoal();
        if (!(currentSubgoal instanceof AttackGoal)) {
            owner.brain.clearSubgoals();
            owner.brain.addSubgoal(new AttackGoal(owner));
        }
    }
}
