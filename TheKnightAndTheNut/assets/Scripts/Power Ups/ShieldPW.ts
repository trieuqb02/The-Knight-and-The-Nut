import { _decorator, Component, director, Node } from 'cc';
import { PowerUp } from './PowerUp';
const { ccclass, property } = _decorator;

@ccclass('ShieldPW')
export class ShieldPW extends PowerUp {
    @property
    private timming: number = 5;
    active(nodeData: any) {
        director.emit('SHIELD_ON', nodeData);

        this.scheduleOnce(() => {
            director.emit('SHIELD_OFF', nodeData);
        }, this.timming);
        
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 0);
    }
}

