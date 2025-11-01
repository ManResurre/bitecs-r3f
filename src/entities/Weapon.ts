import {FuzzyModule, GameEntity, MathUtils, Vector3} from 'yuka';
import {
    WEAPON_STATUS_READY,
    WEAPON_STATUS_UNREADY,
    WEAPON_STATUS_EQUIP,
    WEAPON_STATUS_HIDE
} from '../core/Constants.js';
import {Mob} from "./Mob.ts";
import {Sprite} from "three";

export abstract class Weapon extends GameEntity {
    owner: Mob;
    type: number | null = null;
    status = WEAPON_STATUS_UNREADY;
    // use to restore the state after a weapon change
    previousState = WEAPON_STATUS_READY;
    // ammo related stuff
    roundsLeft = 0;
    roundsPerClip = 0;
    ammo = 0;
    maxAmmo = 0;

    // times are in seconds
    currentTime = 0;
    shotTime = Infinity;
    reloadTime = Infinity;
    equipTime = Infinity;
    hideTime = Infinity;

    endTimeShot = Infinity;
    endTimeReload = Infinity;
    endTimeEquip = Infinity;
    endTimeHide = Infinity;
    endTimeMuzzleFire = Infinity;

    // used for weapon selection
    abstract fuzzyModule: FuzzyModule;

    // render specific properties
    abstract muzzle: Sprite;
    audios = null;
    mixer = null;
    animations = null;

    constructor(owner: Mob) {
        super();
        this.owner = owner;
        this.canActivateTrigger = false;
    }

    addRounds(rounds:number) {
        this.ammo = MathUtils.clamp(this.ammo + rounds, 0, this.maxAmmo);
        return this;
    }

    getRemainingRounds() {
        return this.ammo;
    }

    abstract getDesirability(distance: number): number

    equip() {
        this.status = WEAPON_STATUS_EQUIP;
        this.endTimeEquip = this.currentTime + this.equipTime;

        // if (this.mixer) {
        //     let animation = this.animations.get('hide');
        //     animation.stop();
        //
        //     animation = this.animations.get('equip');
        //     animation.stop();
        //     animation.play();
        //
        // }
        //
        // if (this.owner.isPlayer) {
        //     this.owner.world.uiManager.updateAmmoStatus();
        // }

        return this;
    }

    hide() {
        this.previousState = this.status;
        this.status = WEAPON_STATUS_HIDE;
        this.endTimeHide = this.currentTime + this.hideTime;

        // if (this.mixer) {
        //     const animation = this.animations.get('hide');
        //     animation.stop();
        //     animation.play();
        // }

        return this;
    }

    reload() {
    }

    abstract shoot(targetPosition: Vector3): this;

    update(delta: number) {
        this.currentTime += delta;

        if (this.currentTime >= this.endTimeEquip) {
            this.status = this.previousState; // restore previous state
            this.endTimeEquip = Infinity;
        }

        if (this.currentTime >= this.endTimeHide) {
            this.status = WEAPON_STATUS_UNREADY;
            this.endTimeHide = Infinity;
        }

        // update animations
        // if (this.mixer) {
        //     this.mixer.update(delta);
        // }

        return this;
    }
}
