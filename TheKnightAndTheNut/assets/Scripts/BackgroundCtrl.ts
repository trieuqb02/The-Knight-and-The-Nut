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

            // get 3 bg on layer
            for (let bgNode of layer.children) {
                const pos = bgNode.getPosition();
                pos.x -= speed * deltaTime;
                bgNode.setPosition(pos);
            }

            this.recycleOffscreen(layer);
        }
    }

    recycleOffscreen(layer: Node) {
        // get 3 bg
        const bgChilds = layer.children;

        if (bgChilds.length < 2) return;

        const spriteWidth = bgChilds[0].getComponent(UITransform)?.contentSize.width || 0;

        // loop 3 bgs 
        for (let i = 0; i < bgChilds.length; i++) {
            const bg = bgChilds[i];
            const worldPos = bg.getWorldPosition();

            if (worldPos.x + spriteWidth / 2 < -640) { 
                // find node right most
                let rightMostX = bgChilds[0].getWorldPosition().x;
                for (let j = 1; j < bgChilds.length; j++) {
                    const x = bgChilds[j].getWorldPosition().x;
                    if (x > rightMostX) {
                        rightMostX = x;
                    }
                }

                const newX = rightMostX + spriteWidth*2.74/2 + 145;
                const localPos = bg.getPosition();
                bg.setPosition(new Vec3(newX, localPos.y, localPos.z));
            }
        }
    }
}

