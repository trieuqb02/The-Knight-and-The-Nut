import { _decorator, Component, instantiate, Node, Prefab, UITransform, Animation, input, Input, KeyCode, EventKeyboard, Vec3, PhysicsSystem2D, ERaycast2DType, Graphics, Color, Vec2, PhysicsGroup } from 'cc';
import { PlayerCtrl } from '../Player/PlayerCtrl';
const { ccclass, property } = _decorator;

export enum ColliderGroup {
    DEFAULT = 1 << 0,
    PLAYER = 1 << 1,
    ENEMY = 1 << 2,
    GROUND = 1 << 3,
}

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

    private speed: number = 250;
    private dir: Vec3 = new Vec3(0, 0, 0);

    private scanInterval: number = 3;
    private scanTimer: number = 0;
    private isPlayerVisible: boolean = false;

    
    protected onLoad(): void {
        this.node.getComponent(UITransform).priority = 10; // set sorting layer for Boss
        this.anim = this.getComponent(Animation);
        this.graphics = this.rayDrawerNode.getComponent(Graphics);
    }

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    update(deltaTime: number) {
        this.scanTimer += deltaTime;

        if (this.scanTimer >= this.scanInterval) {
            this.moveTowardsPlayerY(deltaTime);
            this.checkRaycast();
        }

        // if (!this.isPlayerVisible) {
        //     //this.updateDirectionToPlayer();
        //     this.move(deltaTime);
        // }
    }

    moveTowardsPlayerY(deltaTime: number) {
        const playerY = PlayerCtrl.Instance.getPlayerNode().getChildByName("Origin").worldPosition.y;
        const bossPos = this.node.getWorldPosition();

        const targetPos = bossPos.clone();
        targetPos.y = playerY;

        // Di chuyển mượt về phía playerY
        const smoothPos = new Vec3();
        Vec3.lerp(smoothPos, bossPos, targetPos, this.speed * deltaTime / 100); // scale nhỏ để mượt hơn

        this.node.setWorldPosition(smoothPos);
    }



    updateDirectionToPlayer() {
        const playerY = PlayerCtrl.Instance.getPlayerNode().getChildByName("Origin").worldPosition.y;
        const bossY = this.rayOrigin.worldPosition.y;

        if (playerY > bossY) {
            this.dir = new Vec3(0, 1, 0); // Lên
        } else if (playerY < bossY) {
            this.dir = new Vec3(0, -1, 0); // Xuống
        } else {
            this.dir = new Vec3(0, 0, 0); // Dừng nếu gần
        }
    }


    scanForPlayer() {
        const originWorld = this.rayOrigin.worldPosition;
        const direction = new Vec3(-1, 0, 0); // Raycast qua trái
        const endPoint = originWorld.clone().add(direction.multiplyScalar(this.distanceRay));

        const origin2D = new Vec2(originWorld.x, originWorld.y);
        const end2D = new Vec2(endPoint.x, endPoint.y);

        const hits = PhysicsSystem2D.instance.raycast(origin2D, end2D, ERaycast2DType.Closest);

        if (hits.length > 0 && hits[0].collider.node === PlayerCtrl.Instance.getPlayerNode()) {
            console.log("Hittt " + hits[0].collider.name);
            this.isPlayerVisible = true;
            this.dir = new Vec3(0, 0, 0); // Dừng lại
            this.drawPoint(hits[0].point);
        } else {
            this.isPlayerVisible = false;
        }

        this.drawRay(originWorld, endPoint);
    }


    move(deltaTime){
        // Tính vector di chuyển dựa vào hướng và thời gian
        const movement = this.dir.clone().normalize().multiplyScalar(this.speed * deltaTime);

        // Di chuyển node
        this.node.position = this.node.position.add(movement);
    }

    getYDirection(nodeA, nodeB) {
        const posA = nodeA.worldPosition;
        const posB = nodeB.worldPosition;

        const deltaY = posB.y - posA.y;

        if (deltaY > 0) return 1;
        else if (deltaY < 0) return -1;
        else return 0;
    }

    checkRaycast() {
        this.direction = new Vec3(-1, 0, 0);
        const originWorld = this.rayOrigin.worldPosition;
        const endPoint = originWorld.clone().add(this.direction.multiplyScalar(this.distanceRay));

        const hits = PhysicsSystem2D.instance.raycast(
            originWorld,
            endPoint,
            ERaycast2DType.Closest,
            ColliderGroup.PLAYER,
        );

        if (hits.length > 0) {
            const hit = hits[0];
            console.log("Hittttttttt");
            if (hit.collider.node === PlayerCtrl.Instance.getPlayerNode()) {
                console.log("Hitttt " + hit.collider.name);
                this.scanTimer = 0;
                this.fire();
                this.drawPoint(hit.point);
            }
        }

        this.drawRay(originWorld, endPoint);
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
        // call instanceBullet() in event animation
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

