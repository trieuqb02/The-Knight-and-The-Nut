import { _decorator, Collider2D, Component, Node, RigidBody2D, Vec2, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EnemyCtrl')
export class EnemyCtrl extends Component {
    @property
    speed: number = 15; 

    @property
    startingHealth: number = 1;

    private anim: Animation;

    private curHealth: number;

    onLoad() {
        this.anim = this.getComponent(Animation);
    }

    protected start(): void {
        this.curHealth = this.startingHealth;
    }

    update(deltaTime: number) {
        this.move(deltaTime);
    }

    move(deltaTime){
        this.node.setPosition(
            this.node.position.x - this.speed * deltaTime,
            this.node.position.y,
            this.node.position.z
        );
        this.node.getComponent(Collider2D)?.apply();
    }

    takeDame(dame)
    {
        this.curHealth -= dame;

        if (this.curHealth <= 0)
            this.dead();
    }

    dead()
    {
        this.anim.play("mushroomDie");

        this.anim.once(Animation.EventType.FINISHED, () => {
            this.node.destroy();
        });

        // emit dead
        // this.scheduleOnce(() => {
        //     this.node.destroy();
        // }, 0);
    }
}


