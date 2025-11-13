import {World} from "./World.ts";
import {MemorySystem} from "../core/memory/MemorySystem.ts";
import {Vector3} from "../core/math/Vector3.ts";

export abstract class GameEntity {
    id: number;
    world: World;

    currentTime = 0;

    abstract memorySystem: MemorySystem<GameEntity>;

    abstract position: Vector3;

    protected constructor(world: World, id: number) {
        this.world = world;
        this.id = id;
    }
}
