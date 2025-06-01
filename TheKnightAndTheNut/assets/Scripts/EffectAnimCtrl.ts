import { _decorator, Component, Animation, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EffectAnimCtrl')
export class EffectAnimCtrl extends Component {
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

