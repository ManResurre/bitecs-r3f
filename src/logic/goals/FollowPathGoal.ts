import {FollowPathBehavior, Goal, OnPathBehavior} from 'yuka';
import {Mob} from '../../entities/Mob';

export class FollowPathGoal extends Goal<Mob> {

    constructor(owner: Mob) {
        super(owner);
    }

    activate(): void {
        if (!this.owner)
            return;

        const owner = this.owner;
        const path = owner.path;

        if (path === null) {
            this.status = Goal.STATUS.FAILED;
            return;
        }

        // Получаем поведения
        const followPathBehavior = owner.steering.behaviors[0] as FollowPathBehavior;
        const onPathBehavior = owner.steering.behaviors[1] as OnPathBehavior;

        // Обновляем путь и активируем поведения
        followPathBehavior.active = true;
        followPathBehavior.path.clear();

        onPathBehavior.active = true;

        // Добавляем точки пути
        for (let i = 0, l = path.length; i < l; i++) {
            const waypoint = path[i];
            followPathBehavior.path.add(waypoint);
        }

        console.log(`Mob ${owner.eid}: Following path with ${path.length} waypoints`);
    }

    execute(): void {
        if (!this.owner)
            return;

        const owner = this.owner;
        const path = owner.path;

        if (path === null) {
            this.status = Goal.STATUS.FAILED;
            return;
        }

        // Проверяем, достигли ли конечной точки пути
        if (owner.atPosition(path[path.length - 1])) {
            console.log(`Mob ${owner.eid}: Reached destination`);
            this.status = Goal.STATUS.COMPLETED;
        }
    }

    terminate(): void {
        if (!this.owner)
            return;

        const owner = this.owner;

        // Деактивируем поведения
        const followPathBehavior = owner.steering.behaviors[0] as FollowPathBehavior;
        const onPathBehavior = owner.steering.behaviors[1] as OnPathBehavior;

        followPathBehavior.active = false;
        onPathBehavior.active = false;

        console.log(`Mob ${owner.eid}: FollowPathGoal terminated`);
    }
}
