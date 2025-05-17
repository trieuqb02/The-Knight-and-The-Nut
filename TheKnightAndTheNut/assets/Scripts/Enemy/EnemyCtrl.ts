import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EnemyCtrl')
export class Enemy extends Component {
    @property
    speed: number = 15; 


    update(deltaTime: number) {
        this.node.setPosition(
            this.node.position.x - this.speed * deltaTime,
            this.node.position.y,
            this.node.position.z
        );
    }
}


