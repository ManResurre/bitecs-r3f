import {useEffect, useMemo} from "react";
import {Group, Mesh, Object3D, Object3DEventMap, Vector3} from "three";
import {useFBX} from "@react-three/drei";
import {SkeletonUtils} from "three-stdlib";

export interface FbxModelProps {
    url: string,
    onLoadModel?: (fbx: Object3D<Object3DEventMap>) => void,
    position?: Vector3
}

const FbxModel = ({url, onLoadModel, position, ...props}: FbxModelProps) => {
    const fbx: Group = useFBX(url);

    // Используем useMemo для обработки модели сразу после загрузки
    const cloneFbx = useMemo(() => {
        if (!fbx) return null;
        const cloned = SkeletonUtils.clone(fbx);

        // Устанавливаем тени сразу при клонировании
        cloned.traverse((child: Object3D) => {
            if ((child as Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Обновляем матрицы для корректного отображения теней
                child.frustumCulled = false;
            }
        });

        return cloned;
    }, [fbx]);

    useEffect(() => {
        if (!cloneFbx || !onLoadModel) return;
        onLoadModel(cloneFbx);
    }, [cloneFbx, onLoadModel]);

    if (!cloneFbx) return null;

    return (
        <primitive
            object={cloneFbx}
            position={position}
            scale={0.01}
            castShadow
            receiveShadow
            {...props}
        />
    );
};

export default FbxModel;
