import {
    FollowPathBehavior, GameEntity, MemoryRecord, MemorySystem,
    NavMesh,
    OnPathBehavior,
    Polygon,
    Quaternion,
    Regulator, SeekBehavior,
    Think,
    Vector3,
    Vehicle, Vision
} from "yuka";
import CONFIG from "../core/Config.ts";
import {CustomWorld} from "../types";
import {ExploreEvaluator} from "../logic/evaluators/ExploreEvaluator.ts";
import {
    HEALTH_PACK,
    STATUS_ALIVE, STATUS_DEAD,
    STATUS_DYING,
    WEAPON_TYPES_ASSAULT_RIFLE,
    WEAPON_TYPES_SHOTGUN
} from "../core/Constants.ts";
import {AnimationAction, AnimationMixer} from "three";
import {mobsQuery} from "../logic/queries";
import {TargetSystem} from "../core/TargetSystem.ts";
import {GetHealthEvaluator} from "../logic/evaluators/GetHealthEvaluator.ts";

// Константы для системы анимаций
const DIRECTIONS = [
    {direction: new Vector3(0, 0, 1), name: 'soldier_forward'},
    {direction: new Vector3(0, 0, -1), name: 'soldier_backward'},
    {direction: new Vector3(-1, 0, 0), name: 'soldier_left'},
    {direction: new Vector3(1, 0, 0), name: 'soldier_right'}
];

const worldPosition = new Vector3();

export class Mob extends Vehicle {
    public eid: number;
    public navMesh: NavMesh;
    public world: CustomWorld;
    private initialized = false;

    health = CONFIG.BOT.MAX_HEALTH;
    maxHealth = CONFIG.BOT.MAX_HEALTH;

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

    // item related properties
    ignoreHealth = false;
    ignoreShotgun = false;
    ignoreAssaultRifle = false;
    endTimeIgnoreHealth = Infinity;
    endTimeIgnoreShotgun = Infinity;
    endTimeIgnoreAssaultRifle = Infinity;
    ignoreItemsTimeout = CONFIG.BOT.IGNORE_ITEMS_TIMEOUT;

    // vision
    head = new GameEntity();
    vision = new Vision(this.head);
    visionRegulator = new Regulator(CONFIG.BOT.VISION.UPDATE_FREQUENCY);

    // memory
    memorySystem = new MemorySystem(this);
    memoryRecords: MemoryRecord[] = [];

    // death animation
    endTimeDying = Infinity;
    dyingTime = CONFIG.BOT.DYING_TIME;

    // searching for attackers
    searchAttacker = false;
    attackDirection = new Vector3();
    endTimeSearch = Infinity;
    searchTime = CONFIG.BOT.SEARCH_FOR_ATTACKER_TIME;

    // target system
    targetSystem = new TargetSystem(this);
    targetSystemRegulator = new Regulator(CONFIG.BOT.TARGET_SYSTEM.UPDATE_FREQUENCY);

    ignoreWeapons = false;

    constructor(eid: number, world: CustomWorld) {
        super();
        this.eid = eid;
        this.name = `mob_${eid}`;
        this.world = world;
        this.navMesh = world.navMesh!;

        this.initializePosition();
        this.brain.addEvaluator(new ExploreEvaluator());
        this.brain.addEvaluator(new GetHealthEvaluator());

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

        const seekBehavior = new SeekBehavior();
        seekBehavior.active = false;
        this.steering.add(seekBehavior);

        //head
        this.head.position.y = CONFIG.BOT.HEAD_HEIGHT;
        this.add(this.head);

        this.memorySystem.memorySpan = CONFIG.BOT.MEMORY.SPAN;
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
        // Сбрасываем каждые 24 часа игрового времени
        const MAX_GAME_TIME = 24 * 60 * 60; // 24 часа в секундах
        this.currentTime = (this.currentTime + delta) % MAX_GAME_TIME;

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

        this.updateAnimations();

        if (this.status === STATUS_ALIVE) {
            // update perception
            if (this.visionRegulator.ready()) {
                this.updateVision();
            }

            // update memory system
            this.memorySystem.getValidMemoryRecords(this.currentTime, this.memoryRecords);

            // update target system
            if (this.targetSystemRegulator.ready()) {
                this.targetSystem.update();
            }

            // stop search for attacker if necessary
            if (this.currentTime >= this.endTimeSearch) {
                this.resetSearch();
            }

            // reset ignore flags if necessary
            if (this.currentTime >= this.endTimeIgnoreHealth) {
                this.ignoreHealth = false;
            }

            if (this.currentTime >= this.endTimeIgnoreShotgun) {
                this.ignoreShotgun = false;
            }

            if (this.currentTime >= this.endTimeIgnoreAssaultRifle) {
                this.ignoreAssaultRifle = false;
            }
        }

        // handle dying
        if (this.status === STATUS_DYING) {
            if (this.currentTime >= this.endTimeDying) {
                this.status = STATUS_DEAD;
                this.endTimeDying = Infinity;
            }
        }

        return this;
    }

