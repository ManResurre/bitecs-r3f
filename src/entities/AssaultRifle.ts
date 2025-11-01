import {FuzzyModule, Vector3} from 'yuka';
import {Weapon} from './Weapon.js';
import {
    WEAPON_STATUS_READY,
    WEAPON_STATUS_SHOT,
    WEAPON_STATUS_RELOAD,
    WEAPON_STATUS_EMPTY,
    WEAPON_STATUS_OUT_OF_AMMO,
    WEAPON_TYPES_ASSAULT_RIFLE
} from '../core/Constants.js';
import CONFIG from "../core/Config.ts";
import {Mob} from "./Mob.ts";

const spread = new Vector3();

export class AssaultRifle extends Weapon {
    type = WEAPON_TYPES_ASSAULT_RIFLE;

    // common weapon properties
    roundsLeft = CONFIG.ASSAULT_RIFLE.ROUNDS_LEFT;
    roundsPerClip = CONFIG.ASSAULT_RIFLE.ROUNDS_PER_CLIP;
    ammo = CONFIG.ASSAULT_RIFLE.AMMO;
    maxAmmo = CONFIG.ASSAULT_RIFLE.MAX_AMMO;

    shotTime = CONFIG.ASSAULT_RIFLE.SHOT_TIME;
    reloadTime = CONFIG.ASSAULT_RIFLE.RELOAD_TIME;
    equipTime = CONFIG.ASSAULT_RIFLE.EQUIP_TIME;
    hideTime = CONFIG.ASSAULT_RIFLE.HIDE_TIME;
    muzzleFireTime = CONFIG.ASSAULT_RIFLE.MUZZLE_TIME;

    fuzzyModule = new FuzzyModule();

    constructor(owner: Mob) {
        super(owner);
    }

    update(delta: number) {
        super.update(delta);

        // check reload
        if (this.currentTime >= this.endTimeReload) {
            const toReload = this.roundsPerClip - this.roundsLeft;
            if (this.ammo >= toReload) {
                this.roundsLeft = this.roundsPerClip;
                this.ammo -= toReload;
            } else {
                this.roundsLeft += this.ammo;
                this.ammo = 0;
            }

            this.status = WEAPON_STATUS_READY;
            this.endTimeReload = Infinity;
        }

        // check muzzle fire
        if (this.currentTime >= this.endTimeMuzzleFire) {
            this.muzzle.visible = false;
            this.endTimeMuzzleFire = Infinity;
        }

        // check shoot
        if (this.currentTime >= this.endTimeShot) {
            if (this.roundsLeft === 0) {
                if (this.ammo === 0) {
                    this.status = WEAPON_STATUS_OUT_OF_AMMO;
                } else {
                    this.status = WEAPON_STATUS_EMPTY;
                }
            } else {
                this.status = WEAPON_STATUS_READY;
            }
            this.endTimeShot = Infinity;
        }
        return this;
    }

    reload() {
        this.status = WEAPON_STATUS_RELOAD;

        // audio
        // const audio = this.audios.get('reload');
        // if (audio.isPlaying === true) audio.stop();
        // audio.play();

        // animation
        // if (this.mixer) {
        //     const animation = this.animations.get('reload');
        //     animation.stop();
        //     animation.play();
        // }

        this.endTimeReload = this.currentTime + this.reloadTime;
        return this;
    }

    shoot(targetPosition: Vector3) {
        this.status = WEAPON_STATUS_SHOT;
        console.log(targetPosition);
        // audio
        // const audio = this.audios.get('shot');
        // if (audio.isPlaying === true) audio.stop();
        // audio.play();

        // animation
        // if (this.mixer) {
        //     const animation = this.animations.get('shot');
        //     animation.stop();
        //     animation.play();
        // }

        // muzzle fire
        // this.muzzle.visible = true;
        // this.muzzle.material.rotation = Math.random() * Math.PI;

        // this.endTimeMuzzleFire = this.currentTime + this.muzzleFireTime;

        // create bullet
        // const ray = new Ray();
        // this.getWorldPosition(ray.origin);
        // ray.direction.subVectors(targetPosition, ray.origin).normalize();
        //
        // // add spread
        // spread.x = (1 - Math.random() * 2) * 0.01;
        // spread.y = (1 - Math.random() * 2) * 0.01;
        // spread.z = (1 - Math.random() * 2) * 0.01;
        //
        // ray.direction.add(spread).normalize();

        // add bullet to world
        // this.owner.world.addBullet(this.owner, ray);

        // adjust ammo
        // this.roundsLeft--;
        // this.endTimeShot = this.currentTime + this.shotTime;

        return this;
    }

    getDesirability(distance: number) {
        if (!this.fuzzyModule)
            return 0;

        this.fuzzyModule.fuzzify('distanceToTarget', distance);
        this.fuzzyModule.fuzzify('ammoStatus', this.roundsLeft);

        return this.fuzzyModule.defuzzify('desirability') / 100;
    }

    initAnimations() {

        // const assetManager = this.owner.world.assetManager;
        //
        // const mixer = new AnimationMixer(this);
        // const animations = new Map();
        //
        // const shotClip = assetManager.animations.get('assaultRifle_shot');
        // const reloadClip = assetManager.animations.get('assaultRifle_reload');
        // const hideClip = assetManager.animations.get('assaultRifle_hide');
        // const equipClip = assetManager.animations.get('assaultRifle_equip');
        //
        // const shotAction = mixer.clipAction(shotClip);
        // shotAction.loop = LoopOnce;
        //
        // const reloadAction = mixer.clipAction(reloadClip);
        // reloadAction.loop = LoopOnce;
        //
        // const hideAction = mixer.clipAction(hideClip);
        // hideAction.loop = LoopOnce;
        // hideAction.clampWhenFinished = true;
        //
        // const equipAction = mixer.clipAction(equipClip);
        // equipAction.loop = LoopOnce;
        //
        // animations.set('shot', shotAction);
        // animations.set('reload', reloadAction);
        // animations.set('hide', hideAction);
        // animations.set('equip', equipAction);
        //
        // this.animations = animations;
        // this.mixer = mixer;
        //
        // return this;

    }

}
