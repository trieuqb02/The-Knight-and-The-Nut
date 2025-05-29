import { _decorator, Component, director, Node, tween, Tween, UITransform, Vec3 } from 'cc';
import { MagnetState } from './MagnetPW';
const { ccclass, property } = _decorator;

@ccclass('Coin')
export class Coin extends Component {
    private isMagnetActive = false;
    private playerNode: Node | null = null;
    private moveTween: Tween<Node> | null = null;

    onLoad() {
        director.on('MAGNET_ON', this.onMagnetOn, this);
        director.on('MAGNET_OFF', this.onMagnetOff, this);

        if (MagnetState.isActive && MagnetState.curNode) {
            this.onMagnetOn(MagnetState.curNode);
        }
    }

    onDestroy() {
        director.off('MAGNET_ON', this.onMagnetOn, this);
        director.off('MAGNET_OFF', this.onMagnetOff, this);
        this.stopTween();
    }

    onMagnetOn(playerNode) {
        this.playerNode = playerNode;
        this.isMagnetActive = true;
    }

    onMagnetOff() {
        this.isMagnetActive = false;
        this.stopTween();
    }

    update(dt: number) {
        if (!this.isMagnetActive || !this.playerNode) return;
        
        const distance = Vec3.distance(this.node.worldPosition, this.playerNode.worldPosition);
        const MAGNET_RADIUS = 500;

        if (distance < MAGNET_RADIUS) {
            this.startTweenToPlayer();
        }
    }

    startTweenToPlayer() {
        if (!this.playerNode || this.moveTween) return;

        const worldTarget = this.playerNode.worldPosition.clone();
        const localTarget = new Vec3();
        this.node.parent?.getComponent(UITransform)?.convertToNodeSpaceAR(worldTarget, localTarget);

        this.moveTween = tween(this.node)
            .to(0.5, { position: localTarget }, { easing: 'sineIn' })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }

    stopTween() {
        if (this.moveTween) {
            this.moveTween.stop();
            this.moveTween = null;
        }
    }
}


