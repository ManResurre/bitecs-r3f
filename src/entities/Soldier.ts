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
import {Actor, AnyActorLogic, createActor, SnapshotFrom} from "xstate";
import {soldierMachine} from "./SoldierStateMachine.ts";

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
    updateRegulator = new Regulator(0); // 2 раза/сек = каждые 30 кадров

    memorySystem = new MemorySystem(this);
    targetSystem = new TargetSystem(this);

    lastShootTime = 0;
    shotTimeInterval = 0.5;

    stateActor: Actor<AnyActorLogic>;
    currentState: SnapshotFrom<AnyActorLogic>;
    currentTargetPoint = new Vector3(1, 0, 1);

    stateHandlers = new Map([
        ['exploring', this.startExploring],
        ['combat.attack.retreating', this.startRetreating],
        ['combat.attack.pursuing', this.startPursuing]
    ]);

    constructor(world: World, id: number) {
        super(world, id);

        this.crowdAgent = world.crowd!.getAgent(MobComponent.crowdId[id]) as CrowdAgent;

        this.arId = addEntity(world);
        addComponent(this.world, AssaultRifleComponent, this.arId);
        AssaultRifleComponent.shoot[this.arId] = 0;

        this.vision = new Vision(world.navMesh!);

        // Инициализация актора машины состояний
        this.stateActor = createActor(soldierMachine).start();

        // Подписка на изменения состояния
        this.stateActor.subscribe((snapshot: SnapshotFrom<AnyActorLogic>) => {
            const oldValue = this.currentState ? JSON.stringify(this.currentState.value) : '';
            this.currentState = snapshot;

            // console.log(`Soldier ${this.id}: `, snapshot.value);

            //новое состояние
            if (oldValue !== JSON.stringify(snapshot.value))
                this.handleStateEntry()
        });

        this.startExploring();
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


        if (this.updateRegulator.ready() && this.currentState) {
            // Обновление логики состояний
            this.updateStateMachine();
            this.updateMovement();
            this.updateAnimations();
        }
    }

    updateStateMachine() {
        if (this.visionRegulator.ready()) {
            this.updateVision();
        }

        if (this.targetSystemRegulator.ready()) {
            this.targetSystem.update();
        }

        if (this.reactionRegulator.ready()) {
            this.updateCombatBehavior();
        }
    }


    updateMovement() {
        const agentState = this.crowdAgent.state();

        // Проверяем достигли ли точки только в состоянии исследования
        if (this.currentState.matches('movement') && agentState && this.isVelocityZero()) {
            this.stateActor.send({type: 'POINT_REACHED'});
            console.log('POINT_REACHED');
        }
    }

    isVelocityZero() {
        const velocity = this.crowdAgent.velocity();
        const speedSq = velocity.x * velocity.x + velocity.z * velocity.z;

        const THRESHOLD_SQ = 0.001;
        return speedSq < THRESHOLD_SQ
    }

    selectNewRandomPoint() {
        const randomPointResult = this.world.navMeshQuery?.findRandomPoint();

        if (randomPointResult) {
            this.currentTargetPoint.copy(randomPointResult.randomPoint);
            this.crowdAgent.requestMoveTarget(this.currentTargetPoint);
            // console.log(`Soldier ${this.id} moving to new random point`);
        }
    }

    // Добавляем метод для обработки входа в состояния
    handleStateEntry() {
        for (const [state, handler] of this.stateHandlers) {
            if (this.currentState.matches(state)) {
                handler.call(this)
            }
        }
    }

    startExploring() {
        this.selectNewRandomPoint();
    }

    startRetreating() {
        // console.log(`Soldier ${this.id} starting retreat`);
        // Прерываем текущее движение к случайной точке
        // Дальнейшее движение будет управляться в updateCombatBehavior
    }

    startPursuing() {
        // console.log(`Soldier ${this.id} starting pursuit`);
        // Прерываем текущее движение к случайной точке
        // Дальнейшее движение будет управляться в updateCombatBehavior
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
        const shouldDodge = this.shouldDodge(target);
        if (shouldDodge && !context.isDodging) {
            this.stateActor.send({type: 'DODGE_ON'});
        } else if (!shouldDodge && context.isDodging) {
            this.stateActor.send({type: 'DODGE_OFF'});
        }

        // Выполняем соответствующее боевое поведение
        this.executeCombatMovement(target, context);
    }

    executeCombatMovement(target: any, context: any) {
        const isRetreating = this.currentState.matches('combat.attack.retreating');

        if (isRetreating) {
            this.executeRetreating(target, context.isDodging);
        } else {
            this.executePursuing(target, context.isDodging);
        }
    }

    executeRetreating(target: any, isDodging: boolean) {
        // Логика отступления
        const awayDirection = new Vector3()
            .subVectors(this.position, target.position)
            .normalize();

        let retreatPoint: Vector3;

        if (isDodging) {
            // Отступление с маневрированием (зигзагами)
            const perpendicular = new Vector3()
                .crossVectors(awayDirection, this.tempUp)
                .normalize();
            const zigzagSide = Math.sin(this.currentTime * 3) > 0 ? 1 : -1;

            retreatPoint = new Vector3()
                .copy(this.position)
                .add(awayDirection.multiplyScalar(8))
                .add(perpendicular.multiplyScalar(3 * zigzagSide));
        } else {
            // Прямое отступление
            retreatPoint = new Vector3()
                .copy(this.position)
                .add(awayDirection.multiplyScalar(10));
        }

        const closestPoint = this.world.navMeshQuery?.findClosestPoint(retreatPoint);

        if (closestPoint) {
            this.crowdAgent.requestMoveTarget(closestPoint.point);
        }
    }

    executePursuing(target: any, isDodging: boolean) {
        if (isDodging) {
            // Преследование с маневрированием
            const toEnemy = new Vector3()
                .subVectors(target.position, this.position)
                .normalize();
            const perpendicular = new Vector3()
                .crossVectors(toEnemy, this.tempUp)
                .normalize();

            const zigzagSide = Math.sin(this.currentTime * 3) > 0 ? 1 : -1;
            const maneuverPoint = new Vector3()
                .copy(this.position)
                .add(toEnemy.multiplyScalar(5))
                .add(perpendicular.multiplyScalar(3 * zigzagSide));

            const closestPoint = this.world.navMeshQuery?.findClosestPoint(maneuverPoint);
            if (closestPoint) {
                this.crowdAgent.requestMoveTarget(closestPoint.point);
            }
        } else {
            // Прямое преследование
            this.crowdAgent.requestMoveTarget(target.position);
        }
    }

    shouldDodge(target: any): boolean {
        // Простая логика для определения когда нужно маневрировать
        // Например: маневрировать с 50% вероятностью каждые 2 секунды
        return Math.random() < 0.5 && this.currentTime % 2 < 0.1;
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

    updateVision() {
        const mobIds = mobsQuery(this.world);
        for (const mobId of mobIds) {
            if (this.id == mobId) continue;

            const competitor = this.world.entityManager.get(mobId);
            if (!competitor) continue;

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
}
