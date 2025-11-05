import {MovingEntity, Vector3} from 'yuka';
import {BulletComponent} from "../logic/components";

export class Projectile extends MovingEntity {
    bid: number;
    from: Vector3 = new Vector3(0, 0, 0);
    to: Vector3 = new Vector3(0, 0, 0);

    constructor(bid: number) {
        super();
        this.bid = bid;
        this.name = `bullet_${bid}`;
        this.from.set(
            BulletComponent.from.x[bid],
            BulletComponent.from.y[bid],
            BulletComponent.from.z[bid]
        );
        this.to.set(
            BulletComponent.to.x[bid],
            BulletComponent.to.y[bid],
            BulletComponent.to.z[bid]
        ).add(new Vector3(0,1,0));

        // Устанавливаем начальную позицию
        this.position.copy(this.from);

        const direction = new Vector3().subVectors(this.to, this.from).normalize();
        const speed = 5; // Скорость пули
        this.velocity.copy(direction).multiplyScalar(speed);
        this.maxSpeed = speed;
    }
}
