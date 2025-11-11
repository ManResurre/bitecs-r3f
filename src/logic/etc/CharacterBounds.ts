import {AABB, Vector3, Ray, Matrix4} from 'yuka';
import {Bone, Object3D} from 'three';
import {Mob} from "../../entities/Mob.ts";

interface HitBox {
    aabb: AABB;
    bone: Bone;
    bindMatrix: Matrix4;
    bindMatrixInverse: Matrix4;
}

export class CharacterBounds {
    owner: Mob;
    // the outer and topmost bounding volume. used in the first
    // phase of an intersection test
    _outerHitbox = new AABB();
    _outerHitboxDefinition = new AABB();
    // the inner bounding volumes are assigned to certain bones
    _innerHitboxes: HitBox[] = [];
    // cache that holds the current bone's inverse matrices
    _cache = new Map();

    rayBindSpace = new Ray();

    constructor(owner: Mob) {
        this.owner = owner;
    }

    init(renderComponent: Object3D) {
        this._outerHitboxDefinition.set(new Vector3(-0.5, 0, -0.5), new Vector3(0.5, 1.8, 0.5));
        const hitboxes = this._innerHitboxes;

        // ensure world matrices are up to date
        renderComponent.updateMatrixWorld(true);

        // head and torso
        const headBone = renderComponent.getObjectByName('Armature_mixamorigHead') as Bone;
        const rightArmBone = renderComponent.getObjectByName('Armature_mixamorigRightArm') as Bone;
        const rightForeArmBone = renderComponent.getObjectByName('Armature_mixamorigRightForeArm') as Bone;
        const leftArmBone = renderComponent.getObjectByName('Armature_mixamorigLeftArm') as Bone;
        const leftForeArmBone = renderComponent.getObjectByName('Armature_mixamorigLeftForeArm') as Bone;
        const rightUpLegBone = renderComponent.getObjectByName('Armature_mixamorigRightUpLeg') as Bone;
        const rightLegBone = renderComponent.getObjectByName('Armature_mixamorigRightLeg') as Bone;
        const leftUpLegBone = renderComponent.getObjectByName('Armature_mixamorigLeftUpLeg') as Bone;
        const leftLegBone = renderComponent.getObjectByName('Armature_mixamorigLeftLeg') as Bone;

        if (!headBone ||
            !rightArmBone ||
            !rightForeArmBone ||
            !leftArmBone ||
            !leftForeArmBone ||
            !rightUpLegBone ||
            !rightLegBone ||
            !leftUpLegBone ||
            !leftLegBone
        )
            return;

        const head = new AABB(new Vector3(-0.1, 1.6, -0.1), new Vector3(0.1, 1.8, 0.1));
        let bindMatrix = new Matrix4().copy(headBone.matrixWorld);
        let bindMatrixInverse = new Matrix4().getInverse(bindMatrix);
        hitboxes.push({aabb: head, bone: headBone, bindMatrix: bindMatrix, bindMatrixInverse: bindMatrixInverse});

        const spineBone = renderComponent.getObjectByName('Armature_mixamorigSpine1');
        const spine = new AABB(new Vector3(-0.2, 1, -0.2), new Vector3(0.2, 1.6, 0.2));
        bindMatrix = new Matrix4().copy(spineBone.matrixWorld);
        bindMatrixInverse = new Matrix4().getInverse(bindMatrix);
        hitboxes.push({aabb: spine, bone: spineBone, bindMatrix: bindMatrix, bindMatrixInverse: bindMatrixInverse});

        // arms
        const rightArm = new AABB(new Vector3(-0.4, 1.42, -0.15), new Vector3(-0.2, 1.58, 0.1));
        bindMatrix = new Matrix4().copy(rightArmBone.matrixWorld);
        bindMatrixInverse = new Matrix4().getInverse(bindMatrix);
        hitboxes.push({
            aabb: rightArm,
            bone: rightArmBone,
            bindMatrix: bindMatrix,
            bindMatrixInverse: bindMatrixInverse
        });

        const rightForeArm = new AABB(new Vector3(-0.8, 1.42, -0.15), new Vector3(-0.4, 1.55, 0.05));
        bindMatrix = new Matrix4().copy(rightForeArmBone.matrixWorld);
        bindMatrixInverse = new Matrix4().getInverse(bindMatrix);
        hitboxes.push({aabb: rightForeArm, bone: rightForeArmBone, bindMatrix, bindMatrixInverse: bindMatrixInverse});

        const leftArm = new AABB(new Vector3(0.2, 1.42, -0.15), new Vector3(0.4, 1.58, 0.1));
        bindMatrix = new Matrix4().copy(leftArmBone.matrixWorld);
        bindMatrixInverse = new Matrix4().getInverse(bindMatrix);
        hitboxes.push({aabb: leftArm, bone: leftArmBone, bindMatrix: bindMatrix, bindMatrixInverse: bindMatrixInverse});

        const leftForeArm = new AABB(new Vector3(0.4, 1.42, -0.15), new Vector3(0.8, 1.55, 0.05));
        bindMatrix = new Matrix4().copy(leftForeArmBone.matrixWorld);
        bindMatrixInverse = new Matrix4().getInverse(bindMatrix);
        hitboxes.push({
            aabb: leftForeArm,
            bone: leftForeArmBone,
            bindMatrix: bindMatrix,
            bindMatrixInverse: bindMatrixInverse
        });

        // legs
        const rightUpLeg = new AABB(new Vector3(-0.2, 0.6, -0.15), new Vector3(0, 1, 0.15));
        bindMatrix = new Matrix4().copy(rightUpLegBone.matrixWorld);
        bindMatrixInverse = new Matrix4().getInverse(bindMatrix);
        hitboxes.push({
            aabb: rightUpLeg,
            bone: rightUpLegBone,
            bindMatrix: bindMatrix,
            bindMatrixInverse: bindMatrixInverse
        });

        const rightLeg = new AABB(new Vector3(-0.2, 0, -0.15), new Vector3(0, 0.6, 0.15));
        bindMatrix = new Matrix4().copy(rightLegBone.matrixWorld);
        bindMatrixInverse = new Matrix4().getInverse(bindMatrix);
        hitboxes.push({
            aabb: rightLeg,
            bone: rightLegBone,
            bindMatrix: bindMatrix,
            bindMatrixInverse: bindMatrixInverse
        });

        const leftUpLeg = new AABB(new Vector3(0, 0.6, -0.15), new Vector3(0.2, 1, 0.15));
        bindMatrix = new Matrix4().copy(leftUpLegBone.matrixWorld);
        bindMatrixInverse = new Matrix4().getInverse(bindMatrix);
        hitboxes.push({
            aabb: leftUpLeg,
            bone: leftUpLegBone,
            bindMatrix: bindMatrix,
            bindMatrixInverse: bindMatrixInverse
        });

        const leftLeg = new AABB(new Vector3(0, 0, -0.15), new Vector3(0.2, 0.6, 0.15));
        bindMatrix = new Matrix4().copy(leftLegBone.matrixWorld);
        bindMatrixInverse = new Matrix4().getInverse(bindMatrix);
        hitboxes.push({aabb: leftLeg, bone: leftLegBone, bindMatrix: bindMatrix, bindMatrixInverse: bindMatrixInverse});

        return this;
    }

