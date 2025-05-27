import { _decorator, Animation, 
    Node, Collider2D, IPhysics2DContact,
    UITransform, Prefab, instantiate, AudioClip, find, } from 'cc';
import { GameManager } from '../GameManager';
import { AudioManager } from '../AudioManager';
import { Entity } from './Entity';
import { RailwayManager } from '../Railway/RailwayManager';
import { ColliderGroup } from '../ColliderGroup';
const { ccclass, property } = _decorator;

@ccclass('PlayerCtrl')
export class PlayerCtrl extends Entity {
    public static Instance: PlayerCtrl = null; // singleton

    private coinNumber: number = 0;
    
    // Manager script
    private railwayManager;
    private gameManager;

    // Player state
    isGodState: boolean = false;
    @property
    timingGod: number = 5;
    @property
    nitroToGod: number = 5;
    private curNitroNumber: number = 0;

    // Check climb
    private _isClimb: boolean = false;
    get isClimb(){ return this._isClimb; }
    set isClimb(value) { this._isClimb = value; }

    // Check ground
    private _isGrounded: boolean = false;
    get isGrounded(){ return this._isGrounded; }
    set isGrounded(value) { this._isGrounded = value; }

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

    onLoad(){
        super.onLoad();
        if (PlayerCtrl.Instance === null) PlayerCtrl.Instance = this; // singleton

        // get component
        const railwayManagerNode = find('Canvas/RailwayManager');
        if (railwayManagerNode) 
            this.railwayManager = railwayManagerNode.getComponent(RailwayManager);

        const gameManagerNode = find('Canvas/GameManager');
        if (gameManagerNode) 
            this.gameManager = gameManagerNode.getComponent(GameManager);

        // deactive effect
        this.speedUpEffect.active = false;
    }

    start() {
        this.gameManager.displayHealth(this.curHealth)
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        super.onBeginContact(selfCollider, otherCollider, contact);
        if (otherCollider.group === ColliderGroup.GROUND) {
            this._isGrounded = true;
        }
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


