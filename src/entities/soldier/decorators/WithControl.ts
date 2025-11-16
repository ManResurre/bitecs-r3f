import {Vector3} from "../../../core/math/Vector3.ts";
import {CrowdAgent} from "recast-navigation";

export interface EntityControl {
    crowdAgent: CrowdAgent;

    update(delta: number): void;
}

export function WithControl<T extends new (...args: any[]) => EntityControl>(Base: T) {
    return class extends Base implements EntityControl {
        private keys = new Set<string>();

        private movementSpeed = 5;

        constructor(...args: any[]) {
            super(...args);

            this.setupEventListeners();
        }

        update(delta: number) {
            super.update(delta);
            const velocity = this.getInputVector();
            this.crowdAgent.requestMoveVelocity(velocity.multiplyScalar(this.movementSpeed));
        }

        private setupEventListeners() {
            if (window) {
                window.addEventListener('keydown', this.handleKeyDown);
                window.addEventListener('keyup', this.handleKeyUp);
            }
        }

        private handleKeyDown = (event: KeyboardEvent) => {
            this.keys.add(event.key.toLowerCase());
        }

        private handleKeyUp = (event: KeyboardEvent) => {
            this.keys.delete(event.key.toLowerCase());
        }

        protected getInputVector(): Vector3 {
            const input = new Vector3();

            if (this.keys.has('w') || this.keys.has('arrowup')) input.z -= 1;
            if (this.keys.has('s') || this.keys.has('arrowdown')) input.z += 1;
            if (this.keys.has('a') || this.keys.has('arrowleft')) input.x -= 1;
            if (this.keys.has('d') || this.keys.has('arrowright')) input.x += 1;

            return input.normalize();
        }
    };
}
