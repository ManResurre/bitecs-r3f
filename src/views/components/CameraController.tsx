import {useThree} from '@react-three/fiber';
import {useControls} from 'leva';
import React, {useEffect} from "react";

const CameraController = () => {
    const {camera} = useThree();

    const {position, lookAt, zoom} = useControls('Camera', {
        position: {value: [5, 7, 8], min: -10, max: 10},
        lookAt: {value: [0, 0, 0], min: -10, max: 10},
        zoom: {value: 0.9, min: 0, max: 1}
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        camera.zoom = zoom;
        camera.position.set(...position);
        camera.lookAt(...lookAt);
        camera.updateProjectionMatrix();
    }, [camera, position, lookAt, zoom]);

    return null;
};

export default React.memo(CameraController);
