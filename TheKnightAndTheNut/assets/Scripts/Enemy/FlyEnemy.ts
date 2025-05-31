import { _decorator, AudioClip, Node, tween, UIOpacity, Vec3 } from 'cc';
import { EnemyCtrl } from './EnemyCtrl';
import { AudioManager } from '../Audio/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('FlyEnemy')
export class FlyEnemy extends EnemyCtrl {
    @property
    speed: number = 300;
    @property(Node)
    warningLineNode: Node; 

    @property
    private warningTime: number = 2; 
    private hasMoved: boolean = false;

    onLoad() {
        super.onLoad();
        this.showWarningLine();
    }

    update(deltaTime: number) {
        if (this.hasMoved) {
            this.node.setPosition(this.node.position.add(new Vec3(this.speed * deltaTime, 0, 0)));
        }
    }

    showWarningLine() {
        let opacity = this.warningLineNode.getComponent(UIOpacity);
        this.scheduleOnce(()=>{
            tween(opacity)
            .repeatForever(
                tween()
                .to(0.1, { opacity: 0 })
                .to(0.1, { opacity: 255 })
            )
            .start();
        }, this.warningTime - 1);

        this.scheduleOnce(()=>{
            const flySound = AudioManager.instance.flySound;
            AudioManager.instance.playSFX(flySound);
            tween(opacity).stop();
            this.hasMoved = true;
            this.warningLineNode.active = false;
        }, this.warningTime);
    }

}

