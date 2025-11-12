import {
    AnimationAction,
    AnimationClip,
    AnimationMixer,
    Group,
    Object3D,
} from "three";
import {World} from "./World.ts";
import {RefObject} from "react";
import {CrowdAgent} from "recast-navigation";
import {MobComponent} from "../logic/components";
import {Vector3} from "../core/math/Vector3.ts";
import {Quaternion} from "../core/math/Quaternion.ts";

type Api<T extends AnimationClip> = {
    ref: React.RefObject<Object3D | undefined | null>;
    clips: AnimationClip[];
    mixer: AnimationMixer;
    names: T['name'][];
    actions: {
        [key in T['name']]: AnimationAction | null;
    };
};

export enum SOLDIER_STATUS {
    ALIVE,
    DEAD
}

const DIRECTIONS = [
    {direction: new Vector3(0, 0, 1), name: 'soldier_forward'},
    {direction: new Vector3(0, 0, -1), name: 'soldier_backward'},
    {direction: new Vector3(-1, 0, 0), name: 'soldier_left'},
    {direction: new Vector3(1, 0, 0), name: 'soldier_right'}
];

export class Soldier {
    id: number;
    world: World;
    status: SOLDIER_STATUS = SOLDIER_STATUS.ALIVE;
    crowdAgent: CrowdAgent;

    soldierRef: RefObject<Group>;
    weaponRef: RefObject<Group>;
    animation: Api<AnimationClip>;

    lookDirection = new Vector3(0, 0, 1);
    moveDirection = new Vector3(0, 0, 1);

    private tempForward = new Vector3(0, 0, 1);
    private tempUp = new Vector3(0, 1, 0);
    private transformedDirection = new Vector3();
    private weightings: number[] = [0, 0, 0, 0];
    private positiveWeightings: number[] = [];

    rotation = new Quaternion();

    constructor(world: World, id: number) {
        this.world = world;
        this.id = id;
        this.crowdAgent = world.crowd!.getAgent(MobComponent.crowdId[id]) as CrowdAgent;
        // console.log(this.crowdAgent.velocity());
    }

    get position() {
        return this.crowdAgent.position();
    }

    getQuaternion() {
        const velocity = this.crowdAgent.velocity();
        const targetQuaternion = new Quaternion();

        if (velocity.x !== 0 || velocity.z !== 0) {
            const direction = new Vector3(velocity.x, 0, velocity.z).normalize();
            targetQuaternion.setFromUnitVectors(this.tempForward, direction);
        }

        return targetQuaternion;
    }

    get speed() {
        const velocity = this.crowdAgent.velocity();
        return new Vector3().copy(velocity).length();
    }

    get maxSpeed() {
        return this.crowdAgent.maxSpeed;
    }

    update() {
        const velocity = this.crowdAgent.velocity();
        const direction = new Vector3(velocity.x, 0, velocity.z).normalize();
        this.lookDirection.copy(direction);
        this.updateAnimations();
    }

    setRenderComponentRef(soldierRef: RefObject<Group>) {
        this.soldierRef = soldierRef;
    }

    setWeaponRef(weaponRef: RefObject<Group>) {
        this.weaponRef = weaponRef;
    }

    setAnimation(animation: Api<AnimationClip>) {
        this.animation = animation;
        // if (this.animation.actions['soldier_idle']) {
        //     this.animation.actions['soldier_idle'].play();
        // }
    }

    updateAnimations() {
        if (!this.animation)
            return;
        if (this.status === SOLDIER_STATUS.ALIVE) {
            this.rotation.lookAt(
                this.tempForward,
                this.lookDirection,
                this.tempUp
            );
            this.moveDirection.copy(this.crowdAgent.velocity()).normalize();
            this.calculateAnimationWeights(this.lookDirection, this.moveDirection);
        }
    }

    private calculateAnimationWeights(lookDir: Vector3, moveDir: Vector3) {
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
}
