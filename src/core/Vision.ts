import {NavMeshQuery, QueryFilter, NavMesh} from "recast-navigation";
import {Vector3} from "./math/Vector3.ts";

export class Vision {
    private navMeshQuery: NavMeshQuery;
    private filter: QueryFilter;

    public fieldOfView = 120;
    public range = 20;

    constructor(navMesh: NavMesh) {
        this.navMeshQuery = new NavMeshQuery(navMesh);
        this.filter = new QueryFilter();
        // Раскомментируйте это для базовой фильтрации
        // this.filter.includeFlags = 0xFFFF;
        // this.filter.excludeFlags = 0;
    }

    private getStartRef(position: Vector3): number | null {
        const nearestPoly = this.navMeshQuery.findNearestPoly(position, {
            filter: this.filter,
            halfExtents: {x: 2, y: 4, z: 2} // Увеличиваем область поиска
        });

        if (!nearestPoly.success) {
            console.warn('Cannot find start polygon for position:', position);
            return null;
        }

        return nearestPoly.nearestRef;
    }

    /**
     * Находит ближайшую точку на навмеше для заданной позиции
     */
    private findClosestPointOnNavMesh(position: Vector3): Vector3 | null {
        const result = this.navMeshQuery.findClosestPoint(position, {
            filter: this.filter,
            halfExtents: {x: 5, y: 10, z: 5} // Большая область поиска
        });

        if (result.success) {
            return new Vector3(result.point.x, result.point.y, result.point.z);
        }

        console.warn('Cannot find closest point on navmesh for:', position);
        return null;
    }


    /**
     * Проверяет видимость и возвращает дополнительную информацию
     */
    checkVisibility(from: Vector3, to: Vector3): {
        visible: boolean;
        hitPosition?: Vector3;
        hitNormal?: Vector3;
        closestPoint?: Vector3;
    } {
        const startRef = this.getStartRef(from);
        if (!startRef) {
            return {visible: false};
        }

        // Находим ближайшую точку на навмеше
        const closestTo = this.findClosestPointOnNavMesh(to);
        if (!closestTo) {
            return {visible: false};
        }

        const hit = this.navMeshQuery.raycast(startRef, from, closestTo, {
            filter: this.filter
        });

        if (hit.t === 1) {
            return {
                visible: true,
                closestPoint: closestTo
            };
        } else {
            const hitPosition = new Vector3()
                .copy(from)
                .lerp(closestTo, hit.t);

            return {
                visible: false,
                hitPosition,
                hitNormal: hit.hitNormal,
                closestPoint: closestTo
            };
        }
    }

    checkFieldOfView(
        agentPosition: Vector3,
        agentDirection: Vector3,
        targetPosition: Vector3,
        maxDistance: number = this.range,
        fovAngle: number = this.fieldOfView
    ): boolean {
        const toTarget = new Vector3()
            .copy(targetPosition)
            .sub(agentPosition);

        const distance = toTarget.length();

        // Проверяем расстояние
        if (distance > maxDistance) {
            return false;
        }

        // Если цель в той же позиции
        if (distance < 0.001) {
            return true;
        }

        // Проверяем, что направление агента не нулевое
        if (agentDirection.lengthSq() < 0.001) {
            return false;
        }

        const directionNormalized = toTarget.normalize();
        const agentDirectionNormalized = agentDirection.normalize();

        // Используем angleTo для более точного вычисления
        const angle = agentDirectionNormalized.angleTo(directionNormalized) * (180 / Math.PI);

        if (angle > fovAngle / 2) {
            return false;
        }

        // Проверяем прямую видимость
        return this.canSee(agentPosition, targetPosition);
    }

    canSee(from: Vector3, to: Vector3): boolean {
        const startRef = this.getStartRef(from);
        if (!startRef) {
            return false;
        }

        const hit = this.navMeshQuery.raycast(
            startRef,
            from,
            to,
            {filter: this.filter}
        );

        return hit.t >= 1;
    }
}
