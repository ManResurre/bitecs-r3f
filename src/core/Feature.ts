import {WEAPON_TYPES_BLASTER, WEAPON_TYPES_SHOTGUN, WEAPON_TYPES_ASSAULT_RIFLE} from './Constants.js';
import {MathUtils} from 'yuka';
import {Mob} from "../entities/Mob.ts";
import CONFIG from "./Config.ts";

const result = {distance: Infinity, item: null};


export class Feature {
    static totalWeaponStrength(enemy: Mob) {
        const weaponSystem = enemy.weaponSystem;

        const ammoBlaster = weaponSystem.getRemainingAmmoForWeapon(WEAPON_TYPES_BLASTER);
        const ammoShotgun = weaponSystem.getRemainingAmmoForWeapon(WEAPON_TYPES_SHOTGUN);
        const ammoAssaultRifle = weaponSystem.getRemainingAmmoForWeapon(WEAPON_TYPES_ASSAULT_RIFLE);

        const f1 = ammoBlaster / CONFIG.BLASTER.MAX_AMMO;
        const f2 = ammoShotgun / CONFIG.SHOTGUN.MAX_AMMO;
        const f3 = ammoAssaultRifle / CONFIG.ASSAULT_RIFLE.MAX_AMMO;

        return (f1 + f2 + f3) / 3;
    }

    static individualWeaponStrength(enemy: Mob, weaponType) {
        const weapon = enemy.weaponSystem.getWeapon(weaponType);
        return (weapon) ? (weapon.ammo / weapon.maxAmmo) : 0;
    }

    static health(enemy: Mob) {
        return enemy.health / enemy.maxHealth;
    }

    static distanceToItem(enemy: Mob, itemType) {
        let score = 1;
        enemy.world.getClosestItem(enemy, itemType, result);

        if (result.item) {
            let distance = result.distance;
            distance = MathUtils.clamp(distance, CONFIG.BOT.MIN_ITEM_RANGE, CONFIG.BOT.MAX_ITEM_RANGE);
            score = distance / CONFIG.BOT.MAX_ITEM_RANGE;
        }

        return score;
    }
}
