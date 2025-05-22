import { _decorator, Component, Animation, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EffectCtrl')
export class EffectCtrl extends Component {
    private anim: Animation;
    protected onLoad(): void {
        this.anim = this.getComponent(Animation);
    }
    start() {
        this.anim.once(Animation.EventType.FINISHED, () => {
            this.node.destroy();
        });
    }
}

