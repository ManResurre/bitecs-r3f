import {Goal, CompositeGoal, Vector3} from 'yuka';
import {Mob} from "../../entities/Mob.ts";
import {SeekToPositionGoal} from "./SeekToPositionGoal.ts";

export class MaintainDistanceGoal extends CompositeGoal<Mob> {
    private desiredDistance: number;
    private minDistance: number;
    private maxDistance: number;
    private currentTactic: 'approach' | 'retreat' | 'strafe';
    private lastTacticChange: number;
    private tacticCooldown: number;

    constructor(owner: Mob, desiredDistance = 15, minDistance = 8, maxDistance = 20) {
        super(owner);
        this.desiredDistance = desiredDistance;
        this.minDistance = minDistance;
        this.maxDistance = maxDistance;
        this.currentTactic = 'approach';
        this.lastTacticChange = 0;
        this.tacticCooldown = 2; // секунды между сменой тактики
    }

    activate() {
        this.clearSubgoals();
        const owner = this.owner;
        if (!owner) return;

        // console.log(`Mob ${owner.eid} MaintainDistanceGoal - ${this.currentTactic}`);

        this.updateTactic();
        this.executeTactic();
    }

    execute() {
        const owner = this.owner;
        if (!owner) return;

        // Обновляем тактику по истечении кд
        if (owner.currentTime - this.lastTacticChange >= this.tacticCooldown) {
            this.updateTactic();
        }

        const status = this.executeSubgoals();

        // Если текущая подцель завершена, выполняем следующее действие
        if (status === Goal.STATUS.COMPLETED) {
            this.executeTactic();
        }

        this.status = Goal.STATUS.ACTIVE;
        return this.status;
    }

    terminate() {
        this.clearSubgoals();
    }

    private updateTactic() {
        const owner = this.owner;
        if (!owner || !owner.targetSystem.hasTarget()) return;

        const target = owner.targetSystem.getTarget();
        if (!target) return;

        const distance = owner.position.distanceTo(target.position);

        if (distance < this.minDistance) {
            // Слишком близко - отходим
            this.currentTactic = 'retreat';
        } else if (distance > this.maxDistance) {
            // Слишком далеко - приближаемся
            this.currentTactic = 'approach';
        } else {
            // В оптимальной дистанции - двигаемся в сторону
            this.currentTactic = 'strafe';
        }

        this.lastTacticChange = owner.currentTime;
    }

    private executeTactic() {
        this.clearSubgoals();
        const owner = this.owner;
        if (!owner || !owner.targetSystem.hasTarget()) return;

        const target = owner.targetSystem.getTarget() as Mob;
        if (!target) return;

        let targetPosition: Vector3;

        switch (this.currentTactic) {
            case 'approach':
                targetPosition = this.calculateApproachPosition(target);
                break;
            case 'retreat':
                targetPosition = this.calculateRetreatPosition(target);
                break;
            case 'strafe':
                targetPosition = this.calculateStrafePosition(target);
                break;
            default:
                targetPosition = owner.position.clone();
        }

        if (targetPosition && this.isPositionValid(targetPosition)) {
            this.addSubgoal(new SeekToPositionGoal(owner, targetPosition));
        }
    }

    private calculateApproachPosition(target: Mob): Vector3 {
        const owner = this.owner!;
        const directionToTarget = target.position.clone().sub(owner.position).normalize();
        // Подходим на 80% от желаемой дистанции
        return target.position.clone().sub(directionToTarget.multiplyScalar(this.desiredDistance * 0.8));
    }

    private calculateRetreatPosition(target: Mob): Vector3 {
        const owner = this.owner!;
        const directionFromTarget = owner.position.clone().sub(target.position).normalize();
        // Отходим на 120% от желаемой дистанции
        return owner.position.clone().add(directionFromTarget.multiplyScalar(this.desiredDistance * 0.2));
    }

    private calculateStrafePosition(target: Mob): Vector3 {
        const owner = this.owner!;
        const directionToTarget = target.position.clone().sub(owner.position).normalize();

        // Выбираем случайное направление для движения в сторону
        const strafeDirection = new Vector3();
        if (Math.random() > 0.5) {
            // Движение влево относительно направления к цели
            strafeDirection.crossVectors(directionToTarget, owner.up).normalize();
        } else {
            // Движение вправо относительно направления к цели
            strafeDirection.crossVectors(owner.up, directionToTarget).normalize();
        }

        // Двигаемся на небольшое расстояние в сторону
        return owner.position.clone().add(strafeDirection.multiplyScalar(this.desiredDistance * 0.3));
    }

    private isPositionValid(position: Vector3): boolean {
        const owner = this.owner!;
        return owner.navMesh.getRegionForPoint(position, 1) !== null;
    }
}