    updateVision() {
        // 1. Получаем ссылки на систему памяти и зрение текущего врага
        const memorySystem = this.memorySystem;
        const vision = this.vision;

        // 2. Получаем список всех "конкурентов" (других сущностей в мире)
        const mobIds = mobsQuery(this.world);
        // this.eid

        // 3. Перебираем всех конкурентов в цикле
        for (const mobId of mobIds) {
            // 4. Пропускаем самого себя и мертвых сущностей
            if (this.eid == mobId) continue;

            const competitor = this.world.entityManager.getEntityByName(`mob_${mobId}`) as Mob;
            if (!competitor || competitor.status !== STATUS_ALIVE) continue;

            // Создаем запись если её нет и сразу получаем её
            if (!memorySystem.hasRecord(competitor)) {
                memorySystem.createRecord(competitor);
            }

            // 6. Получаем запись о конкуренте из памяти
            const record = memorySystem.getRecord(competitor);

            // Если запись все равно undefined - пропускаем
            if (!record) {
                console.warn(`Could not get record for competitor ${mobId}`);
                continue;
            }

            // 7. Получаем мировую позицию головы конкурента
            competitor.head.getWorldPosition(worldPosition);

            // 8. Проверяем, видна ли голова конкурента
            if (vision.visible(worldPosition) && competitor.active) {
                // 9. Если видна - обновляем время последнего обнаружения
                record.timeLastSensed = this.currentTime;

                // 10. Сохраняем последнюю обнаруженную позицию (тела, а не головы)
                record.lastSensedPosition.copy(competitor.position);

                // 11. Если конкурент стал видимым только что - запоминаем время
                if (record.visible === false) record.timeBecameVisible = this.currentTime;

                // 12. Помечаем конкурента как видимого
                record.visible = true;
            } else {
                // 13. Если не виден - помечаем как невидимого
                record.visible = false;
            }
        }

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

    updateAnimations() {
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
        // Проверяем, что все действия анимации существуют и валидны
        if (!this.actions) {
            console.warn('Animation actions not available');
            return;
        }

        this.positiveWeightings.length = 0;
        let sum = 0;

        // Вычисляем веса для каждого направления
        for (let i = 0; i < DIRECTIONS.length; i++) {
            this.transformedDirection.copy(DIRECTIONS[i].direction).applyRotation(this.quaternion);
            const dot = this.transformedDirection.dot(this.lookDirection);
            this.weightings[i] = (dot < 0) ? 0 : dot;

            const actionName = DIRECTIONS[i].name;
            const action = this.actions[actionName];

            // Добавляем проверку на валидность действия
            if (action && this.isActionValid(action)) {
                if (this.weightings[i] > 0.001) {
                    this.ensureActionReady(action);
                    action.enabled = true;
                    this.positiveWeightings.push(i);
                    sum += this.weightings[i];
                } else {
                    this.safelyDisableAction(action);
                }
            }else {
                console.log("проблема");
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
            const actionName = DIRECTIONS[index].name;
            const action = this.actions[actionName];

            if (action && this.isActionValid(action)) {
                this.ensureActionReady(action);
                action.weight = this.weightings[index] / sum;
                // Масштабируем скорость анимации в зависимости от фактической скорости
                action.timeScale = Math.max(0.1, Math.min(2.0, speed / this.maxSpeed)); // Ограничиваем диапазон

                if (!action.isRunning()) {
                    action.play();
                }
            }
        }

        // Выключаем idle анимацию, если активны анимации движения
        const idleAction = this.actions['soldier_idle'];
        if (idleAction && this.isActionValid(idleAction)) {
            this.safelyDisableAction(idleAction);
        }

        this.currentAnimationState = 'moving';
    }

// Добавляем вспомогательные методы для безопасной работы с анимациями
    private isActionValid(action: AnimationAction): boolean {
        return action !== null && action !== undefined &&
            typeof action.play === 'function' &&
            typeof action.stop === 'function';
    }

    private ensureActionReady(action: AnimationAction): void {
        try {
            // Проверяем, что анимация готова к использованию
            if (!action.getMixer()) {
                console.warn('Animation action has no mixer');
                return;
            }
        } catch (error) {
            console.warn('Error checking animation action:', error);
        }
    }

    private safelyDisableAction(action: AnimationAction): void {
        try {
            if (this.isActionValid(action)) {
                action.enabled = false;
                action.weight = 0;
                // Не останавливаем анимацию полностью, только отключаем
                // action.stop(); // Это может вызывать проблемы
            }
        } catch (error) {
            console.warn('Error disabling animation action:', error);
        }
    }

    isItemIgnored(type: number) {
        let ignoreItem = false;
        switch (type) {
            case HEALTH_PACK:
                ignoreItem = this.ignoreHealth;
                break;
            case WEAPON_TYPES_SHOTGUN:
                ignoreItem = this.ignoreShotgun;
                break;
            case WEAPON_TYPES_ASSAULT_RIFLE:
                ignoreItem = this.ignoreAssaultRifle;
                break;
            default:
                console.error('Mob: Invalid item type:', type);
                break;
        }

        return ignoreItem;
    }

    resetSearch() {
        this.searchAttacker = false;
        this.attackDirection.set(0, 0, 0);
        this.endTimeSearch = Infinity;
        return this;
    }

    reset() {
        this.health = this.maxHealth;
        this.status = STATUS_ALIVE;

        // reset search for attacker
        this.resetSearch();

        // items
        this.ignoreHealth = false;
        this.ignoreWeapons = false;

        // clear brain and memory
        this.brain.clearSubgoals();

        this.memoryRecords.length = 0;
        this.memorySystem.clear();

        // reset target and weapon system
        this.targetSystem.reset();
        // this.weaponSystem.reset();

        // reset all animations
        // this.resetAnimations();

        // set default animation
        if (this.actions) {
            const run = this.actions['soldier_forward'].play();
            run.enabled = true;
        }

        return this;

    }
}
