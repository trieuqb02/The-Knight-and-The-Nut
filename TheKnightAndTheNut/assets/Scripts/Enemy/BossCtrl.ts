import { _decorator, Component, instantiate, Node, Prefab, UITransform, Animation, input, Input, KeyCode, EventKeyboard, Vec3, PhysicsSystem2D, ERaycast2DType, Graphics, Color, Vec2, PhysicsGroup, Contact2DType, IPhysics2DContact, Collider2D } from 'cc';
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

    @property
    startingHealth: number = 1;
    private curHealth: number;
    private isHurting: boolean = false;
    private isDead: boolean = false;
    
    protected onLoad(): void {
        this.node.getComponent(UITransform).priority = 10; // set sorting layer for Boss
        this.anim = this.getComponent(Animation);
        this.graphics = this.rayDrawerNode.getComponent(Graphics);
    }

    start() {
        this.curHealth = this.startingHealth;
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    update(deltaTime: number) {
        this.scanTimer += deltaTime;

        if (this.scanTimer >= this.scanInterval) {
            this.moveTowardsPlayerY(deltaTime);
            this.checkRaycast();
        }
    }

    hurt(){
        this.isHurting = true;
        this.anim.play("bossHurt");

        // play run anim after hurt anim
        this.anim.once(Animation.EventType.FINISHED, () => {
            this.isHurting = false;
            this.anim.play("bossIdle");
        });
    }

    takeDame(dame)
    {
        if(this.isHurting) return;
        this.curHealth -= dame;
        console.log("Hp Boss: " + this.curHealth);
        //this.gameManager.displayHealth(this.curHealth);

        if (this.curHealth <= 0){   
            console.log("Boss Dead " + this.curHealth);

            this.dead();
            return;
        }
        this.hurt();
    }

    dead()
    {
        PlayerCtrl.Instance.addScore(800);
        if(this.isDead) return;
        this.isDead = true;
        this.anim.play("bossDead");

        this.anim.once(Animation.EventType.FINISHED, () => {
            this.node.destroy();
        });
    }

    moveTowardsPlayerY(deltaTime: number) {
        const playerY = PlayerCtrl.Instance.getPlayerNode().getChildByName("Origin").worldPosition.y;
        const bossPos = this.node.getWorldPosition();

        const targetPos = bossPos.clone();
        targetPos.y = playerY;

        const smoothPos = new Vec3();
        Vec3.lerp(smoothPos, bossPos, targetPos, this.speed * deltaTime / 100);

        this.node.setWorldPosition(smoothPos);
    }

    move(deltaTime){
        const movement = this.dir.clone().normalize().multiplyScalar(this.speed * deltaTime);
        this.node.position = this.node.position.add(movement);
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
                //this.drawPoint(hit.point);
            }
        }

        //this.drawRay(originWorld, endPoint);
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
        if(this.isHurting) return;
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

