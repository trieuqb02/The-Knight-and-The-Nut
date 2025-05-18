import { _decorator, Component, director, Node, Sprite, SpriteFrame } from "cc";
const { ccclass } = _decorator;
import { DataManager } from "../DataManager";

export enum KeyMission {
  MISSION_1 = "mission1",
  MISSION_2 = "mission2",
  MISSION_3 = "mission3",
}

@ccclass("Mission")
export class Mission extends Component {
  key: string = "";
  islocked: boolean = false;

  init(data: { key: string; islocked: boolean }, spriteFrame: SpriteFrame) {
    this.key = data.key;
    this.islocked = data.islocked;

    const image = this.node.getChildByName("image");
    const overlay = this.node.getChildByName("overlay");
    const lock = this.node.getChildByName("lock");
    const playBtn = this.node.getChildByName("playBtn");

    image.getComponent(Sprite).spriteFrame = spriteFrame;

    if (!this.islocked) {
      playBtn.active = true;
    } else {
      lock.active = true;
      overlay.active = true;
    }
  }

  playMission() {
    if (this.islocked) return;
    DataManager.instance.setData(this.key);
    director.loadScene("MainScene");
  }
}
