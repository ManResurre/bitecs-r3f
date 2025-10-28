import {Goal, Vector3} from 'yuka';
import {Mob} from '../../entities/Mob';

export class FindPathGoal extends Goal<Mob> {
    from: Vector3;
    to: Vector3;

    constructor(owner: Mob, from: Vector3, to: Vector3) {
        super(owner);

        this.from = from;
        this.to = to;
    }

    activate(): void {
        if (!this.owner || !this.owner.world.pathPlanner)
            return;

        const owner = this.owner;

        // Проверяем наличие pathPlanner
        if (owner.world.pathPlanner === null) {
            this.status = Goal.STATUS.FAILED;
            return;
        }

        const pathPlanner = owner.world.pathPlanner!;

        // Сбрасываем предыдущий путь
        owner.path = null;

        console.log(`Mob ${owner.eid}: Requesting path from`, this.from, 'to', this.to);

        // Выполняем асинхронный поиск пути
        pathPlanner.findPath(owner, this.from, this.to, (vehicle: Mob, path: Vector3[] | null) => {
            // Важно: проверяем что цель еще активна
            if (this.status === Goal.STATUS.INACTIVE) return;

            if (path !== null) {
                console.log(`Mob ${owner.eid}: Path found with ${path.length} points`);
                vehicle.path = path;
                this.status = Goal.STATUS.COMPLETED;
            } else {
                console.log(`Mob ${owner.eid}: Path finding failed`);
                this.status = Goal.STATUS.FAILED;
            }
        });
    }

    execute(): void {
        // Ждем пока путь будет вычислен
        // Статус изменится в колбэке
    }

    terminate(): void {
        // Оригинал не имеет специальной логики в terminate
    }
}
