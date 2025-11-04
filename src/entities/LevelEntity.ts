import {GameEntity, BVH, Ray, Vector3, MeshGeometry} from 'yuka';

export class LevelEntity extends GameEntity {
    bvh: BVH;

    constructor(geometry: MeshGeometry) {
        super();
        this.bvh = new BVH().fromMeshGeometry(geometry);
        this.canActivateTrigger = false;
    }

    handleMessage() {
        // do nothing
        return true;
    }


    checkProjectileIntersection(ray: Ray, intersectionPoint: Vector3) {
        return ray.intersectBVH(this.bvh, intersectionPoint);
    }


    lineOfSightTest(ray: Ray, intersectionPoint: Vector3) {
        return ray.intersectBVH(this.bvh, intersectionPoint);
    }
}
