import { _decorator, Component, Node, Animation, Contact2DType, Collider2D, IPhysics2DContact } from 'cc';
import { IDamageable } from './IDamageable';
import { ColliderGroup } from '../ColliderGroup';
const { ccclass, property } = _decorator;

@ccclass('Entity')
export class Entity extends Component implements IDamageable {
    @property
    startingHealth: number = 3;
    private _curHealth: number;
    @property
    bodyDame: number = 1;

    private _isDead: boolean = false;
    private _anim: Animation;
    private _collider;

    get curHealth(){ return this._curHealth; }
    set curHealth(value) { this._curHealth = Math.max(0, value); }

    get isDead(){ return this._isDead; }
    set isDead(value) { this._isDead = value; }

    get anim(){ return this._anim; }
    set anim(value) { this._anim = value; }

    get collider(){ return this._collider; }
    set collider(value) { this._collider = value; }

    protected onLoad(): void {
        this.node.setSiblingIndex(10);
        this._anim = this.getComponent(Animation);

        // init health
        this.curHealth = this.startingHealth;

        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const otherEntity = otherCollider.getComponent(Entity) as IDamageable;
        if (otherEntity && 'takeDame' in otherEntity) {
            otherEntity.takeDame(this.bodyDame);
        }
    }

    dead(){
        this.isDead = true;
        this.anim.play("dead");
        this.collider.enabled = false;
        // disable detect
         this.anim.once(Animation.EventType.FINISHED, () => {
            this.node.destroy();
        });
    }

    hurt(){
        this.anim.play("hurt");

        // play run anim after hurt anim
        this.anim.once(Animation.EventType.FINISHED, () => {
            this.anim.play("run");
        });
    }

    takeDame(dame){
        console.log(this.node.name + "call take dame");
        this.curHealth -= dame;

        if (this.curHealth <= 0){   
            this.dead();
            return;
        }
        this.hurt();
    }
}

