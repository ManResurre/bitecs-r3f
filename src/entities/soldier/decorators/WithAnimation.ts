import {AnimationClip} from "three";
import {Vector3} from "../../../core/math/Vector3.ts";
import {Quaternion} from "../../../core/math/Quaternion.ts";
import {CrowdAgent} from "recast-navigation";
import {Api} from "../Npc.ts";

export const ANIMATION_FLAGS = {
    soldier_forward: 1 << 0,    // 0001
    soldier_backward: 1 << 1,   // 0010
    soldier_left: 1 << 2,       // 0100
    soldier_right: 1 << 3       // 1000
};

const DIRECTIONS = new Map([
    ['soldier_forward', new Vector3(0, 0, 1)],
    ['soldier_backward', new Vector3(0, 0, -1)],
    ['soldier_left', new Vector3(-1, 0, 0)],
    ['soldier_right', new Vector3(1, 0, 0)],
])

export interface EntityAnimatable {
    animation?: Api<AnimationClip>;
    lookDirection: Vector3;
    moveDirection: Vector3;
    rotation: Quaternion;
    crowdAgent: CrowdAgent;
    speed: number;
    maxSpeed: number;
    position: Vector3;

    isVelocityZero(): boolean;

    update(delta: number): void;
}

export function WithAnimation<T extends new (...args: any[]) => EntityAnimatable>(Base: T) {
    return class extends Base implements EntityAnimatable {
        private tempForward = new Vector3(0, 0, 1);
        private tempUp = new Vector3(0, 1, 0);
        private transformedDirection = new Vector3();
        private weightings = new Map<string, number>();
        private activeAnimations: number = 0; // Битовое поле для активных анимаций

        update(delta: number) {
            super.update(delta);
            this.updateAnimations();
        }

        updateAnimations() {
            if (!this.animation)
                return;

            this.rotation.lookAt(
                this.tempForward,
                this.lookDirection,
                this.tempUp
            );

            const velocity = this.crowdAgent.velocity();
            this.moveDirection.copy(velocity);
            this.calculateAnimationWeights(this.lookDirection, this.moveDirection);

            if (this.isVelocityZero()) {
                this.animation.actions["soldier_idle"]?.play()
            } else {
                this.animation.actions["soldier_idle"]?.stop()
            }
        }

        private calculateAnimationWeights(lookDir: Vector3, moveDir: Vector3) {
            if (!this.animation)
                return;

            this.activeAnimations = 0; // Сбрасываем флаги
            this.weightings.clear(); // Очищаем веса
            let sum = 0;

            // Вычисляем кватернион для преобразования направлений
            const rotationQuaternion = new Quaternion();
            rotationQuaternion.lookAt(this.tempForward, moveDir, this.tempUp);

            for (const [animationName, directionVector] of DIRECTIONS) {

                // Преобразуем локальное направление в мировое пространство
                this.transformedDirection.copy(directionVector).applyRotation(rotationQuaternion);

                // Вычисляем скалярное произведение с направлением взгляда
                const dot = this.transformedDirection.dot(lookDir);
                const weight = (dot < 0) ? 0 : dot;

                this.weightings.set(animationName, weight);

                const action = this.animation.actions[animationName];

                if (!action)
                    continue;

                if (weight) {
                    action.enabled = true;
                    this.activeAnimations |= ANIMATION_FLAGS[animationName];
                    sum += weight;
                } else {
                    action.enabled = false;
                    action.weight = 0;
                }
            }

            for (const [animationName] of DIRECTIONS) {

                const action = this.animation.actions[animationName];
                const weight = this.weightings.get(animationName) || 0;

                if (action && (this.activeAnimations & ANIMATION_FLAGS[animationName])) {
                    //нормализация весов
                    // До нормализации
                    // soldier_forward weight: 0.8
                    // soldier_right weight: 0.4
                    // Сумма: 1.2
                    // После нормализации
                    // soldier_forward: 0.8 / 1.2 = 0.67 (67%)
                    // soldier_right: 0.4 / 1.2 = 0.33 (33%)
                    // Сумма: 1.0 (100%)
                    action.weight = weight / sum;
                    action.timeScale = Math.max(0.1, Math.min(2.0, this.speed / this.maxSpeed));

                    if (!action.isRunning()) {
                        action.play();
                    }
                }
            }
        }
    };
}
