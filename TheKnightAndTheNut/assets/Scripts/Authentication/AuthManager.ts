import { _decorator, Button, Component, director, EditBox, Label } from "cc";
import { SceneTransitionManager } from "../SceneTransitionManager";
import { DataManager } from "../DataManager";

const { ccclass, property } = _decorator;

@ccclass("AuthManager")
export class AuthManager extends Component {
  @property(Button)
  playButton: Button = null;

  @property(EditBox)
  nameEdit: EditBox = null;

  @property(Label)
  messageLabel: Label = null;

  protected onLoad(): void {}

  protected start(): void {}

  private async clickPlayGame() {
    const name = this.nameEdit.string;
    if (!name) return;
    const firebase = (window as any).FirebaseBundle;
    const result = await firebase.writeData(`users/${name}`, { name: name, mission: 0, score: 0 });
    if (result) {
      DataManager.instance.setUser({ name: name, gold: 0 });
      SceneTransitionManager.setNextScene("MenuScene");
      director.loadScene("LoadingScene");
    } else {
      this.messageLabel.node.active = true;
      this.messageLabel.string = `${name} exist!`;
      this.scheduleOnce(() => {
        this.messageLabel.node.active = false;
      },2);
    }
  }
}
