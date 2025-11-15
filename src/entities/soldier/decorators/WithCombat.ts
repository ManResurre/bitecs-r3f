import {World} from "../../World.ts";
import {TargetSystem} from "../../../core/TargetSystem.ts";
import {GameEntity} from "../../GameEntity.ts";
import {Actor, AnyActorLogic, SnapshotFrom} from "xstate";
import {CrowdAgent} from "recast-navigation";
import {AssaultRifleComponent} from "../../../logic/components";
import {Vector3} from "../../../core/math/Vector3.ts";


export interface EntityCombat {
    arId:number
    stateActor: Actor<AnyActorLogic>;
    currentState: SnapshotFrom<AnyActorLogic>;
    crowdAgent: CrowdAgent;
    lookDirection: Vector3;
    moveDirection: Vector3;
    position: Vector3;
    currentTime: number;
    rotateTo: (target: Vector3) => void
}

export function WithCombat<T extends new (...args: any[]) => EntityCombat>(Base: T) {
    return class extends Base implements EntityCombat {
        targetSystem = new TargetSystem(this as unknown as GameEntity);
        lastShootTime = 0;
        shotTimeInterval = 0.5;

        constructor(...args: any[]) {
            super(...args);
            const world = args[0] as World;

        }

        updateCombatBehavior() {
            const target = this.targetSystem.getTarget();
            const context = this.stateActor.getSnapshot().context;

            if (target) {
                if (this.currentState.matches('movement')) {
                    this.stateActor.send({type: 'ENEMY_SPOTTED'});
                    this.crowdAgent.resetMoveTarget();
                }

                if (this.currentState.matches('combat.attack')) {
                    this.updateAttackBehavior(target, context);
                    this.updateAimAndShot(target);
                }
            } else {
                this.lookDirection.copy(this.moveDirection);

                if (this.currentState.matches('combat')) {
                    this.stateActor.send({type: 'HUNT'});

                }
            }
        }

        updateAttackBehavior(target: any, context: any) {
            const distance = this.position.distanceTo(target.position);
            // Определяем основное поведение на основе дистанции
            if (distance < 10) {
                // Слишком близко - отступаем
                if (!this.currentState.matches('combat.attack.retreating')) {
                    this.stateActor.send({type: 'RUN'});
                }
            } else {
                // Слишком далеко - преследуем
                if (!this.currentState.matches('combat.attack.pursuing')) {
                    this.stateActor.send({type: 'HUNT'});
                }
            }

            // Определяем нужно ли маневрировать
            const shouldDodge = this.shouldDodge();
            if (shouldDodge && !context.isDodging) {
                this.stateActor.send({type: 'DODGE_ON'});
            } else if (!shouldDodge && context.isDodging) {
                this.stateActor.send({type: 'DODGE_OFF'});
            }

            // Выполняем соответствующее боевое поведение
            this.executeCombatMovement(target, context);
        }

        updateAimAndShot(target: GameEntity) {
            if (target && this.targetSystem.isTargetShootable()) {
                this.rotateTo(target.position);

                // Стрельба в боевых состояниях
                if (this.currentState.matches('combat') &&
                    this.lastShootTime + this.shotTimeInterval < this.currentTime) {
                    AssaultRifleComponent.shoot[this.arId] = 1;
                    this.lastShootTime = this.currentTime;
                }
            }
        }

        shouldDodge(): boolean {
            // Простая логика для определения когда нужно маневрировать
            // Например: маневрировать с 50% вероятностью каждые 2 секунды
            return Math.random() < 0.5 && this.currentTime % 2 < 0.1;
        }

        executeCombatMovement(target: any, context: any) {
            const isRetreating = this.currentState.matches('combat.attack.retreating');

            if (isRetreating) {
                this.executeRetreating(target, context.isDodging);
            } else {
                this.executePursuing(target, context.isDodging);
            }
        }
    };
}
