import {CompositeGoal, Vector3, Goal, Regulator} from 'yuka';
import {FindPathGoal} from './FindPathGoal.js';
import {FollowPathGoal} from './FollowPathGoal.js';
import {Mob} from "../../entities/Mob.ts";
import CONFIG from "../../core/Config.ts";
import {HealthPackEntity} from "../../entities/HealthPackEntity.ts";
import {healthPackQuery} from "../queries";

export class GetItemGoal extends CompositeGoal<Mob> {
    item: HealthPackEntity | null = null;
    regulator = new Regulator(CONFIG.BOT.GOAL.ITEM_VISIBILITY_UPDATE_FREQUENCY);

    constructor(owner: Mob) {
        super(owner);
    }

    private findClosestHealthPack(): HealthPackEntity | null {
        const healthIds = healthPackQuery(this.owner!.world);

        let closestItem = null;
        let minDistance = Infinity;
        for (const hpId of healthIds) {
            const health = this.owner!.world.entityManager.getEntityByName(`healthPack${hpId}`) as HealthPackEntity;
            const fromRegion = this.owner!.currentRegion!;
            const toRegion = health.currentRegion!;

            const from = this.owner!.world.navMesh!.getNodeIndex(fromRegion);
            const to = this.owner!.world.navMesh!.getNodeIndex(toRegion);

            const distance = this.owner!.world.costTable!.get(from, to);
            if (distance < minDistance) {
                minDistance = distance;
                closestItem = health;
            }
        }

        return closestItem;
    }

    activate() {
        // Находим ближайшую аптечку
        const owner = this.owner;
        if (!owner)
            return;

        const foundHealthPack = this.findClosestHealthPack();

        if (foundHealthPack) {
            this.item = foundHealthPack;
            // if an item was found, try to pick it up
            const from = new Vector3().copy(owner.position);
            const to = new Vector3().copy(foundHealthPack.position);

            // setup subgoals
            this.addSubgoal(new FindPathGoal(owner, from, to));
            this.addSubgoal(new FollowPathGoal(owner));

            return;
        }

        this.status = Goal.STATUS.FAILED;
    }

    execute() {
        if (this.active()) {
            // only check the availability of the item if it is visible for the enemy
            if (this.regulator.ready() && this.owner.vision.visible(this.item.position)) {
                // if it was picked up by somebody else, mark the goal as failed
                if (this.item.active === false) {
                    this.status = Goal.STATUS.FAILED;
                } else {
                    this.status = this.executeSubgoals();
                }
            } else {
                this.status = this.executeSubgoals();
            }

            // replan the goal means the bot tries to find another item of the same type
            this.replanIfFailed();
        }
    }

    terminate() {
        this.clearSubgoals();
    }
}
