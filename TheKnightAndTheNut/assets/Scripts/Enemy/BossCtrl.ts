import { _decorator, Component, instantiate, Node, Prefab, UITransform, Animation, input, Input, KeyCode, EventKeyboard, Vec3, PhysicsSystem2D, ERaycast2DType, Graphics, Color } from 'cc';
import { PlayerCtrl } from '../Player/PlayerCtrl';
const { ccclass, property } = _decorator;

@ccclass('BossCtrl')
export class BossCtrl extends Component {
    @property(Prefab)
    private bulletPrefab: Prefab;
    @property(Node)
    private fireOrigin: Node;
    @property(Node)
    private bulletParent: Node;
    private anim: Animation;
    private direction: Vec3;
    @property({type: Node,})
    rayOrigin: Node; 
    private distanceRay: number = 1000;
    @property(Node)
    rayDrawerNode: Node;
    private graphics: Graphics = null;
    private moveSpeed: number = 100;
    
    protected onLoad(): void {
        this.node.getComponent(UITransform).priority = 10; // set sorting layer for Boss
        this.anim = this.getComponent(Animation);
        this.graphics = this.rayDrawerNode.getComponent(Graphics);
    }

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    update(deltaTime: number) {
        
    }

    attack(){
        this.direction = new Vec3(-1, 0, 0); // ray left

        const originWorld = this.rayOrigin.worldPosition; 
        // calculate endPoint
        const endPoint = originWorld.clone().add(this.direction.multiplyScalar(this.distanceRay));

        // ray hit
        const hits = PhysicsSystem2D.instance.raycast(
            originWorld,
            endPoint,
            ERaycast2DType.Closest,
        );

        let hitPlayer = false;

        // hit up
        if (hits.length > 0) {
            const hit = hits[0];

            const hitName = hit.collider.name;
            if (hitName === PlayerCtrl.Instance.name) {
                hitPlayer = true;
                const hitPoint = hit.point; // collide point
                this.drawRay(originWorld, endPoint);
                this.drawPoint(hitPoint);
            }
        }

        if (!hitPlayer) {
            const bossPos = this.node.worldPosition;
            const playerY = PlayerCtrl.Instance.getPlayerNode().worldPosition.y;
            
            const distanceY = playerY - bossPos.y;

            const moveDeltaY = Math.sign(distanceY) * this.moveSpeed * deltaTime;

            if (Math.abs(distanceY) > 1) {
                const newPos = bossPos.clone();
                newPos.y += moveDeltaY;

                this.node.setWorldPosition(newPos);
            }
        } else {
            this.drawRay(originWorld, endPoint);
        }
    }

    drawPoint(hitPoint){
        // convert to world pos
        const localPoint = this.rayDrawerNode
        .getComponent(UITransform)
        .convertToNodeSpaceAR(new Vec3(hitPoint.x, hitPoint.y, 0));

        // draw point collide
        this.graphics.circle(localPoint.x, localPoint.y, 5);
        this.graphics.fillColor = Color.YELLOW;
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
        this.graphics.lineWidth = 5;
        this.graphics.stroke();
    }

    onKeyDown(event: EventKeyboard){
        if(event.keyCode == KeyCode.KEY_B){
            this.fire();
        }
    }

    fire(){
        // play animation attack
        // call instanceBullet() in event aniomation
        this.anim.play("bossAttack1");
        this.anim.once(Animation.EventType.FINISHED, () => {
            this.anim.play("bossIdle");
        });
    }   

    instanceBullet(){
        let bullet = instantiate(this.bulletPrefab);
        bullet.parent = this.bulletParent;

        // convert fireOrigin to local of bulletSpawn
        let localPos = this.bulletParent
            .getComponent(UITransform)
            .convertToNodeSpaceAR(this.fireOrigin.worldPosition);

        bullet.setPosition(localPos);
    }
}

