import { _decorator, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BossCtrl')
export class BossCtrl extends Component {
    @property(Prefab)
    private bulletPrefab: Prefab;
    @property(Node)
    private fireOrigin: Node;
    @property(Node)
    private bulletParent: Node;

    start() {

    }

    update(deltaTime: number) {
        
    }

    fire(){
        // play animation attack
        // call instanceBullet() in event aniomation

    }

    // instanceBullet(){
    //     let bullet = instantiate(this.bulletPrefab);
    //     bullet.parent = this.bulletSpawn;

    //     // convert fireOrigin to local of bulletSpawn
    //     let localPos = this.bulletSpawn
    //         .getComponent(UITransform)
    //         .convertToNodeSpaceAR(this.fireOrigin.worldPosition);

    //     bullet.setPosition(localPos);
    // }
}

