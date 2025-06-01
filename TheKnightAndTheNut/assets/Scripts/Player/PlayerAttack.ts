import { _decorator, Component, EventKeyboard, game, Input, input, instantiate, KeyCode, Node, Prefab, UITransform } from 'cc';
import { PlayerCtrl } from './PlayerCtrl';
const { ccclass, property } = _decorator;

@ccclass('PlayerAttack')
export class PlayerAttack extends Component {
    @property(Prefab)
    private bulletPrefab: Prefab;
    @property(Node)
    private fireOrigin: Node;
    @property(Node)
    private bulletSpawn: Node;
    private nextTimeToFire: number = 0;
    @property
    private fireRate: number;

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event: EventKeyboard){
        if(event.keyCode == KeyCode.KEY_S){
            if(this.checkFireRate())
                this.fire();
        }
    }

    fire(){
        PlayerCtrl.Instance.attack();
        // call instanceBullet() in event aniomation
    }

    instanceBullet(){
        let bullet = instantiate(this.bulletPrefab);
        bullet.parent = this.bulletSpawn;

        // convert fireOrigin to local of bulletSpawn
        let localPos = this.bulletSpawn
            .getComponent(UITransform)
            .convertToNodeSpaceAR(this.fireOrigin.worldPosition);

        bullet.setPosition(localPos);
    }

    checkFireRate(){
        // covert ms to s
        const currentTime = game.totalTime / 1000;

        if (currentTime >= this.nextTimeToFire) {
            this.nextTimeToFire = currentTime + (1 / this.fireRate);
            return true;
        }
        return false;
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
}

