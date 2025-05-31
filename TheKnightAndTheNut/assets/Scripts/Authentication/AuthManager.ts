import { _decorator, Button, Component, director, EditBox, Label,Node, Animation } from "cc";
import { SceneTransitionManager } from "../SceneTransitionManager";
import { DataManager } from "../DataManager";
import { SceneEnum } from "../Enum/SceneEnum";

const { ccclass, property } = _decorator;

@ccclass("AuthManager")
export class AuthManager extends Component {
  @property(Button)
  playButton: Button = null;

  @property(EditBox)
  nameEdit: EditBox = null;

  @property(Label)
  messageLabel: Label = null;

  @property(Node)
  overlayNode: Node = null;

  protected onLoad(): void {}

  protected start(): void {}

  private async clickPlayGame() {
    const name = this.nameEdit.string;
    if (!name) return;

    this.overlayNode.active = true;
    const aim = this.overlayNode.getChildByName("Loading").getComponent(Animation);
    aim.play()

    const firebase = (window as any).FirebaseBundle;
    const result = await firebase.writeData(`users/${name}`, { name: name, mission: 0, score: 0 });
    aim.stop()
    this.overlayNode.active = false;
    if (result) {
      DataManager.instance.setUser({ name: name, gold: 100 });
      SceneTransitionManager.setNextScene(SceneEnum.MENU);
      director.loadScene(SceneEnum.LOADING);
    } else {
      this.messageLabel.node.active = true;
      this.messageLabel.string = `${name} exist!`;
      this.scheduleOnce(() => {
        this.messageLabel.node.active = false;
      },2);
    }
   
  }
}
