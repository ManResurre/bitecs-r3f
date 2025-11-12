import {IWorld} from "bitecs";
import {Crowd, init, NavMeshQuery} from "recast-navigation";
import {Group, Mesh} from "three";
import {threeToSoloNavMesh} from "@recast-navigation/three";
import {NavMesh} from "@recast-navigation/core/dist/nav-mesh";
import {Soldier} from "./Soldier.ts";

export class World implements IWorld {
    time: {
        delta: number;
        elapsed: number;
        then: number;
    } = {delta: 0, elapsed: 0, then: performance.now()};
    size: {
        width: number;
        height: number;
    } = {width: 0, height: 0};

    entityManager = new Map();

    private isInit = false;

    public crowd?: Crowd;
    public navMesh?: NavMesh;
    public navMeshQuery?: NavMeshQuery

    async initNav(scene: Group) {
        if (this.isInit == true)
            return;
        this.isInit = true;
        await init();

        const mesh = scene.getObjectByName('level') as Mesh;
        const {success, navMesh} = threeToSoloNavMesh([mesh], {
            cellSize: 0.3,
            cellHeight: 0.2,
            agentHeight: 1.8,
            agentRadius: 0.4,
            agentMaxClimb: 0.9,
            agentMaxSlope: 45,
        });

        if (!success) {
            console.error('Failed to generate NavMesh');
            return;
        }

        const maxAgents = 200;
        const maxAgentRadius = 0.6;
        const crowd = new Crowd(navMesh, {maxAgents, maxAgentRadius});
        this.navMesh = navMesh;
        this.crowd = crowd;
        this.navMeshQuery = new NavMeshQuery(navMesh);
    }

    getSoldier(id: number): Soldier {
        let soldier: Soldier = this.entityManager.get(id);
        if (soldier)
            return soldier;

        soldier = new Soldier(this, id);

        this.entityManager.set(id, soldier);

        return soldier;
    }
}
