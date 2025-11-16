import {Npc} from "./Npc.ts";
import {WithAnimation} from "./decorators/WithAnimation.ts";
import {WithControl} from "./decorators/WithControl.ts";
import {Vector3} from "../../core/math/Vector3.ts";


@WithAnimation
@WithControl
export class PlayerEntity extends Npc {
    mousePosition?: Vector3;

    update(delta: number) {
        super.update(delta);

        if (this.mousePosition)
            this.rotateTo(this.mousePosition)
    }

    setMousePosition(pos: Vector3) {
        this.mousePosition = new Vector3().set(pos.x, this.position.y, pos.z);
    }
}
