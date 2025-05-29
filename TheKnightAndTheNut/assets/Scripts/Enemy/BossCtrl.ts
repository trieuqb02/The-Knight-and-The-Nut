import { _decorator, Component, instantiate, Node, Prefab, UITransform, Animation, input, Input, KeyCode, EventKeyboard, Vec3, PhysicsSystem2D, ERaycast2DType, Graphics, Color, Vec2, PhysicsGroup, Contact2DType, IPhysics2DContact, Collider2D, AudioClip } from 'cc';
import { PlayerCtrl } from '../Player/PlayerCtrl';
import { Entity } from '../Player/Entity';
import { ColliderGroup } from '../ColliderGroup';
import { AudioManager } from '../Audio/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('BossCtrl')
export class BossCtrl extends Entity {
    @property(Prefab)
    private bulletPrefab: Prefab;
    @property(Prefab)
    private skillPrefab: Prefab;
    @property(Node)
    private fireOrigin: Node;
    @property(Node)
    private bulletParent: Node;
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

    private isHurting: boolean = false;

    // Audio
    @property(AudioClip)
    fireSound: AudioClip = null;
    @property(AudioClip)
    hurtSound: AudioClip = null;
    @property(AudioClip)
    skillSound: AudioClip = null;
    @property(AudioClip)
    previousSkillSound: AudioClip = null;
    
    protected onLoad(): void {
        super.onLoad();
        this.graphics = this.rayDrawerNode.getComponent(Graphics);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    update(deltaTime: number) {
        this.scanTimer += deltaTime;

        if (this.scanTimer >= this.scanInterval) {
            this.moveTowardsPlayerY(deltaTime);
            this.checkRaycast();
        }
    }

    onKeyDown(event: EventKeyboard){
        if (event.keyCode == KeyCode.KEY_K) {
            this.skill();
        }
    }

    // onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    //     // implement
    // }

    attack(){
        if (this.isHurting) return;
        const randomValue = Math.random(); 
        if (randomValue < 0.3) {
            this.skill(); 
        } else {
            this.fire();
        }
    }

    skill(){
        AudioManager.instance.playSFX(this.previousSkillSound);
        this.anim.play("bossAttack2");

        // play run anim after hurt anim
        this.anim.once(Animation.EventType.FINISHED, () => {
            this.isHurting = false;
            this.anim.play("idle");
        });
    }

    instanceSkill(){
        AudioManager.instance.playSFX(this.skillSound);
        const skillCount = 5;
        const skillSpacing = 200; 
        const delay = 0.2; 
        const y = PlayerCtrl.Instance.node.worldPosition.y;

        for (let i = 0; i < skillCount; i++) {
            this.scheduleOnce(() => {
                const fire = instantiate(this.skillPrefab);
                this.bulletParent.addChild(fire);
                fire.setWorldPosition(new Vec3(
                    this.fireOrigin.worldPosition.x - i * skillSpacing,
                    y,
                    0
                ));
                this.scheduleOnce(()=>{
                    fire.destroy();
                }, 1); // destroy after 1s
            }, i * delay);
        }
    }

    hurt(){
        AudioManager.instance.playSFX(this.hurtSound);
        this.isHurting = true;
        this.anim.play("hurt");

        // play run anim after hurt anim
        this.anim.once(Animation.EventType.FINISHED, () => {
            this.isHurting = false;
            this.anim.play("idle");
        });
    }

    takeDame(dame)
    {
        if(this.isHurting) return;
        this.curHealth -= dame;
        if (this.curHealth <= 0){   
            this.dead();
            return;
        }
        this.hurt();
    }

    dead()
    {
        PlayerCtrl.Instance.addScore(800);
        if(this.isDead) return;
        //super.dead();
        this.isDead = true;
        this.anim.play("dead");
        this.collider.enabled = false;
        // disable detect
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
            if (hit.collider.node === PlayerCtrl.Instance.getPlayerNode()) {
                this.scanTimer = 0;
                this.attack();
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

    fire(){
        if(this.isHurting) return;
        // play animation attack
        // call instanceBullet() in event animation
        this.anim.play("attack");
        this.anim.once(Animation.EventType.FINISHED, () => {
            this.anim.play("idle");
        });
    }   

    instanceBullet(){
        AudioManager.instance.playSFX(this.fireSound);
        let bullet = instantiate(this.bulletPrefab);
        bullet.parent = this.bulletParent;

        // convert fireOrigin to local of bulletSpawn
        let localPos = this.bulletParent
            .getComponent(UITransform)
            .convertToNodeSpaceAR(this.fireOrigin.worldPosition);

        bullet.setPosition(localPos);
    }
}

