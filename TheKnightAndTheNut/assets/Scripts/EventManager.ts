import { _decorator, AudioClip, Component, Node } from "cc";
import { AudioManager } from "./AudioManager";
const { ccclass, property } = _decorator;

export enum EventEnum {
  EVENT_OPEN_MISSION_LIST = "EVENT_OPEN_MISSION_LIST",
}

@ccclass("EventManager")
export class EventManager extends Component {
  protected onLoad(): void {}

  @property(AudioClip)
    clickSound: AudioClip = null!;

  emitOpenMissionList() {
    console.log(AudioManager.instance.bgmSource)
    AudioManager.instance.playSFX(this.clickSound);
    this.node.emit(EventEnum.EVENT_OPEN_MISSION_LIST);
  }

  emitOpenSetting(){
    AudioManager.instance.playSFX(this.clickSound);
  }

  emitOpenPvP(){
    AudioManager.instance.playSFX(this.clickSound);
  }

  emitOpenQuit(){
    AudioManager.instance.playSFX(this.clickSound);
  }
}
