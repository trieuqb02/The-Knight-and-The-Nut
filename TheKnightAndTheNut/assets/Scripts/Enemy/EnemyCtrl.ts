import { _decorator, Collider2D, Component, Node, RigidBody2D, Vec2, Animation, Contact2DType, IPhysics2DContact, PhysicsSystem2D } from 'cc';
import { PlayerCtrl } from '../Player/PlayerCtrl';
import { Entity } from '../Player/Entity';
import { ColliderGroup } from '../ColliderGroup';
const { ccclass, property } = _decorator;

@ccclass('EnemyCtrl')
export class EnemyCtrl extends Entity {
    @property
    speed: number = 15; 

    move(deltaTime){
        this.node.setPosition(
            this.node.position.x - this.speed * deltaTime,
            this.node.position.y,
            this.node.position.z
        );
    }

    takeDame(dame){
        super.takeDame(dame);
    }

    dead()
    {
        PlayerCtrl.Instance.addScore(50);
        super.dead();
    }
}


