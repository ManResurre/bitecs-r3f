import {Bone, Object3D, Skeleton, SkinnedMesh} from "three";

// Вспомогательная функция для параллельного обхода двух сцен
function parallelTraverse(a: Object3D, b: Object3D, callback: (a: Object3D, b: Object3D) => void): void {
    callback(a, b);
    for (let i = 0; i < a.children.length; i++) {
        parallelTraverse(a.children[i], b.children[i], callback);
    }
}

export function cloneWithSkinning(source: Object3D): Object3D {
    const cloneLookup = new Map<Object3D, Object3D>();
    const clone = source.clone();

    parallelTraverse(source, clone, (sourceNode, clonedNode) => {
        cloneLookup.set(sourceNode, clonedNode);
    });

    source.traverse(function (sourceMesh) {
        if (!(sourceMesh as SkinnedMesh).isSkinnedMesh) return;

        const sourceBones = (sourceMesh as SkinnedMesh).skeleton.bones;
        const clonedMesh: SkinnedMesh = cloneLookup.get(sourceMesh) as SkinnedMesh;

        if (!clonedMesh) {
            console.warn('Cloned mesh not found for skinned mesh');
            return;
        }

        clonedMesh.skeleton = (sourceMesh as SkinnedMesh).skeleton.clone() as Skeleton;
        clonedMesh.skeleton.bones = sourceBones.map((sourceBone: Object3D) => {
            const clonedBone = cloneLookup.get(sourceBone);
            if (!clonedBone) {
                throw new Error('Required bones are not descendants of the given object.');
            }
            return clonedBone;
        }) as Bone[];

        clonedMesh.bind(clonedMesh.skeleton, (sourceMesh as SkinnedMesh).bindMatrix);
    });

    return clone;
}
