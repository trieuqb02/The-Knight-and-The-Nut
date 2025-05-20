import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Move')
export class Move extends Component {
    @property
    speed: number = 100;

    update(deltaTime: number) {
        this.move(deltaTime);
    }

    move(deltaTime){
        this.node.setPosition(
            this.node.position.x - this.speed * deltaTime,
            this.node.position.y,
            this.node.position.z
        );
    }
}

