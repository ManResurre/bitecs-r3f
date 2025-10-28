import {GoalEvaluator} from 'yuka';
import {ExploreGoal} from '../goals/ExploreGoal.js';
import {Mob} from "../../entities/Mob.ts";

export class ExploreEvaluator extends GoalEvaluator<Mob> {
    constructor(characterBias = 1) {
        super(characterBias);
    }

    calculateDesirability(owner: Mob) {
        // Если уже исследуем, желательность низкая
        const currentSubgoal = owner.brain.currentSubgoal();
        if (currentSubgoal instanceof ExploreGoal) {
            return 0.05; // Низкий приоритет, если уже исследуем
        }

        // Иначе умеренная желательность исследования
        return 0.1;
    }

    setGoal(owner: Mob) {
        const currentSubgoal = owner.brain.currentSubgoal();
        if (!(currentSubgoal instanceof ExploreGoal)) {
            owner.brain.clearSubgoals();
            owner.brain.addSubgoal(new ExploreGoal(owner));
        }
    }
}
