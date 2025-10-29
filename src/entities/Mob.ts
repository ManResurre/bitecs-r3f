import {
    FollowPathBehavior,
    NavMesh,
    OnPathBehavior,
    Polygon,
    Quaternion,
    Regulator,
    Think,
    Vector3,
    Vehicle
} from "yuka";
import CONFIG from "../core/Config.ts";
import {CustomWorld} from "../types";
import {ExploreEvaluator} from "../logic/evaluators/ExploreEvaluator.ts";
import {STATUS_ALIVE} from "../core/Constants.ts";
import {AnimationAction, AnimationMixer} from "three";

// Константы для системы анимаций
const DIRECTIONS = [
    {direction: new Vector3(0, 0, 1), name: 'soldier_forward'},
    {direction: new Vector3(0, 0, -1), name: 'soldier_backward'},
    {direction: new Vector3(-1, 0, 0), name: 'soldier_left'},
    {direction: new Vector3(1, 0, 0), name: 'soldier_right'}
];

export class Mob extends Vehicle {
    public eid: number;
    public navMesh: NavMesh;
    public world: CustomWorld;
    private initialized = false;

    currentTime = 0;
    currentRegion: Polygon | null = null;
    currentPosition = new Vector3();
    previousPosition = new Vector3();

    // navigation path
    path: Vector3[] | null = null;

    brain = new Think(this);
    goalArbitrationRegulator = new Regulator(5);
    maxSpeed = CONFIG.BOT.MOVEMENT.MAX_SPEED;

    // animation
    mixer: AnimationMixer | null = null;
    status = STATUS_ALIVE;
    actions?: Record<string, AnimationAction>;
    actionsNames?: string[];

    // Система смешивания анимаций
    public lookDirection = new Vector3();
    public moveDirection = new Vector3();

    private quaternion = new Quaternion();
    private transformedDirection = new Vector3();
    private weightings: number[] = [0, 0, 0, 0];
    private positiveWeightings: number[] = [];
    private currentAnimationState = 'idle';

    constructor(eid: number, world: CustomWorld) {
        super();
        this.eid = eid;
        this.name = `mob_${eid}`;
        this.world = world;
        this.navMesh = world.navMesh!;

        this.initializePosition();
        this.brain.addEvaluator(new ExploreEvaluator());

        // steering behaviors
        const followPathBehavior = new FollowPathBehavior();
        followPathBehavior.active = false;
        followPathBehavior.nextWaypointDistance = CONFIG.BOT.NAVIGATION.NEXT_WAYPOINT_DISTANCE;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        followPathBehavior._arrive.deceleration = CONFIG.BOT.NAVIGATION.ARRIVE_DECELERATION;
        this.steering.add(followPathBehavior);

        const onPathBehavior = new OnPathBehavior();
        onPathBehavior.active = false;
        onPathBehavior.path = followPathBehavior.path;
        onPathBehavior.radius = CONFIG.BOT.NAVIGATION.PATH_RADIUS;
        onPathBehavior.weight = CONFIG.BOT.NAVIGATION.ONPATH_WEIGHT;
        this.steering.add(onPathBehavior);
    }

    private initializePosition(): void {
        if (!this.navMesh) {
            console.warn(`Mob ${this.eid}: NavMesh not available for position initialization`);
            return;
        }

        const region = this.navMesh.getRandomRegion();
        if (region) {
            this.position.copy(region.centroid);
            this.currentRegion = region;
            this.previousPosition.copy(this.position);
            this.initialized = true;
            console.log(`Mob ${this.eid}: Initialized at position`, this.position);
        } else {
            console.error(`Mob ${this.eid}: Could not find random region for initialization`);
        }
    }

    stayInLevel() {
        if (!this.currentRegion) {
            this.currentRegion = this.navMesh.getRegionForPoint(this.position, 1);
            if (!this.currentRegion) {
                console.warn(`Mob ${this.eid}: No current region, skipping stayInLevel`);
                return this;
            }
        }

        this.currentPosition.copy(this.position);

        const newRegion = this.navMesh.clampMovement(
            this.currentRegion,
            this.previousPosition,
            this.currentPosition,
            this.position
        );

        if (newRegion) {
            this.currentRegion = newRegion;
        } else {
            console.warn(`Mob ${this.eid}: clampMovement returned null region`);
        }

        this.previousPosition.copy(this.position);

        if (this.currentRegion) {
            const distance = this.currentRegion.plane.distanceToPoint(this.position);
            this.position.y -= distance * CONFIG.NAVMESH.HEIGHT_CHANGE_FACTOR;
        }

        return this;
    }

