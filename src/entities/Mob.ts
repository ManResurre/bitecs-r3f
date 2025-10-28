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

    currentRegion?: Polygon;
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

    stayInLevel() {
        if (!this.currentRegion) {
            return;
        }

        this.currentPosition.copy(this.position);
        const newRegion = this.navMesh.clampMovement(
            this.currentRegion,
            this.previousPosition,
            this.currentPosition,
            this.position // this is the result vector that gets clamped
        );

        // Защита от потери региона
        if (newRegion) {
            this.currentRegion = newRegion;
        }

        this.previousPosition.copy(this.position);
        const distance = this.currentRegion.plane.distanceToPoint(this.position);
        this.position.y -= distance * CONFIG.NAVMESH.HEIGHT_CHANGE_FACTOR; // smooth transition

        return this;
    }

    update(delta: number): this {
        super.update(delta);

        if (!this.navMesh)
            return this;
        // this.currentTime += delta;
        // this.goalArbitrationRegulator.update(delta);

        // Инициализируем при первом update, когда позиция установлена
        if (!this.initialized && !this.currentRegion) {
            this.currentRegion = this.navMesh.getRegionForPoint(this.position, 1);
            this.initialized = true;
        }
        this.stayInLevel();

        // update goals
        this.brain.execute();
        if (this.goalArbitrationRegulator.ready()) {
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
