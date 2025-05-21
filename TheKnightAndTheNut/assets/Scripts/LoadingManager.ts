import { _decorator, Component, director, Node, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoadingManager')
export class LoadingManager extends Component {
    start() {
        
    }

    update(deltaTime: number) {
        
    }

    loadHome(){
        director.loadScene("MenuScene");
    }
}

