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
import {AssaultRifleComponent, MobComponent} from "../logic/components";
import {Vector3} from "../core/math/Vector3.ts";
import {Quaternion} from "../core/math/Quaternion.ts";
import {addComponent, addEntity} from "bitecs";
import {Vision} from "../core/Vision.ts";
import {GameEntity} from "./GameEntity.ts";
import {Regulator} from "../core/Regulator.ts";
import {TargetSystem} from "../core/TargetSystem.ts";
import {MemorySystem} from "../core/memory/MemorySystem.ts";
import {mobsQuery} from "../logic/queries";

type Api<T extends AnimationClip> = {
    ref: RefObject<Object3D | undefined | null>;
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

export class Soldier extends GameEntity {
    status: SOLDIER_STATUS = SOLDIER_STATUS.ALIVE;
    crowdAgent: CrowdAgent;

    soldierRef?: RefObject<Group>;
    weaponRef?: RefObject<Group>;
    animation?: Api<AnimationClip>;

    lookDirection = new Vector3(0, 0, 1);
    moveDirection = new Vector3(0, 0, 1);

    private tempForward = new Vector3(0, 0, 1);
    private tempUp = new Vector3(0, 1, 0);
    private transformedDirection = new Vector3();
    private weightings: number[] = [0, 0, 0, 0];
    private positiveWeightings: number[] = [];

    rotation = new Quaternion();

    arId: number;

    vision: Vision;

    visionRegulator = new Regulator(2); // 2 раза/сек = каждые 30 кадров
    targetSystemRegulator = new Regulator(2); // 2 раза/сек = каждые 30 кадров
    reactionRegulator = new Regulator(2); // 2 раза/сек = каждые 30 кадров

    memorySystem = new MemorySystem(this);
    targetSystem = new TargetSystem(this);

    lastShootTime = 0;
    shotTimeInterval = 0.5;

    constructor(world: World, id: number) {
        super(world, id);

        this.crowdAgent = world.crowd!.getAgent(MobComponent.crowdId[id]) as CrowdAgent;

        this.arId = addEntity(world);
        addComponent(this.world, AssaultRifleComponent, this.arId);
        AssaultRifleComponent.shoot[this.arId] = 0;

        this.vision = new Vision(world.navMesh!);
    }

    get position() {
        return new Vector3().copy(this.crowdAgent.position());
    }

    get speed() {
        const velocity = this.crowdAgent.velocity();
        return new Vector3().copy(velocity).length();
    }

    get maxSpeed() {
        return this.crowdAgent.maxSpeed;
    }

    update(delta: number) {
        const MAX_GAME_TIME = 24 * 60 * 60;
        this.currentTime = (this.currentTime + delta) % MAX_GAME_TIME;
        AssaultRifleComponent.shoot[this.arId] = 0;

        if (this.visionRegulator.ready()) {
            this.updateVision();
        }

        if (this.targetSystemRegulator.ready()) {
            this.targetSystem.update();
        }

        if (this.reactionRegulator.ready()) {
            this.updateAimAndShot();
        }

        this.updateAnimations();
    }

    updateVision() {
        const mobIds = mobsQuery(this.world);

        for (const mobId of mobIds) {
            if (this.id == mobId) continue;

            const competitor = this.world.entityManager.get(mobId);

            if (!competitor)
                continue;

            // Проверяем видимость
            const isVisible = this.isVisible(competitor.position);

            if (!this.memorySystem.hasRecord(competitor)) {
                this.memorySystem.createRecord(competitor);
            }

            const record = this.memorySystem.get(competitor.id);
            if (!record) continue;

            if (isVisible) {
                record.visible = true;
                record.timeLastSensed = this.currentTime;
                record.lastSensedPosition.copy(competitor.position);
            } else {
                record.visible = false;
            }
        }

        return this;
    }

    setRenderComponentRef(soldierRef: RefObject<Group>) {
        this.soldierRef = soldierRef;
    }

    setWeaponRef(weaponRef: RefObject<Group>) {
        this.weaponRef = weaponRef;
    }

    setAnimation(animation: Api<AnimationClip>) {
        this.animation = animation;
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

    isVisible(position: Vector3) {
        return this.vision.checkFieldOfView(
            this.position,
            this.lookDirection,
            position,
            50,
            120
        );
    }

    rotateTo(target: Vector3) {
        const direction = new Vector3().subVectors(target, this.position);
        direction.normalize();

        // Обновляем направление взгляда
        this.lookDirection.copy(direction);
    }

    updateAimAndShot() {
        const targetSystem = this.targetSystem;
        const target = targetSystem.getTarget();

        if (target) {
            if (targetSystem.isTargetShootable()) {
                this.rotateTo(target.position);
                // Начало стрельбы
                if (this.lastShootTime + this.shotTimeInterval < this.currentTime) {
                    AssaultRifleComponent.shoot[this.arId] = 1;
                    this.lastShootTime = this.currentTime;
                }
            }
        } else {
            this.lookDirection.copy(this.moveDirection)
        }
    }
}
