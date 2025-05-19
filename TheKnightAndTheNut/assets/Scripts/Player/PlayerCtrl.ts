import { _decorator, Component, EventKeyboard, Input, input, Animation, KeyCode, Node, Collider2D, IPhysics2DContact, Contact2DType, PhysicsSystem2D, Vec2, ERaycast2DType, Graphics, Color, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

enum ColliderGroup {
    DEFAULT = 1 << 0,
    PLAYER = 1 << 1,
    ENEMY = 1 << 2,
    GROUND = 1 << 3,
}

@ccclass('PlayerCtrl')
export class PlayerCtrl extends Component {
    private isReverse: boolean = false;
    private anim: Animation;
    private direction: Vec3;
    private distanceRay: number = 1000;

    @property(Node)
    rayDrawerNode: Node;

    private graphics: Graphics = null;
    
    @property({
        type: Node,
    })
    rayOrigin: Node; 

    onLoad(){
        this.graphics = this.rayDrawerNode.getComponent(Graphics);
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
        this.railCheck();
    }

    railCheck(){
        if(this.isReverse) this.direction = new Vec3(0, 1, 0); // ray up
        else this.direction = new Vec3(0, -1, 0); // ray down

        // Convert world position về local của Graphics node
        const originWorld = this.rayOrigin.worldPosition; 

        // calculate endPoint
        const endPoint = originWorld.clone().add(this.direction.multiplyScalar(this.distanceRay));

        // ray hit
        const hits = PhysicsSystem2D.instance.raycast(
            originWorld,
            endPoint,
            ERaycast2DType.Closest,
            ColliderGroup.GROUND,
        );

        // draw ray
        this.drawRay(originWorld, endPoint);

        if (hits.length > 0) {
            //console.log(hits[0].collider.name);
            const hit = hits[0];
            const hitPoint = hit.point; // vị trí va chạm
            //console.log(hitPoint.y);
            this.node.worldPosition = new Vec3(this.node.worldPosition.x, hitPoint.y, this.node.worldPosition.z);

            this.drawPoint(hitPoint);
        }

        //console.log("on checkk");
    }

    drawPoint(hitPoint){
        // convert to world pos
        const localPoint = this.rayDrawerNode
        .getComponent(UITransform)
        .convertToNodeSpaceAR(new Vec3(hitPoint.x, hitPoint.y, 0));

        // draw point collide
        this.graphics.circle(localPoint.x, localPoint.y, 5);
        this.graphics.fillColor = Color.GREEN;
        this.graphics.fill();
    }

    drawRay(originWorld, endPoint){
        // Chuyển về local của graphics node
        const localStart = this.rayDrawerNode.getComponent(UITransform).convertToNodeSpaceAR(originWorld);
        const localEnd = this.rayDrawerNode.getComponent(UITransform).convertToNodeSpaceAR(endPoint);
        this.graphics.clear();
        this.graphics.moveTo(localStart.x, localStart.y);
        this.graphics.lineTo(localEnd.x, localEnd.y);
        this.graphics.strokeColor = Color.RED;
        this.graphics.stroke();
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

    attack(){
        // const pinkAttackState = this.anim.getState("pinkAttack");
        // pinkAttackState.speed = 3;        
        this.anim.play("pinkAttack");

        this.anim.once(Animation.EventType.FINISHED, () => {
            this.anim.play("pinkRun");
        });
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


