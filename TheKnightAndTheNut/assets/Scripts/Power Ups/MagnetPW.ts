import { _decorator, Component, director, Node } from 'cc';
import { PowerUp } from './PowerUp';
const { ccclass, property } = _decorator;

@ccclass('MagnetPW')
export class MagnetPW extends PowerUp {
    @property
    private timming: number = 5;
    active(nodeData) {
        MagnetState.isActive = true;
        MagnetState.curNode = nodeData;
        director.emit('MAGNET_ON', nodeData);

        this.scheduleOnce(() => {
            MagnetState.isActive = false;
            MagnetState.curNode = null;
        }, this.timming);

        this.scheduleOnce(() => {
            this.node.destroy();
        }, 0);
    }
}

export class MagnetState {
    static isActive = false;
    static curNode: Node | null = null;
}


