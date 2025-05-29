import { _decorator, Color, Component, ERaycast2DType, EventKeyboard, find, Graphics, Input, input, KeyCode, Node, 
    PhysicsSystem2D, Prefab, UITransform, Vec3, Animation } from 'cc';
import { PlayerCtrl } from './PlayerCtrl';
import { ColliderGroup } from '../ColliderGroup';
import { AudioManager } from '../Audio/AudioManager';

const { ccclass, property } = _decorator;

@ccclass('PlayerMovement')
export class PlayerMovement extends Component {
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

    // jump
    @property
    gravity: number = -150;
    @property
    jumpForce: number = 70;
    @property
    speedJump: number = 8;
    
    private _velocityY: number = 0;
    private _dirY: number = 1;

    private isReverse: boolean = false;

    private isHoldingSpace: boolean = false;
    private spacePressTimer;

    // effect
    @property({type: Prefab,})
    reverseEffect: Prefab; 

    protected onLoad(): void {
        this.graphicNode = find('Canvas/GraphicNode');
        if (this.graphicNode) 
            this.graphics = this.graphicNode.getComponent(Graphics);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
    
    update(deltaTime: number) {
        if(PlayerCtrl.Instance.isDead) return;
        this.railCheck();

        if (!PlayerCtrl.Instance.isGrounded) {
            this._velocityY += this.gravity * this._dirY * deltaTime; // v = v0 + a*t
            // s = s0 + v*t
            this.node.setPosition(this.node.position.add3f(0, this._velocityY * deltaTime * this.speedJump, 0));
        } else {
            this._velocityY = 0; 
        }
    }

    reverse(){
        if (!PlayerCtrl.Instance.isGrounded) return;
        AudioManager.instance.playSFX(PlayerCtrl.Instance.reverseSound);
        this.isReverse = !this.isReverse;
        this._dirY *= -1;
        PlayerCtrl.Instance.createEffect(this.reverseEffect);
        if(this.isReverse)
            this.node.angle = 180;
        else
            this.node.angle = 0;
        
        this.node.setScale(-this.node.scale.x, this.node.scale.y, this.node.scale.z);
    }

    jump() {
        PlayerCtrl.Instance.createEffect(this.reverseEffect);
        AudioManager.instance.playSFX(PlayerCtrl.Instance.jumpSound);
        
        PlayerCtrl.Instance.anim.play("jump");
        PlayerCtrl.Instance.anim.once(Animation.EventType.FINISHED, () => {
            PlayerCtrl.Instance.anim.play("run");
        });
        this._velocityY = this.jumpForce * this._dirY;
        PlayerCtrl.Instance.isGrounded = false;
    }

    // climb(){
    //     PlayerCtrl.Instance.isClimb = true;
    //     PlayerCtrl.Instance.collider.enabled = false;
    //     PlayerCtrl.Instance.anim.play("climb");
    // }

    onKeyUp(event: EventKeyboard){
        // if(event.keyCode == KeyCode.SPACE){
        //     PlayerCtrl.Instance.collider.enabled = true;
        //     this.isHoldingSpace = false;
        //     PlayerCtrl.Instance.isClimb = false;

        //     if (this.spacePressTimer !== null) {
        //         this.unschedule(this.spacePressTimer);
        //         this.spacePressTimer = null;
        //     }

        //     PlayerCtrl.Instance.anim.play("run");
        //     this.reverse();
        // }
    }

    onKeyDown(event: EventKeyboard){
        if(event.keyCode == KeyCode.SPACE){
            // if(this.isHoldingSpace) return;
            // this.isHoldingSpace = true;

            // this.spacePressTimer = this.scheduleOnce(() => {
            //     if (this.isHoldingSpace) {
            //         this.climb();
            //     }
            // }, 0.15);
            this.reverse();
        }

        if (event.keyCode == KeyCode.KEY_W && PlayerCtrl.Instance.isGrounded) {
            this.jump();
        }
    }

    railCheck(){
        if(!PlayerCtrl.Instance.isGrounded) return;
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
            //this.drawPoint(hitPoint);
            return;
        }
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

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
}

