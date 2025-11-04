import {Mob} from "../entities/Mob.ts";
import {MemoryRecord} from "yuka";


export class TargetSystem {
    owner: Mob;

    visibleRecords: MemoryRecord[] = [];
    invisibleRecords: MemoryRecord[] = [];

    private currentRecord: MemoryRecord | null = null;

    constructor(owner: Mob) {
        this.owner = owner; // enemy
    }

    update() {
        const records: MemoryRecord[] = this.owner.memoryRecords;
        this.currentRecord = null;
        this.visibleRecords.length = 0;
        this.invisibleRecords.length = 0;

        // sort records according to their visibility
        for (const record of records) {
            if (record.visible) {
                this.visibleRecords.push(record);
            } else {
                this.invisibleRecords.push(record);
            }
        }

        // record selection
        if (this.visibleRecords.length > 0) {
            // if there are visible records, select the closest one
            let minDistance = Infinity;
            for (const record of this.visibleRecords) {
                const distance = this.owner.position.squaredDistanceTo(record.lastSensedPosition);
                if (distance < minDistance) {
                    minDistance = distance;
                    this.currentRecord = record;
                }
            }
        } else if (this.invisibleRecords.length > 0) {
            // if there are invisible records, select the one that was last sensed
            let maxTimeLastSensed = -Infinity;
            for (const record of this.invisibleRecords) {
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
