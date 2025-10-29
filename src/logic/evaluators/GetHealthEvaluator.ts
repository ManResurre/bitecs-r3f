import {GoalEvaluator, MathUtils} from 'yuka';
import {Mob} from "../../entities/Mob.ts";
import {Feature} from "../../core/Feature.ts";

export class GetHealthEvaluator extends GoalEvaluator<Mob> {
    itemType = null;
    tweaker = 0.2;

    constructor(characterBias = 1, itemType = null) {
        super(characterBias);

        this.itemType = itemType;
    }

    calculateDesirability(owner: Mob) {

        let desirability = 0;

        if (owner.isItemIgnored(this.itemType) === false && owner.health < owner.maxHealth) {

            const distanceScore = Feature.distanceToItem(owner, this.itemType);
            const healthScore = Feature.health(owner);
            desirability = this.tweaker * (1 - healthScore) / distanceScore;
            desirability = MathUtils.clamp(desirability, 0, 1);
        }

        return desirability;
    }

    setGoal(owner: Mob) {
        const currentSubgoal = owner.brain.currentSubgoal();

        if ((currentSubgoal instanceof GetItemGoal) === false) {
            owner.brain.clearSubgoals();
            owner.brain.addSubgoal(new GetItemGoal(owner, this.itemType));
        }
    }
}
