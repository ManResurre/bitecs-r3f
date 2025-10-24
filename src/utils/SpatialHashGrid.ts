// utils/spatialHashGrid.ts
export class SpatialHashGrid {
    private grid: Map<string, number[]> = new Map();
    private cellSize: number;

    constructor(cellSize: number = 2) {
        this.cellSize = cellSize;
    }

    private getCellKey(x: number, z: number): string {
        const cellX = Math.floor(x / this.cellSize);
        const cellZ = Math.floor(z / this.cellSize);
        return `${cellX},${cellZ}`;
    }

    clear(): void {
        this.grid.clear();
    }

    insertEntity(eid: number, x: number, z: number): void {
        const cellKey = this.getCellKey(x, z);
        if (!this.grid.has(cellKey)) {
            this.grid.set(cellKey, []);
        }
        this.grid.get(cellKey)!.push(eid);
    }

    getNearbyEntities(x: number, z: number, radius: number): number[] {
        const centerCellX = Math.floor(x / this.cellSize);
        const centerCellZ = Math.floor(z / this.cellSize);
        const searchRadius = Math.ceil(radius / this.cellSize);

        const nearby: number[] = [];
        const seen = new Set<number>();

        for (let dx = -searchRadius; dx <= searchRadius; dx++) {
            for (let dz = -searchRadius; dz <= searchRadius; dz++) {
                const cellKey = `${centerCellX + dx},${centerCellZ + dz}`;
                const entities = this.grid.get(cellKey);
                if (entities) {
                    for (const eid of entities) {
                        if (!seen.has(eid)) {
                            seen.add(eid);
                            nearby.push(eid);
                        }
                    }
                }
            }
        }
        return nearby;
    }
}