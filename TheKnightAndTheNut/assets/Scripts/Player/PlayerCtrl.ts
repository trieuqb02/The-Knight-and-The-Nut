import { _decorator, Component, EventKeyboard, Input, input, Animation, KeyCode, Node, Collider2D, IPhysics2DContact, Contact2DType, PhysicsSystem2D, Vec2, ERaycast2DType, Graphics, Color, UITransform, Vec3, Prefab, instantiate, AudioClip, find, RigidBody2D } from 'cc';
import { GameManager } from '../GameManager';
import { AudioManager } from '../AudioManager';
import { Entity } from './Entity';
import { RailwayManager } from '../Railway/RailwayManager';
import { ColliderGroup } from '../ColliderGroup';
const { ccclass, property } = _decorator;

@ccclass('PlayerCtrl')
export class PlayerCtrl extends Entity {
    public static Instance: PlayerCtrl = null; // singleton

    private isHoldingSpace: boolean = false;
    private spacePressTimer;

    private isReverse: boolean = false;
    private isClimb: boolean = false;

    private direction: Vec3;
    private direction2: Vec3;
    private distanceRay: number = 200;
    @property({type: Node,})
    rayOrigin: Node; 
    @property({type: Node,})
    rayOrigin2: Node; 

    // node for draw ray
    private graphics: Graphics = null;
    private graphicNode: Node;

    private coinNumber: number = 0;
    
    private railwayManager;
    private gameManager;

    isGodState: boolean = false;
    @property
    timingGod: number = 5;
    @property
    nitroToGod: number = 5;
    private curNitroNumber: number = 0;

    // Effect
    @property({type: Node,})
    speedUpEffect: Node; 
    @property({type: Prefab,})
    reverseEffect: Prefab; 

    // Audio
    @property(AudioClip)
    reverseSound: AudioClip = null;
    @property(AudioClip)
    coinSound: AudioClip = null;
    @property(AudioClip)
    fireSound: AudioClip = null;

    // jump
    @property
    gravity: number = -30;
    @property
    jumpForce: number = 8;
    @property
    speedJump: number = 8;
    private _rigidbody: RigidBody2D = null!;
    private _isGrounded: boolean = false;
    private _velocityY: number = 0;

    onLoad(){
        super.onLoad();
        if (PlayerCtrl.Instance === null) PlayerCtrl.Instance = this; // singleton

        // get component
        this._rigidbody = this.getComponent(RigidBody2D)!;
        const railwayManagerNode = find('Canvas/RailwayManager');
        if (railwayManagerNode) 
            this.railwayManager = railwayManagerNode.getComponent(RailwayManager);

        const gameManagerNode = find('Canvas/GameManager');
        if (gameManagerNode) 
            this.gameManager = gameManagerNode.getComponent(GameManager);

        this.graphicNode = find('Canvas/GraphicNode');
        if (this.graphicNode) 
            this.graphics = this.graphicNode.getComponent(Graphics);
        
        // deactive effect
        this.speedUpEffect.active = false;
    }

    start() {
        this.gameManager.displayHealth(this.curHealth)

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        if(this.isDead) return;
        this.railCheck();

        if (!this._isGrounded) {
            this._velocityY += this.gravity * deltaTime;
            this.node.setPosition(this.node.position.add3f(0, this._velocityY * deltaTime * this.speedJump, 0));
        } else {
            this._velocityY = 0; 
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        super.onBeginContact(selfCollider, otherCollider, contact);
        if (otherCollider.group === ColliderGroup.GROUND) {
            this._isGrounded = true;
            console.log("Collide ground: " + this._isGrounded);
        }
    }

    jump() {
        console.log("on jump");
        this._velocityY = this.jumpForce;
        this._isGrounded = false;
    }

    railCheck(){
        if(!this._isGrounded) return;
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
        this.drawRay(originWorld2, endPoint2);

        // hit up
        if (hits.length > 0) {
            const hit = hits[0];
            const hitPoint = hit.point; // collide point
            this.node.worldPosition = new Vec3(this.node.worldPosition.x, hitPoint.y, this.node.worldPosition.z);
            //this.drawPoint(hitPoint);
            return;
        }
        // hit down
        if (hits2.length > 0) {
            const hit = hits2[0];
            const hitPoint = hit.point; // collide point
            this.node.worldPosition = new Vec3(this.node.worldPosition.x, hitPoint.y, this.node.worldPosition.z);
            this.drawPoint(hitPoint);
            return;
        }
    }

    getOrigin(){
        return this.rayOrigin;
    }

    onGod(){
        this.isGodState = true;
        this.speedUpEffect.active = true;
        let pinkAttackState = this.anim.getState("run");
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

    drawPoint(hitPoint){
        // convert to world pos
        const localPoint = this.graphicNode
        .getComponent(UITransform)
        .convertToNodeSpaceAR(new Vec3(hitPoint.x, hitPoint.y, 0));

        // draw point collide
        this.graphics.circle(localPoint.x, localPoint.y, 5);
        this.graphics.fillColor = Color.GREEN;
        this.graphics.fill();
    }

    drawRay(originWorld, endPoint){
        // to local graphics node
        const localStart = this.graphicNode.getComponent(UITransform).convertToNodeSpaceAR(originWorld);
        const localEnd = this.graphicNode.getComponent(UITransform).convertToNodeSpaceAR(endPoint);
        this.graphics.clear();
        this.graphics.moveTo(localStart.x, localStart.y);
        this.graphics.lineTo(localEnd.x, localEnd.y);
        this.graphics.strokeColor = Color.RED;
        this.graphics.stroke();
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

            this.anim.play("run");
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

        if (event.keyCode == KeyCode.KEY_H && this._isGrounded) {
            console.log("Press jump");
            this.jump();
        }
    }

    climb(){
        this.isClimb = true;
        this.collider.enabled = false;
        this.anim.play("climb");
    }

    attack(){
        if(this.isClimb) return;

        AudioManager.instance.playSFX(this.fireSound);
        this.anim.play("attack");

        this.anim.once(Animation.EventType.FINISHED, () => {
            this.anim.play("run");
        });
    }

    dead(){
        super.dead();
        this.anim.once(Animation.EventType.FINISHED, () => {
            this.gameManager.gameOver();
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
        console.log("call take dame on player");
        if(this.isGodState) return;
        super.takeDame(dame);
        this.gameManager.displayHealth(this.curHealth);
    }

    getPlayerNode(){
        return this.node;
    }

    onDestroy() {
        if (PlayerCtrl.Instance === this) 
            PlayerCtrl.Instance = null;
    }
}


