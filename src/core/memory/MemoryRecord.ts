import {Vector3} from "../math/Vector3.ts";

export class MemoryRecord<T> {
    timeBecameVisible = -Infinity;
    timeLastSensed = -Infinity;
    lastSensedPosition = new Vector3();
    visible = false;

    entity: T;

    constructor(entity: T) {
        this.entity = entity;
    }
}
