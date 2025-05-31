import { _decorator, Collider2D, Component, director, Node, UIOpacity } from 'cc';
import { PowerUp } from './PowerUp';
const { ccclass, property } = _decorator;

@ccclass('ShieldPW')
export class ShieldPW extends PowerUp {
    @property
    private timming: number = 5;
    pwUpActive(nodeData: any) {
        director.emit('SHIELD_ON', nodeData);

        this.node.getComponent(UIOpacity)!.opacity = 0;

        setTimeout(() => {
            console.log("offffff");
            director.emit('SHIELD_OFF', nodeData);
        }, this.timming * 1000);
    }
}

