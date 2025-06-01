import { _decorator, director, UIOpacity } from 'cc';
import { PowerUp } from './PowerUp';
import { ShieldEffect } from './ShieldEffect';
const { ccclass, property } = _decorator;

@ccclass('ShieldPW')
export class ShieldPW extends PowerUp {
    @property
    private duration: number = 5;
    pwUpActive(target) {
        target.addEffect(new ShieldEffect(this.duration, target));
    }
}

