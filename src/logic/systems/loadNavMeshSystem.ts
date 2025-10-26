import {defineSystem} from "bitecs";
import {CustomWorld} from "../../types";
import {CostTable, NavMeshLoader} from "yuka";
import {LoadingManager} from "three";

async function loadData(world: CustomWorld) {
    const loader = new NavMeshLoader();
    const loadingManager = new LoadingManager();

    loadingManager.itemStart('navmesh');
    const navMesh = await loader.load('./navmeshes/navmesh.glb');
    loadingManager.itemEnd('navmesh');

    loadingManager.itemStart('costTable');
    const costTable = new CostTable().fromJSON(await (await fetch('./navmeshes/costTable.json')).json());
    loadingManager.itemEnd('costTable');

    world.navMesh = navMesh;
    world.costTable = costTable;
}

export const loadNavMeshSystem = defineSystem((world: CustomWorld) => {
    loadData(world)

    return world;
})
