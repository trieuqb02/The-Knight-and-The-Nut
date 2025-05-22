import { _decorator, Component, instantiate, math, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MoveBG')
export class MoveBG extends Component {
    @property
    moveSpeed: number = 100;

    @property
    triggerX: number = -30;

    @property
    offsetX: number = 960; 

    private hasSpawned: boolean = false;

    protected onLoad(): void {
        this.node.getComponent(UITransform).priority = -10;
    }

    update(deltaTime: number) {
        const pos = this.node.getPosition();
        this.node.setPosition(new Vec3(pos.x - this.moveSpeed * deltaTime, pos.y, pos.z));

        if (!this.hasSpawned && pos.x < this.triggerX) {
            const newNode = instantiate(this.node);
            newNode.setParent(this.node.parent);
            newNode.setPosition(new Vec3(pos.x + this.offsetX, pos.y, pos.z));
            newNode.getComponent(MoveBG).hasSpawned = false; 
            this.hasSpawned = true; 
        }
    }
}


