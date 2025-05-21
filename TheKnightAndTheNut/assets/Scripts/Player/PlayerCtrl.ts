import { _decorator, Component, EventKeyboard, Input, input, Animation, KeyCode, Node, Collider2D, IPhysics2DContact, Contact2DType, PhysicsSystem2D, Vec2, ERaycast2DType, Graphics, Color, UITransform, Vec3 } from 'cc';
import { EnemyCtrl } from '../Enemy/EnemyCtrl';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

export enum ColliderGroup {
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
    private distanceRay: number = 200;

    @property(Node)
    gameManagerNode: Node;

    @property(Node)
    railwayManagerNode: Node;

    @property(Node)
    rayDrawerNode: Node;

    // node for draw ray
    private graphics: Graphics = null;
    
    @property({type: Node,})
    rayOrigin: Node; 

    @property
    startingHealth: number = 3;
    private curHealth: number;
    @property
    bodyDame: number = 1;

    private coinNumber: number = 0;

    @property
    isGodState: boolean = false;
    @property
    timingGod: number = 5;
    private railwayManager;
    private gameManager;
    @property
    nitroToGod: number = 3;
    private curNitroNumber: number = 0;
    private collider;

    onLoad(){
        this.graphics = this.rayDrawerNode.getComponent(Graphics);

        this.anim = this.getComponent(Animation);
        this.railwayManager = this.railwayManagerNode.getComponent('RailwayManager');

        this.gameManager = this.gameManagerNode.getComponent('GameManager');

        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    start() {
        // init health
        this.curHealth = this.startingHealth;
        this.gameManager.displayHealth(this.curHealth)

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    update(deltaTime: number) {
        this.railCheckTest();//↓
    }

    onGod(){
        this.isGodState = true;
        let pinkAttackState = this.anim.getState("pinkRun");
        // speed up
        this.railwayManager.runSpeedUp(500, this.timingGod);
        // set speed animation
        pinkAttackState.speed = 3; 
        // reset after time
        this.scheduleOnce(()=>{
            pinkAttackState.speed = 1; 
            this.isGodState = false;
        }, this.timingGod);

        // shield
    }

    collect(amount)
    {
        this.coinNumber += amount;
        // add nitro after collect coin
        this.curNitroNumber += 1;

        if(this.curNitroNumber >= this.nitroToGod){
            this.onGod();
        }
    }

    railCheckTest() {
        this.direction = this.isReverse ? new Vec3(0, 1, 0) : new Vec3(0, -1, 0);

        const originWorld = this.rayOrigin.worldPosition;
        const endPoint = originWorld.clone().add(this.direction.multiplyScalar(this.distanceRay));

        let hits = PhysicsSystem2D.instance.raycast(
            originWorld,
            endPoint,
            ERaycast2DType.All
        );

        this.drawRay(originWorld, endPoint);

        // Tạo bản sao để sort
        let hitsArr = [...hits];

        if (hitsArr.length === 0) return;

        // Sắp xếp theo khoảng cách
        hitsArr.sort((a, b) => {
            const distA = Vec2.distance(a.point, new Vec2(originWorld.x, originWorld.y));
            const distB = Vec2.distance(b.point, new Vec2(originWorld.x, originWorld.y));
            return distA - distB;
        });

        // Tìm ground THỨ HAI (bỏ qua ground hiện tại)
        const minDistance = 70; // khoảng cách để bỏ qua ground hiện tại
        let found = 0;

        for (const hit of hitsArr) {
            if (hit.collider.group === ColliderGroup.GROUND) {
                const dist = Vec2.distance(hit.point, new Vec2(originWorld.x, originWorld.y));
                if (dist > minDistance) {
                    found++;
                    if (found === 1) {
                        // chọn ground THỨ HAI
                        const hitPoint = hit.point;
                        this.node.worldPosition = new Vec3(
                            this.node.worldPosition.x,
                            hitPoint.y,
                            this.node.worldPosition.z
                        );
                        break;
                    }
                }
            }
        }
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
        //this.drawRay(originWorld, endPoint);

        if (hits.length > 0) {
            const hit = hits[0];
            const hitPoint = hit.point; // collide point
            this.node.worldPosition = new Vec3(this.node.worldPosition.x, hitPoint.y, this.node.worldPosition.z);

            //this.drawPoint(hitPoint);
        }
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
        // to local graphics node
        const localStart = this.rayDrawerNode.getComponent(UITransform).convertToNodeSpaceAR(originWorld);
        const localEnd = this.rayDrawerNode.getComponent(UITransform).convertToNodeSpaceAR(endPoint);
        this.graphics.clear();
        this.graphics.moveTo(localStart.x, localStart.y);
        this.graphics.lineTo(localEnd.x, localEnd.y);
        this.graphics.strokeColor = Color.RED;
        this.graphics.stroke();
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group === ColliderGroup.ENEMY) {
            const enemy = otherCollider.node.getComponent(EnemyCtrl);
            if (enemy) {
                enemy.takeDame(this.bodyDame); 
            }
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group === ColliderGroup.ENEMY) {
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
        this.anim.play("pinkAttack");

        this.anim.once(Animation.EventType.FINISHED, () => {
            this.anim.play("pinkRun");
        });
    }

    dead(){
        this.anim.play("pinkDead");
        // disable detect
         this.anim.once(Animation.EventType.FINISHED, () => {
            this.node.destroy();
        });
        this.gameManager.gameOver();
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
        if(this.isReverse)
            this.node.angle = 180;
        else this.node.angle = 0;
        
        this.node.setScale(-this.node.scale.x, this.node.scale.y, this.node.scale.z);
    }

    takeDame(dame)
    {
        if(this.isGodState) return;
        this.curHealth -= dame;
        // this.gameManager.displayHealth(this.curHealth);
        this.gameManager.displayPower(this.curHealth)

        if (this.curHealth <= 0){   
            this.dead();
            return;
        }
        this.hurt();
    }
}


