import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { PlayerCtrl } from '../Player/PlayerCtrl';
import { ColliderGroup } from '../ColliderGroup';
const { ccclass, property } = _decorator;

@ccclass('Collectible')
export class Collectible extends Component {
	private amount: number = 1;
    private collider;

    protected onLoad(): void {
        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
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
        this.collider.enabled = false;
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

