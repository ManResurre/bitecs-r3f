import {defineSystem} from "bitecs";
import {healthQuery} from "../queries";
import {CustomWorld} from "../../types";
import {HealthComponent} from "../components";


let counter = 0;
export const damageSystem = defineSystem((world: CustomWorld) => {
    const {time} = world;
    const healths = healthQuery(world);

    counter += time.delta;

    if (Math.ceil(counter/1000) > 1) {
        counter = 0;
        if (HealthComponent.value[healths[0]] > 0)
            HealthComponent.value[healths[0]] -= 1;
    }

    return world;
});
