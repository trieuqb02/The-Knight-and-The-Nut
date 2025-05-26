import { _decorator, Collider2D, Component, Contact2DType, instantiate, IPhysics2DContact, Node, Prefab, RigidBody, RigidBody2D, UITransform, Vec2 } from 'cc';
import { EnemyCtrl } from '../Enemy/EnemyCtrl';
import { PlayerCtrl } from '../Player/PlayerCtrl';
import { BossCtrl } from '../Enemy/BossCtrl';
import { Entity } from '../Player/Entity';
import { IDamageable } from '../Player/IDamageable';
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
    @property(Prefab)
    private explosionPrefab: Prefab;

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
        //const otherEntity = otherCollider.getComponent(Entity) as IDamageable;
        if (this.ownerTag === 'player') {
            // otherEntity.takeDame(this.dame);
            // this.scheduleOnce(() => {
            //     this.node.destroy();
            // }, 0);
            // this.createEffect();
            const enemy = otherCollider.node.getComponent(EnemyCtrl);
            const boss = otherCollider.node.getComponent(BossCtrl);
            // detect enemy
            if (enemy) {
                enemy.takeDame(this.dame);
                this.scheduleOnce(() => {
                    this.node.destroy();
                }, 0);
                this.createEffect();
            }
            // detect boss
            else if (boss) {
                boss.takeDame(this.dame);
                this.scheduleOnce(() => {
                    this.node.destroy();
                }, 0);
                this.createEffect();
            }
        } else if (this.ownerTag === 'enemy') {
            // console.log("Boss fire " + otherCollider.name);
            // otherEntity.takeDame(this.dame);
            // this.scheduleOnce(() => {
            //     this.node.destroy();
            // }, 0);
            // this.createEffect();
            const player = otherCollider.node.getComponent(PlayerCtrl);
            if (player) {
                player.takeDame(this.dame);
                this.scheduleOnce(() => {
                    this.node.destroy();
                }, 0);
                this.createEffect();
            }
        }
    }

    createEffect(){
        let exp = instantiate(this.explosionPrefab);

        exp.parent = this.node.parent;

        const localPos = exp.parent
            .getComponent(UITransform)
            .convertToNodeSpaceAR(this.node.worldPosition);

        exp.setPosition(localPos);
    }

    setOwnerTag(tag) {
        this.ownerTag = tag;
    }

    move(){
        // move right with speed 
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

