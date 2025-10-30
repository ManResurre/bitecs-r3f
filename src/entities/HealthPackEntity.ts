import {GameEntity, Polygon} from 'yuka';
import {HEALTH_PACK} from "../core/Constants.ts";
import {CustomWorld} from "../types";


export class HealthPackEntity extends GameEntity {
    // private audio = null;

    eid: number;
    currentRegion: Polygon | null = null;
    type = HEALTH_PACK;
    world: CustomWorld;

    constructor(eid: number, name: string, world: CustomWorld) {
        super();
        this.canActivateTrigger = false;
        this.eid = eid;
        this.name = name;
        this.world = world;
        if (this.world.navMesh)
            this.currentRegion = this.world.navMesh.getRegionForPoint(this.position, 4);
    }
}

