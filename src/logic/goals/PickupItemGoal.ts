import {Goal} from "yuka";
import {Mob} from "../../entities/Mob.ts";
import {HealthPackEntity} from "../../entities/HealthPackEntity.ts";
import CONFIG from "../../core/Config.ts";

export class PickupItemGoal extends Goal<Mob> {
    item: HealthPackEntity;

    constructor(owner: Mob, item: HealthPackEntity) {
        super(owner);
        this.item = item;

        // console.log(item.position);
    }

    activate() {
        if (!this.owner)
            return;

        // Останавливаем моба
        this.owner.velocity.set(0, 0, 0);
        this.owner.maxSpeed = 0;

        // console.log('pickUp');
    }

    execute() {
        if (!this.owner)
            return;


        // Добавляем проверку на уже завершенную цель
        if (this.status === Goal.STATUS.COMPLETED) {
            return;
        }

        if (!this.item.active) {
            this.status = Goal.STATUS.FAILED;
            return;
        }

        // console.log('PickupItemGoal',this.item.active);

        const distance = this.owner.position.distanceTo(this.item.position);

        if (distance <= 2) {
            // Подбираем аптечку
            this.owner.health = 100;
            this.item.setActive(false);
            this.status = Goal.STATUS.COMPLETED;
        } else {
            // this.status = Goal.STATUS.FAILED;
        }
    }

    terminate() {
        if (!this.owner)
            return;
        this.owner.maxSpeed = CONFIG.BOT.MOVEMENT.MAX_SPEED;
    }
}
