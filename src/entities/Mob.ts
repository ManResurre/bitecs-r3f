import {FollowPathBehavior, NavMesh, OnPathBehavior, Polygon, Regulator, Think, Vector3, Vehicle} from "yuka";
import CONFIG from "../core/Config.ts";
import {CustomWorld} from "../types";
import {ExploreEvaluator} from "../logic/evaluators/ExploreEvaluator.ts";

export class Mob extends Vehicle {
    public eid: number;
    public navMesh: NavMesh;
    public world: CustomWorld;
    private initialized = false;

    currentTime = 0;

    currentRegion: Polygon | null = null; // Меняем на null вместо undefined
    currentPosition = new Vector3();
    previousPosition = new Vector3();

    // navigation path
    path: Vector3[] | null = null;

    brain = new Think(this);
    goalArbitrationRegulator = new Regulator(5);

    maxSpeed = CONFIG.BOT.MOVEMENT.MAX_SPEED;

    constructor(eid: number, world: CustomWorld) {
        super();
        this.eid = eid;
        this.name = `mob_${eid}`;
        this.world = world;
        this.navMesh = world.navMesh!;

        // Устанавливаем начальную позицию на случайном регионе navMesh
        this.initializePosition();

        // goal-driven agent design
        this.brain.addEvaluator(new ExploreEvaluator());

        // steering
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

    // Новый метод для инициализации позиции
    private initializePosition(): void {
        if (!this.navMesh) {
            console.warn(`Mob ${this.eid}: NavMesh not available for position initialization`);
            return;
        }

        // Получаем случайный регион и устанавливаем позицию
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
        // Если региона нет, пытаемся найти его для текущей позиции
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

        // Обновляем регион
        if (newRegion) {
            this.currentRegion = newRegion;
        } else {
            console.warn(`Mob ${this.eid}: clampMovement returned null region`);
        }

        this.previousPosition.copy(this.position);

        // Корректируем высоту
        if (this.currentRegion) {
            const distance = this.currentRegion.plane.distanceToPoint(this.position);
            this.position.y -= distance * CONFIG.NAVMESH.HEIGHT_CHANGE_FACTOR;
        }

        return this;
    }

    update(delta: number): this {
        super.update(delta);

        // Убедимся, что navMesh доступен
        if (!this.navMesh) {
            console.warn(`Mob ${this.eid}: No navMesh available`);
            return this;
        }

        // Инициализируем при первом update, если еще не инициализированы
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
            console.log(`Mob ${this.eid}: Performing arbitration`);
            this.brain.arbitrate();
        }

        return this;
    }

    atPosition(position: Vector3) {
        const tolerance = CONFIG.BOT.NAVIGATION.ARRIVE_TOLERANCE * CONFIG.BOT.NAVIGATION.ARRIVE_TOLERANCE;
        const distance = this.position.squaredDistanceTo(position);
        return distance <= tolerance;
    }
}