    update(delta: number): this {
        super.update(delta);

        if (!this.navMesh) {
            console.warn(`Mob ${this.eid}: No navMesh available`);
            return this;
        }

        if (!this.initialized) {
            this.currentRegion = this.navMesh.getRegionForPoint(this.position, 1);
            if (this.currentRegion) {
                this.initialized = true;
                console.log(`Mob ${this.eid}: Initialized in update`);
            }
        }

        this.stayInLevel();

        // update goals
        this.brain.execute();
        if (this.goalArbitrationRegulator.ready()) {
            this.brain.arbitrate();
        }

        this.updateAnimations(delta);

        return this;
    }

    atPosition(position: Vector3) {
        const tolerance = CONFIG.BOT.NAVIGATION.ARRIVE_TOLERANCE * CONFIG.BOT.NAVIGATION.ARRIVE_TOLERANCE;
        const distance = this.position.squaredDistanceTo(position);
        return distance <= tolerance;
    }

    setAnimations(mixer: AnimationMixer, actions: Record<string, AnimationAction>, names: string[]) {
        this.mixer = mixer;
        this.actions = actions;
        this.actionsNames = names;

        // Запускаем idle анимацию по умолчанию
        if (this.actions['soldier_idle']) {
            this.actions['soldier_idle'].play();
        }
    }

    updateAnimations(delta: number) {
        if (!this.mixer || !this.actions) return this;

        // Обновляем микшер анимаций
        // this.mixer.update(delta);

        if (this.status === STATUS_ALIVE) {
            // Получаем направления
            this.getDirection(this.lookDirection);
            this.moveDirection.copy(this.velocity).normalize();

            // Если скорость очень мала, используем idle анимацию
            const speed = this.getSpeed();
            if (speed < 0.1) {
                this.setIdleAnimation();
                return this;
            }

            // Вычисляем вращение для преобразования направлений
            this.quaternion.lookAt(this.forward, this.moveDirection, this.up);

            // Вычисляем веса для анимаций движения
            this.calculateAnimationWeights(speed);
        }

        return this;
    }

    private setIdleAnimation() {
        if (this.currentAnimationState === 'idle') return;

        // Выключаем все анимации движения
        for (const direction of DIRECTIONS) {
            const action = this.actions![direction.name];
            if (action) {
                action.enabled = false;
                action.weight = 0;
            }
        }

        // Включаем idle анимацию
        const idleAction = this.actions!['soldier_idle'];
        if (idleAction) {
            idleAction.enabled = true;
            idleAction.weight = 1;
            if (!idleAction.isRunning()) {
                idleAction.play();
            }
        }

        this.currentAnimationState = 'idle';
    }

    private calculateAnimationWeights(speed: number) {
        this.positiveWeightings.length = 0;
        let sum = 0;

        // Вычисляем веса для каждого направления
        for (let i = 0; i < DIRECTIONS.length; i++) {
            this.transformedDirection.copy(DIRECTIONS[i].direction).applyRotation(this.quaternion);
            const dot = this.transformedDirection.dot(this.lookDirection);
            this.weightings[i] = (dot < 0) ? 0 : dot;

            const action = this.actions![DIRECTIONS[i].name];
            if (action && this.weightings[i] > 0.001) {
                action.enabled = true;
                this.positiveWeightings.push(i);
                sum += this.weightings[i];
            } else if (action) {
                action.enabled = false;
                action.weight = 0;
            }
        }

        // Если нет активных анимаций, используем idle
        if (this.positiveWeightings.length === 0) {
            this.setIdleAnimation();
            return;
        }

        // Нормализуем веса и устанавливаем для анимаций
        for (let i = 0; i < this.positiveWeightings.length; i++) {
            const index = this.positiveWeightings[i];
            const action = this.actions![DIRECTIONS[index].name];
            if (action) {
                action.weight = this.weightings[index] / sum;
                // Масштабируем скорость анимации в зависимости от фактической скорости
                action.timeScale = speed / this.maxSpeed;

                if (!action.isRunning()) {
                    action.play();
                }
            }
        }

        // Выключаем idle анимацию, если активны анимации движения
        const idleAction = this.actions!['soldier_idle'];
        if (idleAction) {
            idleAction.enabled = false;
            idleAction.weight = 0;
        }

        this.currentAnimationState = 'moving';
    }
}
