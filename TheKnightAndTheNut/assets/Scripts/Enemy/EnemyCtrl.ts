import { _decorator, Collider2D, Component, Node, RigidBody2D, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EnemyCtrl')
export class Enemy extends Component {
    @property
    speed: number = 15; 

    update(deltaTime: number) {
        this.move(deltaTime);
    }

    move(deltaTime){
        this.node.setPosition(
            this.node.position.x - this.speed * deltaTime,
            this.node.position.y,
            this.node.position.z
        );
        this.node.getComponent(Collider2D)?.apply();
    }
}


