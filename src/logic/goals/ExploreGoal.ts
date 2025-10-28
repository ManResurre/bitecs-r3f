import {CompositeGoal, Vector3} from 'yuka';
import {FindPathGoal} from './FindPathGoal';
import {FollowPathGoal} from './FollowPathGoal';
import {Mob} from '../../entities/Mob';

export class ExploreGoal extends CompositeGoal<Mob> {

    constructor(owner: Mob) {
        super(owner);
    }

    activate(): void {
        if (!this.owner || !this.owner.world.navMesh)
            return;

        this.clearSubgoals();

        // Получаем случайную позицию на карте
        const region = this.owner.world.navMesh.getRandomRegion();
        const from = new Vector3().copy(this.owner.position);
        const to = new Vector3().copy(region.centroid);

        // Настраиваем подцели
        this.addSubgoal(new FindPathGoal(this.owner, from, to));
        this.addSubgoal(new FollowPathGoal(this.owner));
    }

    execute() {
        // Выполняем подцели и проверяем статус
        this.status = this.executeSubgoals();

        // Перепланируем если цель провалилась
        this.replanIfFailed();
    }

    terminate(): void {
        if (!this.owner)
            return;

        this.clearSubgoals();
    }
}
