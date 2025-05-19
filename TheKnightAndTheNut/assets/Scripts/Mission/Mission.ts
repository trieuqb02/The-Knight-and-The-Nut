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
  score: number = 0;

  init(
    data: { key: string; islocked: boolean; score: number },
    spriteFrame: SpriteFrame
  ) {
    this.key = data.key;
    this.islocked = data.islocked;
    this.score = data.score;

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
    const image = this.node.getChildByName("image");
    DataManager.instance.setData({
      key: this.key,
      spriteFrame: image.getComponent(Sprite).spriteFrame,
      score: this.score,
    });
    director.loadScene("MainScene");
  }
}
