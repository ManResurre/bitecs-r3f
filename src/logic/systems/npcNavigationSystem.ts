import {World} from "../../entities/World.ts";
import {mobsQuery} from "../queries";

export const npcNavigationSystem = (world: World) => {
    if (!world.crowd) {
        return;
    }

    world.crowd.update(world.time.delta);


    // for (const eid of mobIds) {
    //     const crowdAgent = world.crowd.getAgent(MobComponent.crowdId[eid]);
    //     // console.log(crowdAgent?.position());
    //
    // }
    return world;
};
