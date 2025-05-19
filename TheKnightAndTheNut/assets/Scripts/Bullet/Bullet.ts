import { _decorator, Component, Node, RigidBody, RigidBody2D, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    private rb: RigidBody2D;
    private timmer: number = 0;

    @property
    private timeLife: number = 2;

    @property
    private speed: number = 10;


    protected onLoad(): void {
        this.rb = this.node.getComponent(RigidBody2D);
    }

    start() {
        this.move();
        // destroy after timeLife
        this.selfDestroy();
    }

    update(deltaTime: number) {
        
    }

    move(){
        // move right with speed 
        this.rb.linearVelocity = new Vec2(this.speed, 0); 
    }

    selfDestroy()
    {
        this.scheduleOnce(()=>{
            if (!this.node || !this.node.isValid) return;
            this.node.destroy();
        }, this.timeLife);
    }
}

