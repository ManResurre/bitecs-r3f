import {GoalEvaluator} from 'yuka';
import {Mob} from "../../entities/Mob.ts";
import {Feature} from "../../core/Feature.ts";

class AttackEvaluator extends GoalEvaluator {
    tweaker = 1;

    constructor(characterBias = 1) {
        super(characterBias);
    }

    calculateDesirability(owner: Mob) {
        let desirability = 0;
        if (owner.targetSystem.hasTarget()) {
            desirability = this.tweaker * Feature.totalWeaponStrength(owner) * Feature.health(owner);
        }
        return desirability;
    }

    setGoal(owner) {
        const currentSubgoal = owner.brain.currentSubgoal();
        if ((currentSubgoal instanceof AttackGoal) === false) {
            owner.brain.clearSubgoals();
            owner.brain.addSubgoal(new AttackGoal(owner));
        }
    }
}
