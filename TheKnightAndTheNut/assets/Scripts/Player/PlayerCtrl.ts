import { _decorator, Component, EventKeyboard, Input, input, Animation, KeyCode, Node, Collider2D, IPhysics2DContact, Contact2DType, PhysicsGroup } from 'cc';
const { ccclass, property } = _decorator;

enum ColliderGroup {
    DEFAULT = 1 << 0,
    PLAYER = 1 << 1,
    ENEMY = 1 << 2,
}

@ccclass('PlayerCtrl')
export class PlayerCtrl extends Component {
    private isReverse: boolean = false;
    private anim: Animation;

    onLoad(){
        this.anim = this.getComponent(Animation);

        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    update(deltaTime: number) {
        
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // player dead after collide enemy
        if (otherCollider.group === ColliderGroup.ENEMY) {
            this.dead();
        }
    }

    onKeyDown(event: EventKeyboard){
        if(event.keyCode == KeyCode.SPACE){
            this.reverse();
        }
        if (event.keyCode === KeyCode.KEY_A) { 
            this.hurt();
        }
        if (event.keyCode === KeyCode.KEY_D) { 
            this.dead();
        }
    }

    dead(){
        this.anim.play("pinkDead");
    }

    hurt(){
        this.anim.play("pinkHurt");

        // play run anim after hurt anim
        this.anim.once(Animation.EventType.FINISHED, () => {
            this.anim.play("pinkRun");
        });
    }

    reverse(){
        this.isReverse = !this.isReverse;
        this.node.setScale(this.node.scale.x, -this.node.scale.y, this.node.scale.z);
    }
}


