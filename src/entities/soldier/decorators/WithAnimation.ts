import {AnimationClip} from "three";
import {Vector3} from "../../../core/math/Vector3.ts";
import {Quaternion} from "../../../core/math/Quaternion.ts";
import {Api} from "../Soldier.ts";
import {CrowdAgent} from "recast-navigation";

const DIRECTIONS = [
    {direction: new Vector3(0, 0, 1), name: 'soldier_forward'},
    {direction: new Vector3(0, 0, -1), name: 'soldier_backward'},
    {direction: new Vector3(-1, 0, 0), name: 'soldier_left'},
    {direction: new Vector3(1, 0, 0), name: 'soldier_right'}
];

export interface EntityAnimatable {
    lookDirection: Vector3;
    moveDirection: Vector3;
    rotation: Quaternion;
    crowdAgent: CrowdAgent;
    speed: number;
    maxSpeed: number;
    position: Vector3;

    isVelocityZero(): boolean;

    updateAnimations(): void;
}

export function WithAnimation<T extends new (...args: any[]) => EntityAnimatable>(Base: T) {
    return class extends Base implements EntityAnimatable {
        animation?: Api<AnimationClip>;

        private tempForward = new Vector3(0, 0, 1);
        private tempUp = new Vector3(0, 1, 0);
        private transformedDirection = new Vector3();
        private weightings: number[] = [0, 0, 0, 0];
        private positiveWeightings: number[] = [];

        setAnimation(animation: Api<AnimationClip>) {
            this.animation = animation;
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
            this.moveDirection.copy(velocity).normalize();
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

            this.positiveWeightings.length = 0;
            let sum = 0;

            // Вычисляем кватернион для преобразования направлений
            // В оригинале это делается на основе разницы между forward и moveDirection
            const rotationQuaternion = new Quaternion();
            rotationQuaternion.lookAt(this.tempForward, moveDir, this.tempUp);

            for (let i = 0; i < DIRECTIONS.length; i++) {
                // Преобразуем локальное направление в мировое пространство
                this.transformedDirection.copy(DIRECTIONS[i].direction).applyRotation(rotationQuaternion);

                // Вычисляем скалярное произведение с направлением взгляда
                const dot = this.transformedDirection.dot(lookDir);
                this.weightings[i] = (dot < 0) ? 0 : dot;

                const actionName = DIRECTIONS[i].name;
                const action = this.animation.actions[actionName];
                // console.log(action);

                if (action) {
                    if (this.weightings[i] > 0.001) {
                        action.enabled = true;
                        this.positiveWeightings.push(i);
                        sum += this.weightings[i];

                    } else {
                        action.enabled = false;
                        action.weight = 0;
                    }
                }
            }

            for (let i = 0; i < this.positiveWeightings.length; i++) {
                const index = this.positiveWeightings[i];
                const actionName = DIRECTIONS[index].name;
                const action = this.animation.actions[actionName];

                if (action) {
                    action.weight = this.weightings[index] / sum;
                    action.timeScale = Math.max(0.1, Math.min(2.0, this.speed / this.maxSpeed));

                    if (!action.isRunning()) {
                        action.play();
                    }
                }
            }
        }


    };
}
