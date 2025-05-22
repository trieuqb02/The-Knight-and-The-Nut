import { _decorator, Collider2D, Component, Node, RigidBody2D, Vec2, Animation, Contact2DType, IPhysics2DContact, PhysicsSystem2D } from 'cc';
import { ColliderGroup } from '../Player/PlayerCtrl';
import { PlayerCtrl } from '../Player/PlayerCtrl';
const { ccclass, property } = _decorator;

@ccclass('EnemyCtrl')
export class EnemyCtrl extends Component {
    @property
    speed: number = 15; 
    @property
    dame: number = 1; 

    @property
    startingHealth: number = 1;
    private curHealth: number;

    private anim: Animation;
    private collider;

    onLoad() {
        this.anim = this.getComponent(Animation);

        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    protected start(): void {
        // init health
        this.curHealth = this.startingHealth;
    }

    update(deltaTime: number) {
        this.move(deltaTime);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // player dead after collide enemy
        if (otherCollider.group === ColliderGroup.PLAYER) {
            const player = otherCollider.node.getComponent(PlayerCtrl);
            if (player) {
                player.takeDame(this.dame); 
            }
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group === ColliderGroup.PLAYER) {

        }
    }

    move(deltaTime){
        this.node.setPosition(
            this.node.position.x - this.speed * deltaTime,
            this.node.position.y,
            this.node.position.z
        );
        //this.node.getComponent(Collider2D)?.apply();
    }

    takeDame(dame)
    {
        if(this.curHealth <= 0) return;
        this.curHealth -= dame;

        if (this.curHealth <= 0)
            this.dead();
    }

    dead()
    {
        PlayerCtrl.Instance.addScore(50);
        
        this.anim.play("mushroomDie");
        this.collider.enabled = false;

        this.anim.once(Animation.EventType.FINISHED, () => {
            this.node.destroy();
        });
    }
}