    update() {
        this._outerHitbox.copy(this._outerHitboxDefinition).applyMatrix4(this.owner.worldMatrix);
        return this;
    }

    getCenter(center: Vector3) {
        return this._outerHitbox.getCenter(center);
    }

    intersectRay(ray: Ray, intersectionPoint: Vector3) {
        // first text outer hitbox
        if (ray.intersectAABB(this._outerHitbox, intersectionPoint)) {
            // now test with inner hitboxes
            const hitboxes = this._innerHitboxes;

            for (let i = 0, l = hitboxes.length; i < l; i++) {
                const hitbox = hitboxes[i];
                const bone = hitbox.bone;

                const inverseBoneMatrix = this._getInverseBoneMatrix(bone);

                // transform the ray from world space to local space of the bone
                this.rayBindSpace.copy(ray).applyMatrix4(inverseBoneMatrix);

                // transform the ray from local space of the bone to its bind space (T-Pose)
                this.rayBindSpace.applyMatrix4(hitbox.bindMatrix);

                // now perform the intersection test
                if (this.rayBindSpace.intersectAABB(hitbox.aabb, intersectionPoint)) {
                    // since the intersection point is in bind space, it's necessary to convert back to world space
                    intersectionPoint.applyMatrix4(hitbox.bindMatrixInverse).applyMatrix4(bone.matrixWorld);
                    return intersectionPoint;
                }
            }
        }

        return null;
    }

    _getInverseBoneMatrix(bone: Bone) {
        const world = this.owner.world;
        const tick = world.time.elapsed;

        // since computing inverse matrices is expensive, do it only once per simulation step
        let entry = this._cache.get(bone);

        if (entry === undefined) {
            entry = {tick: tick, inverseBoneMatrix: new Matrix4().getInverse(bone.matrixWorld)};
            this._cache.set(bone, entry);
        } else {
            if (entry.tick < tick) {
                entry.tick = tick;
                entry.inverseBoneMatrix.getInverse(bone.matrixWorld);
            } else {
                // if (world.debug) {
                //     console.log('DIVE.CharacterBounds: Inverse matrix found in cache for bone.');
                // }
            }
        }

        return entry.inverseBoneMatrix;
    }
}
