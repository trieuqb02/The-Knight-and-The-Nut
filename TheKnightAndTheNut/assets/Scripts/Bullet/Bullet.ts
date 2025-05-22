import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody, RigidBody2D, Vec2 } from 'cc';
import { EnemyCtrl } from '../Enemy/EnemyCtrl';
import { PlayerCtrl } from '../Player/PlayerCtrl';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    private rb: RigidBody2D;

    @property
    private timeLife: number = 2;

    @property
    private speed: number = 10;
    @property
    private dame: number = 1;

    @property
    private ownerTag: string = 'player';

    @property(Vec2)
    private dir: Vec2 = new Vec2();

    protected onLoad(): void {
        this.rb = this.node.getComponent(RigidBody2D);

        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    start() {
        this.move();
        // destroy after timeLife
        this.selfDestroy();
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.ownerTag === 'player') {
            const enemy = otherCollider.node.getComponent(EnemyCtrl);
            if (enemy) {
                enemy.takeDame(this.dame);
                this.scheduleOnce(() => {
                    this.node.destroy();
                }, 0);
            }
        } else if (this.ownerTag === 'enemy') {
            const player = otherCollider.node.getComponent(PlayerCtrl);
            if (player) {
                player.takeDame(this.dame);
                this.scheduleOnce(() => {
                    this.node.destroy();
                }, 0);
            }
        }
    }

    setOwnerTag(tag) {
        this.ownerTag = tag;
    }

    move(){
        // move right with speed 
        //this.rb.linearVelocity = new Vec2(this.speed, 0); 
        this.rb.linearVelocity = this.dir.multiplyScalar(this.speed);
    }

    selfDestroy()
    {
        this.scheduleOnce(()=>{
            if (!this.node || !this.node.isValid) return;
            this.node.destroy();
        }, this.timeLife);
    }
}

