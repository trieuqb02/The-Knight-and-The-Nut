import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { ColliderGroup, PlayerCtrl } from '../Player/PlayerCtrl';
const { ccclass, property } = _decorator;

@ccclass('Collectible')
export class Collectible extends Component {
	private amount: number = 1;

    protected onLoad(): void {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group === ColliderGroup.PLAYER) {
            const player = otherCollider.node.getComponent(PlayerCtrl);
            if (player) {
                this.collect(player);
            }
        }
    }

    collect(player){
        // play sound
        // effect
        player.collect(this.amount);
        // destroy after collide
        this.selfDestroy();
    }

    selfDestroy()
    {
        this.scheduleOnce(()=>{
            if (!this.node || !this.node.isValid) return;
            this.node.destroy();
        }, 0);
    }
}

