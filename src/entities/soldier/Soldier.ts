import {
    AnimationAction,
    AnimationClip,
    AnimationMixer,
    Group,
    Object3D,
} from "three";
import {World} from "../World.ts";
import {RefObject} from "react";
import {CrowdAgent} from "recast-navigation";
import {AssaultRifleComponent, MobComponent} from "../../logic/components";
import {Vector3} from "../../core/math/Vector3.ts";
import {Quaternion} from "../../core/math/Quaternion.ts";
import {addComponent, addEntity} from "bitecs";
import {GameEntity} from "../GameEntity.ts";
import {Regulator} from "../../core/Regulator.ts";
import {TargetSystem} from "../../core/TargetSystem.ts";
import {MemorySystem} from "../../core/memory/MemorySystem.ts";
import {mobsQuery} from "../../logic/queries";
import {Actor, AnyActorLogic, createActor, SnapshotFrom} from "xstate";
import {soldierMachine} from "../SoldierStateMachine.ts";
import {EntityAnimatable, WithAnimation} from "./decorators/WithAnimation.ts";
import {EntityVision, WithVision} from "./decorators/WithVision.ts";
import {Vision} from "../../core/Vision.ts";
import {WithCombat} from "./decorators/WithCombat.ts";

export type Api<T extends AnimationClip> = {
    ref: RefObject<Object3D | undefined | null>;
    clips: AnimationClip[];
    mixer: AnimationMixer;
    names: T['name'][];
    actions: {
        [key in T['name']]: AnimationAction | null;
    };
};

@WithAnimation
@WithVision
@WithCombat
export class Soldier extends GameEntity implements EntityAnimatable, EntityVision {
    crowdAgent: CrowdAgent;

    soldierRef?: RefObject<Group>;
    weaponRef?: RefObject<Group>;

    lookDirection = new Vector3(0, 0, 1);
    moveDirection = new Vector3(0, 0, 1);
    rotation = new Quaternion();
    private tempUp = new Vector3(0, 1, 0);

    arId: number;

    targetSystemRegulator = new Regulator(2); // 2 раза/сек = каждые 30 кадров
    reactionRegulator = new Regulator(2); // 2 раза/сек = каждые 30 кадров
    updateRegulator = new Regulator(0); // 2 раза/сек = каждые 30 кадров

    memorySystem = new MemorySystem(this);





    currentState: SnapshotFrom<AnyActorLogic>;
    currentTargetPoint = new Vector3(1, 0, 1);

    stateHandlers = new Map([
        ['exploring', this.startExploring],
        ['combat.attack.retreating', this.startRetreating],
        ['combat.attack.pursuing', this.startPursuing]
    ]);

    declare updateAnimations: () => void;
    declare updateCombatBehavior: () => void;
    declare visionRegulator: Regulator;
    declare vision: Vision;

    constructor(world: World, id: number) {
        super(world, id);

        this.crowdAgent = world.crowd!.getAgent(MobComponent.crowdId[id]) as CrowdAgent;

        this.arId = addEntity(world);
        addComponent(this.world, AssaultRifleComponent, this.arId);
        AssaultRifleComponent.shoot[this.arId] = 0;

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
