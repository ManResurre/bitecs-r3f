import {CompositeGoal, Vector3, Goal, Regulator} from 'yuka';
import {FindPathGoal} from './FindPathGoal.js';
import {FollowPathGoal} from './FollowPathGoal.js';
import {Mob} from "../../entities/Mob.ts";
import CONFIG from "../../core/Config.ts";
import {HealthPackEntity} from "../../entities/HealthPackEntity.ts";
import {findClosestHealthPack} from "../../utils/mobHelper.ts";
import {PickupItemGoal} from "./PickupItemGoal.ts";

export class GetItemGoal extends CompositeGoal<Mob> {
    item: HealthPackEntity | null = null;
    regulator = new Regulator(CONFIG.BOT.GOAL.ITEM_VISIBILITY_UPDATE_FREQUENCY);

    constructor(owner: Mob) {
        super(owner);
    }

    activate() {
        // Находим ближайшую аптечку
        const owner = this.owner;
        if (!owner)
            return;

        this.clearSubgoals();

        const foundHealthPack = findClosestHealthPack(owner);

        if (foundHealthPack) {
            this.item = foundHealthPack;
            // if an item was found, try to pick it up
            const from = new Vector3().copy(owner.position);
            const to = new Vector3().copy(foundHealthPack.currentRegion!.centroid);

            // setup subgoals
            this.addSubgoal(new FindPathGoal(owner, from, to));
            this.addSubgoal(new FollowPathGoal(owner));
            this.addSubgoal(new PickupItemGoal(owner, foundHealthPack));

            return;
        }

        this.status = Goal.STATUS.FAILED;
    }

    execute() {
        if (this.active()) {
            if (!this.owner || !this.item)
                return;

            // Проверяем, находится ли моб уже достаточно близко к аптечке
            // if (this.owner && this.item && this.owner.atPosition(this.item.position)) {
            //     this.status = Goal.STATUS.COMPLETED;
            //     return;
            // }


            // only check the availability of the item if it is visible for the enemy
            if (this.regulator.ready() && this.owner.vision.visible(this.item.position)) {
                // if it was picked up by somebody else, mark the goal as failed
                if (!this.item.active) {
                    this.status = Goal.STATUS.FAILED;
                } else {
                    const subgoalStatus = this.executeSubgoals();
                    this.status = subgoalStatus;
                }
            } else {
                const subgoalStatus = this.executeSubgoals();
                this.status = subgoalStatus;
            }

            // replan the goal means the bot tries to find another item of the same type
            this.replanIfFailed();
        }
    }

    terminate() {
        this.clearSubgoals();
        this.item = null;
    }
}
