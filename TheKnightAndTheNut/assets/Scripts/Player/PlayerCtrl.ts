import { _decorator, Component, EventKeyboard, Input, input, Animation, KeyCode, Node, Collider2D, IPhysics2DContact, Contact2DType, PhysicsSystem2D, Vec2, ERaycast2DType, Graphics, Color, UITransform, Vec3, Prefab, instantiate, AudioClip } from 'cc';
import { EnemyCtrl } from '../Enemy/EnemyCtrl';
import { GameManager } from '../GameManager';
import { AudioManager } from '../AudioManager';
const { ccclass, property } = _decorator;

export enum ColliderGroup {
    DEFAULT = 1 << 0,
    PLAYER = 1 << 1,
    ENEMY = 1 << 2,
    GROUND = 1 << 3,
}

@ccclass('PlayerCtrl')
export class PlayerCtrl extends Component {
    public static Instance: PlayerCtrl = null; // singleton

    private isHoldingSpace: boolean = false;
    private isReverse: boolean = false;
    private isClimb: boolean = false;
    private anim: Animation;
    private direction: Vec3;
    private direction2: Vec3;
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
    @property({type: Node,})
    rayOrigin2: Node; 

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
    nitroToGod: number = 5;
    private curNitroNumber: number = 0;
    private collider;

    private spacePressTimer;
    @property({type: Node,})
    speedUpEffect: Node; 
    @property({type: Prefab,})
    reverseEffect: Prefab; 

    @property(AudioClip)
    reverseSound: AudioClip = null;
    @property(AudioClip)
    coinSound: AudioClip = null;
    @property(AudioClip)
    fireSound: AudioClip = null;

    onLoad(){
        if (PlayerCtrl.Instance === null) PlayerCtrl.Instance = this; // singleton

        this.node.getComponent(UITransform).priority = 10; // set sorting layer for Player
        this.graphics = this.rayDrawerNode.getComponent(Graphics);

        this.anim = this.getComponent(Animation);
        this.railwayManager = this.railwayManagerNode.getComponent('RailwayManager');

        this.gameManager = this.gameManagerNode.getComponent('GameManager');

        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        this.speedUpEffect.active = false;
    }

    start() {
        // init health
        this.curHealth = this.startingHealth;
        this.gameManager.displayHealth(this.curHealth)

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        this.railCheck();
    }

    getOrigin(){
        return this.rayOrigin;
    }

    onGod(){
        this.isGodState = true;
        this.speedUpEffect.active = true;
        let pinkAttackState = this.anim.getState("pinkRun");
        // speed up
        this.railwayManager.runSpeedUp(500, this.timingGod);
        this.gameManager.playPower(this.timingGod);
        // set speed animation
        pinkAttackState.speed = 3; 
        // reset after time
        this.scheduleOnce(()=>{
            pinkAttackState.speed = 1; 
            this.isGodState = false;
            this.speedUpEffect.active = false;
        }, this.timingGod);
    }

    createEffect(){
        let exp = instantiate(this.reverseEffect);

        exp.parent = this.node.parent;

        const localPos = exp.parent
            .getComponent(UITransform)
            .convertToNodeSpaceAR(this.node.worldPosition);

        exp.setPosition(localPos);
    }

    collect(amount)
    {
        AudioManager.instance.playSFX(this.coinSound);
        this.coinNumber += amount;

        this.gameManager.updateScore(50);
        if(this.isGodState) return;

        // add nitro after collect coin

        // collect 5 coin will increse 1 nitro
        if(this.coinNumber % 5 == 0){
            this.curNitroNumber += 1;
            this.gameManager.displayPower(this.curNitroNumber);
        }

        if(this.curNitroNumber >= this.nitroToGod){
            this.curNitroNumber = 0;
            this.gameManager.displayPower(this.curNitroNumber);
            this.onGod();
        }
    }

    addScore(score){
        this.gameManager.updateScore(score);
    }

