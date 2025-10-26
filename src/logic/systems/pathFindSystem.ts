import {defineSystem} from "bitecs";
import {CustomWorld} from "../../types";
import {NavMesh, Vector3} from "yuka";
import {mobsQuery} from "../queries";
import {AStarPathMovementComponent} from "../components";

const THINK_INTERVAL = 5000;
const MAX_PATH_LENGTH = 100;

function getRandomPosition(navMesh: NavMesh): Vector3 | null {

    // Получаем случайный регион из навмеша
    const randomRegion = navMesh.getRandomRegion();
    if (!randomRegion) {
        console.log('No regions found in navmesh');
        return null;
    }

    // Получаем контур региона
    const contour: Vector3[] = [];
    randomRegion.getContour(contour);

    if (contour.length < 3) {
        console.log('Region contour has insufficient points');
        return null;
    }

    // Вычисляем центр региона как среднее арифметическое всех вершин
    const center = new Vector3();
    contour.forEach(vertex => {
        center.add(vertex);
    });
    center.divideScalar(contour.length);

    return center;
}

function savePathToComponent(eid: number, path: number[][]) {
    // Очищаем предыдущий путь
    for (let i = 0; i < MAX_PATH_LENGTH; i++) {
        AStarPathMovementComponent.pathXs[eid][i] = 0;
        AStarPathMovementComponent.pathYs[eid][i] = 0;
    }

    // Сохраняем новый путь (пропускаем первую точку - это текущая позиция)
    const pathToSave = path.slice(1); // убираем стартовую позицию
    AStarPathMovementComponent.pathLength[eid] = Math.min(pathToSave.length, MAX_PATH_LENGTH);
    AStarPathMovementComponent.pathIndex[eid] = 0;

    for (let i = 0; i < AStarPathMovementComponent.pathLength[eid]; i++) {
        const point = pathToSave[i];
        AStarPathMovementComponent.pathXs[eid][i] = point[0];
        AStarPathMovementComponent.pathYs[eid][i] = point[1];
    }
}

export const pathFindSystem = defineSystem((world: CustomWorld) => {
    if (!world.navMesh) return world;

    const mobs = mobsQuery(world);
    for (const eid of mobs) {
        AStarPathMovementComponent.timeToNextThink[eid] -= world.time.delta;
        if (AStarPathMovementComponent.timeToNextThink[eid] <= 0) {
            AStarPathMovementComponent.timeToNextThink[eid] = THINK_INTERVAL;

            const pos = getRandomPosition(world.navMesh);
            if (!pos) return world;

            const path = world.navMesh.findPath(new Vector3(), pos);
            console.log(path);
        }
    }


    return world;
});
