import {GoalEvaluator} from 'yuka';
import {Mob} from "../../entities/Mob.ts";
import {GetItemGoal} from "../goals/GetItemGoal.ts";
import {findClosestHealthPack} from "../../utils/mobHelper.ts";
import {HealthPackEntity} from "../../entities/HealthPackEntity.ts";

export class GetHealthEvaluator extends GoalEvaluator<Mob> {
    constructor(characterBias = 1) {
        super(characterBias);
    }

    calculateDesirability(owner: Mob) {
        // Высокая желательность, когда здоровье низкое и есть доступные аптечки
        if (owner.health < owner.maxHealth * 0.5) {
            return 0.8;
        }

        const foundHealthPack = findClosestHealthPack(owner) as HealthPackEntity;
        if (foundHealthPack && owner.vision.visible(foundHealthPack.position)) {
            return 0.5;
        }

        return 0.04;
    }

    setGoal(owner: Mob) {
        const currentSubgoal = owner.brain.currentSubgoal();
        if (!(currentSubgoal instanceof GetItemGoal)) {
            owner.brain.clearSubgoals();
            owner.brain.addSubgoal(new GetItemGoal(owner));
        }
    }
}
