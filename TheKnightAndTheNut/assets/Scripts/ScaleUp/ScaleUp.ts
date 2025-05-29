import { _decorator, Component, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScaleUp')
export class ScaleUp extends Component {
    start() {
        this.node.setScale(new Vec3(0.1, 0.1, 0.1));
        tween(this.node)
            .to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' })
            .start();
    }

    onEnable() {
        this.node.setScale(new Vec3(0.1, 0.1, 0.1));
        tween(this.node)
            .to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' })
            .start();
    }
}

