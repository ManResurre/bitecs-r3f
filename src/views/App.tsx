import {Canvas} from "@react-three/fiber";
import {Outlet} from "@tanstack/react-router";

import "./App.css";
import {Loader} from "@react-three/drei";

function App() {
    return <>
        <Canvas gl={{antialias: false, stencil: false}} shadows camera={{position: [0, 5, 0], fov: 80}}>
            <Outlet/>
        </Canvas>
        <Loader/>
    </>
}

export default App;
