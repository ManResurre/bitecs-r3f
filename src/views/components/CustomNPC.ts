import { NavMesh, GameEntity, Vector3, Polygon } from 'yuka';
import { Vector3 as ThreeVector3 } from "three";

export class CustomNPC extends GameEntity {
    navMesh: NavMesh;
    path: Vector3[] = [];
    currentPathIndex = 0;
    target = new Vector3();
    speed = 2.0;
    arrivalThreshold = 0.5;

    constructor(navMesh: NavMesh) {
        super();
        this.navMesh = navMesh;
    }

    // Метод для получения случайной позиции на навмеше
    getRandomPosition(): ThreeVector3 | null {
        if (!this.navMesh) return null;

        // Получаем случайный регион из навмеша
        const randomRegion = this.navMesh.getRandomRegion();
        if (!randomRegion) {
            console.log('No regions found in navmesh');
            return null;
        }

        // Получаем контур региона
        const contour: Vector3[] = [];
        randomRegion.getContour(contour);

        if (contour.length < 3) {
            console.log('Region contour has insufficient points');
            return null;
        }

        // Вычисляем центр региона как среднее арифметическое всех вершин
        const center = new Vector3();
        contour.forEach(vertex => {
            center.add(vertex);
        });
        center.divideScalar(contour.length);

        return new ThreeVector3(center.x, center.y, center.z);
    }

    setTarget(targetPosition: ThreeVector3): this {
        const v = new Vector3(targetPosition.x, targetPosition.y, targetPosition.z);

        // Находим путь от текущей позиции к цели
        const path = this.navMesh.findPath(this.position, v);

        if (path && path.length > 0) {
            this.path = path;
            this.currentPathIndex = 0;
            this.target.copy(this.path[this.currentPathIndex]);
            console.log('Path found with', path.length, 'points');
        } else {
            this.path = [];
            console.log('Path not found from', this.position, 'to', v);
        }

        return this;
    }

    // Метод для установки случайной цели на навмеше
    setRandomTarget(): this {
        const randomPoint = this.getRandomPosition();
        if (randomPoint) {
            this.setTarget(randomPoint);
            console.log('Random target set on navmesh:', randomPoint);
        } else {
            console.log('Failed to get random position on navmesh');
        }
        return this;
    }

    update(delta: number, cb?: (pos: Vector3) => void): this {
        super.update(delta);

        if (this.path.length === 0) return this;

        // Вектор направления к текущей целевой точке
        const direction = new Vector3();
        direction.subVectors(this.target, this.position).normalize();

        // Перемещаемся к цели
        const movement = direction.multiplyScalar(this.speed * delta);
        this.position.add(movement);

        // Колбэк для обновления позиции в React
        if (cb) {
            cb(this.position.clone());
        }

        // Проверяем, достигли ли текущей точки маршрута
        const distanceToTarget = this.position.distanceTo(this.target);

        if (distanceToTarget < this.arrivalThreshold) {
            this.currentPathIndex++;

            if (this.currentPathIndex < this.path.length) {
                // Переходим к следующей точке пути
                this.target.copy(this.path[this.currentPathIndex]);
                console.log('Moving to next point:', this.currentPathIndex);
            } else {
                // Достигли конечной точки
                console.log('Route completed');
                this.path = [];

                // Устанавливаем новую случайную цель на навмеше
                this.setRandomTarget();
            }
        }

        return this;
    }
}