    railCheck(){
        this.direction = new Vec3(0, 1, 0); // ray up
        this.direction2 = new Vec3(0, -1, 0); // ray down

        const originWorld = this.rayOrigin.worldPosition; 
        const originWorld2 = this.rayOrigin2.worldPosition; 
        // calculate endPoint
        const endPoint = originWorld.clone().add(this.direction.multiplyScalar(this.distanceRay));
        const endPoint2 = originWorld2.clone().add(this.direction2.multiplyScalar(this.distanceRay));

        // ray hit
        const hits = PhysicsSystem2D.instance.raycast(
            originWorld,
            endPoint,
            ERaycast2DType.Closest,
            ColliderGroup.GROUND,
        );
        //const hitsArr = [...hits];

        const hits2 = PhysicsSystem2D.instance.raycast(
            originWorld2,
            endPoint2,
            ERaycast2DType.Closest,
            ColliderGroup.GROUND,
        );
        //const hitsArr2 = [...hits2];

        // draw ray
        //this.drawRay(originWorld, endPoint);
        //this.drawRay(originWorld2, endPoint2);

        // hit up
        if (hits.length > 0) {
            //console.log("hit uppp");
            const hit = hits[0];
            const hitPoint = hit.point; // collide point
            this.node.worldPosition = new Vec3(this.node.worldPosition.x, hitPoint.y, this.node.worldPosition.z);
            //this.drawPoint(hitPoint);
            return;
        }
        // hit down
        if (hits2.length > 0) {
            //console.log("hit down");
            const hit = hits2[0];
            const hitPoint = hit.point; // collide point
            this.node.worldPosition = new Vec3(this.node.worldPosition.x, hitPoint.y, this.node.worldPosition.z);
            //this.drawPoint(hitPoint);
            return;
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

    onKeyUp(event: EventKeyboard){
        if(event.keyCode == KeyCode.SPACE){
            this.collider.enabled = true;
            this.isHoldingSpace = false;
            this.isClimb = false;

            if (this.spacePressTimer !== null) {
                this.unschedule(this.spacePressTimer);
                this.spacePressTimer = null;
            }

            this.anim.play("pinkRun");
            this.reverse();
        }
    }
    
    onKeyDown(event: EventKeyboard){
        if(event.keyCode == KeyCode.SPACE){
            if(this.isHoldingSpace) return;
            this.isHoldingSpace = true;

            this.spacePressTimer = this.scheduleOnce(() => {
                if (this.isHoldingSpace) {
                    this.climb();
                }
            }, 0.15);
        }
        if (event.keyCode === KeyCode.KEY_A) { 
            this.hurt();
        }
        if (event.keyCode === KeyCode.KEY_D) { 
            this.dead();
        }
    }

    climb(){
        this.isClimb = true;
        this.collider.enabled = false;
        this.anim.play("pinkClimb");
    }

    attack(){
        if(this.isClimb) return;

        AudioManager.instance.playSFX(this.fireSound);
        this.anim.play("pinkAttack");

        this.anim.once(Animation.EventType.FINISHED, () => {
            this.anim.play("pinkRun");
        });
    }

    dead(){
        this.anim.play("pinkDead");
        this.collider.enabled = false;
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
        AudioManager.instance.playSFX(this.reverseSound);
        this.isReverse = !this.isReverse;
        this.createEffect();
        if(this.isReverse)
            this.node.angle = 180;
        else this.node.angle = 0;
        
        this.node.setScale(-this.node.scale.x, this.node.scale.y, this.node.scale.z);
    }

    takeDame(dame){
        if(this.isGodState) return;
        this.curHealth -= dame;
        this.gameManager.displayHealth(this.curHealth);

        if (this.curHealth <= 0){   
            this.dead();
            return;
        }
        this.hurt();
    }

    getPlayerNode(){
        return this.node;
    }

    onDestroy() {
        if (PlayerCtrl.Instance === this) 
            PlayerCtrl.Instance = null;
    }
}


