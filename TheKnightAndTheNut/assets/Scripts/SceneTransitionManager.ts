import { _decorator, Component } from "cc";
import { SceneEnum } from "./Enum/SceneEnum";
const { ccclass } = _decorator;
@ccclass("SceneTransitionManager")
export class SceneTransitionManager extends Component {
  private static nextScene: string = SceneEnum.AUTH;

  static setNextScene(name: string) {
    this.nextScene = name;
  }

  static getNextScene() {
    return this.nextScene;
  }
}
