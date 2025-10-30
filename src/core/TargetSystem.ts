import {Mob} from "../entities/Mob.ts";
import {MemoryRecord} from "yuka";

const visibleRecords: MemoryRecord[] = [];
const invisibleRecords: MemoryRecord[] = [];


export class TargetSystem {
    owner: Mob;
    private currentRecord: MemoryRecord | null = null;

    constructor(owner: Mob) {
        this.owner = owner; // enemy
    }

    update() {
        const records: MemoryRecord[] = this.owner.memoryRecords;
        this.currentRecord = null;
        visibleRecords.length = 0;
        invisibleRecords.length = 0;

        // sort records according to their visibility
        for (let i = 0, l = records.length; i < l; i++) {
            const record = records[i];
            if (record.visible) {
                visibleRecords.push(record);
            } else {
                invisibleRecords.push(record);
            }
        }

        // record selection
        if (visibleRecords.length > 0) {
            // if there are visible records, select the closest one
            let minDistance = Infinity;
            for (let i = 0, l = visibleRecords.length; i < l; i++) {
                const record = visibleRecords[i];
                const distance = this.owner.position.squaredDistanceTo(record.lastSensedPosition);
                if (distance < minDistance) {
                    minDistance = distance;
                    this.currentRecord = record;
                }
            }
        } else if (invisibleRecords.length > 0) {
            // if there are invisible records, select the one that was last sensed
            let maxTimeLastSensed = -Infinity;
            for (let i = 0, l = invisibleRecords.length; i < l; i++) {
                const record = invisibleRecords[i];
                if (record.timeLastSensed > maxTimeLastSensed) {
                    maxTimeLastSensed = record.timeLastSensed;
                    this.currentRecord = record;
                }
            }
        }
        return this;
    }

    reset() {
        this.currentRecord = null;
        return this;
    }

    isTargetShootable() {
        return (this.currentRecord !== null) ? this.currentRecord.visible : false;
    }

    getLastSensedPosition() {
        return (this.currentRecord !== null) ? this.currentRecord.lastSensedPosition : null;
    }

    getTimeLastSensed() {
        return (this.currentRecord !== null) ? this.currentRecord.timeLastSensed : -1;
    }

    getTimeBecameVisible() {
        return (this.currentRecord !== null) ? this.currentRecord.timeBecameVisible : -1;
    }

    getTarget() {
        return (this.currentRecord !== null) ? this.currentRecord.entity : null;
    }

    hasTarget() {
        return this.currentRecord !== null;
    }
}
