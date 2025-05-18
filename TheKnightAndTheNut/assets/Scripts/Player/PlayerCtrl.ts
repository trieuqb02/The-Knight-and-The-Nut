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
        // Convert world position về local của Graphics node
        const originWorld = this.rayOrigin.worldPosition; // Vec3
        const graphicsNode = this.rayDrawerNode;
        const direction = new Vec3(0, -1, 0); // Vec3
        const distance = 1000;

        // Tính điểm kết thúc (endPoint)
        const endPoint = originWorld.clone().add(direction.multiplyScalar(distance));

        // Chuyển về local của graphics node
        const localStart = graphicsNode.getComponent(UITransform).convertToNodeSpaceAR(originWorld);
        const localEnd = graphicsNode.getComponent(UITransform).convertToNodeSpaceAR(endPoint);



        const hits = PhysicsSystem2D.instance.raycast(
            originWorld,
            endPoint,
            ERaycast2DType.All,
            ColliderGroup.GROUND,
        );
        // if (hit) {
        //     console.log(hit[0].collider.name);

        //     //create temp vector2 to store playerFeet position
        //     let temp = this.node.getPosition();
        //     //We get the y position of our raycast hit/ and set the y value of our temp vector2
        //     temp.y = hit[0].collider.node.getPosition().y;
        //     //we can now directly set our players position by setting it to our temp vector2 value that we adjusted.
        //     this.node.setPosition(temp);
        // }

        // Vẽ bằng Graphics
        this.graphics.clear();
        this.graphics.moveTo(localStart.x, localStart.y);
        this.graphics.lineTo(localEnd.x, localEnd.y);
        this.graphics.strokeColor = Color.RED;
        this.graphics.stroke();

        if (hits.length > 0) {
            console.log(hits[0].collider.name);
            const hit = hits[0];
            const hitPoint = hit.point; // vị trí va chạm
            console.log(hitPoint.y);
            this.node.worldPosition = new Vec3(this.node.worldPosition.x, hitPoint.y, this.node.worldPosition.z);

            // Vẽ điểm va chạm
            this.graphics.circle(hitPoint.x, hitPoint.y, 5);
            this.graphics.fillColor = Color.YELLOW;
            this.graphics.fill();
        }

        console.log("on checkk");
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


