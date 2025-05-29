import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BackgroundCtrl')
export class BackgroundCtrl extends Component {
    @property([Node])
    layers: Node[] = [];

    @property([Number])
    speeds: number[] = [];

    update(deltaTime: number) {
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const speed = this.speeds[i] ?? 0;

            for (let bgNode of layer.children) {
                const pos = bgNode.getPosition();
                pos.x -= speed * deltaTime;
                bgNode.setPosition(pos);
            }

            this.recycleOffscreen(layer);
        }
    }

    recycleOffscreen(layer: Node) {
        const children = layer.children;

        if (children.length < 2) return;

        const spriteWidth = children[0].getComponent(UITransform)?.contentSize.width || 0;

        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            const worldPos = node.getWorldPosition();

            if (worldPos.x + spriteWidth / 2 < -640) { 
                // find node right most
                let rightMostX = children[0].getWorldPosition().x;
                for (let j = 1; j < children.length; j++) {
                    const x = children[j].getWorldPosition().x;
                    if (x > rightMostX) {
                        rightMostX = x;
                    }
                }

                const newX = rightMostX + spriteWidth*2.74/2 + 145;
                const localPos = node.getPosition();
                node.setPosition(new Vec3(newX, localPos.y, localPos.z));
            }
        }
    }
}

