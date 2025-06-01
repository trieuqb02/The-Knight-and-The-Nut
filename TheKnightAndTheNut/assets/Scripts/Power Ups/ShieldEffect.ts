import { _decorator, Component, director, Node } from 'cc';
import { IEffect } from './IEffect';
import { IShieldable } from './IShieldable';
const { ccclass, property } = _decorator;

@ccclass('ShieldEffect')
export class ShieldEffect implements IEffect {
    name = 'Stun';
    duration: number;
    elapsed = 0;
    private target: IShieldable;

    constructor(duration: number, target: IShieldable) {
        this.duration = duration;
        this.target = target;
    }

    onStart() {
        console.log("Start Shield!");
        // director.emit("SHIELD_ON", this.target);
        this.target.shieldEffect.active = true;
    }

    onEnd() {
        console.log("End Shield!");
        this.target.shieldEffect.active = false;
    }

    update(dt: number) {
        this.elapsed += dt;
        if (this.elapsed >= this.duration) {
            this.onEnd();
            return true; // Effect done
        }
        return false; // Still active
    }
}


