import { _decorator, AudioClip, Component, director, Sprite, SpriteFrame } from "cc";
const { ccclass , property} = _decorator;
import { DataManager } from "../DataManager";
import { SceneTransitionManager } from "../SceneTransitionManager";
import { AudioManager } from "../AudioManager";

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
  image: SpriteFrame = null;
  time: number = 0;

  init(
    data: { key: string; islocked: boolean; score: number,image: SpriteFrame, time: number },
  ) {
    this.key = data.key;
    this.islocked = data.islocked;
    this.score = data.score;
    this.image = data.image;
    this.time = data.time;

    const image = this.node.getChildByName("image");
    const overlay = this.node.getChildByName("overlay");
    const lock = this.node.getChildByName("lock");
    const playBtn = this.node.getChildByName("playBtn");

    image.getComponent(Sprite).spriteFrame = this.image;

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
      image: image.getComponent(Sprite).spriteFrame,
      score: this.score,
      time: this.time
    });
    SceneTransitionManager.setNextScene("MainScene");
    director.loadScene("LoadingScene");
  }
}
