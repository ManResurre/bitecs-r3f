import {GameEntity, Polygon, Vector3} from 'yuka';
import {HEALTH_PACK} from "../core/Constants.ts";
import {CustomWorld} from "../types";

export class HealthPackEntity extends GameEntity {
    // private audio = null;
    eid: number;
    currentRegion: Polygon | null = null;
    type = HEALTH_PACK;
    world: CustomWorld;

    respawnTimer = 30; // 30 секунд

    constructor(eid: number, name: string, world: CustomWorld) {
        super();
        this.canActivateTrigger = false;
        this.eid = eid;
        this.name = name;
        this.world = world;
    }

    setPosition(position: Vector3) {
        this.position = position;
        if (this.world.navMesh) {
            this.currentRegion = this.world.navMesh.getRegionForPoint(this.position, 4);

            if (this.currentRegion) {
                this.position.copy(this.currentRegion.centroid);
            }
        }
    }

    setActive(value: boolean) {
        this.active = value;
    }

    update(delta: number) {
        super.update(delta);

        return this;
    }

}

