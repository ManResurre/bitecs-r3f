import {Vision} from "../../../core/Vision.ts";
import {Regulator} from "../../../core/Regulator.ts";
import {World} from "../../World.ts";


export interface EntityVision {
    vision:Vision;
    visionRegulator:Regulator;
}

export function WithVision<T extends new (...args: any[]) => EntityVision>(Base: T) {
    return class extends Base implements EntityVision {
        vision: Vision;
        visionRegulator = new Regulator(2); // 2 раза/сек = каждые 30 кадров

        constructor(...args: any[]) {
            super(...args);
            const world = args[0] as World;
            this.vision = new Vision(world.navMesh!);
        }
    };
}
