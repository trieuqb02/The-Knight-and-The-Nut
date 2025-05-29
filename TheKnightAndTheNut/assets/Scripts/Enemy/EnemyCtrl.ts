import { _decorator, } from 'cc';
import { PlayerCtrl } from '../Player/PlayerCtrl';
import { Entity } from '../Player/Entity';
const { ccclass, property } = _decorator;

@ccclass('EnemyCtrl')
export class EnemyCtrl extends Entity {
    @property
    dirX: number = 1; 

    takeDame(dame){
        super.takeDame(dame);
    }

    dead()
    {
        PlayerCtrl.Instance.addScore(50);
        super.dead();
    }
}


