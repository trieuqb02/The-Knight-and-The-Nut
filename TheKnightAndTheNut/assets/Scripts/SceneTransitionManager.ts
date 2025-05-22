import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SceneTransitionManager")
export class SceneTransitionManager extends Component {
  private static nextScene: string = "MenuScene";

  static setNextScene(name: string) {
    this.nextScene = name;
  }

  static getNextScene() {
    return this.nextScene;
  }
}
