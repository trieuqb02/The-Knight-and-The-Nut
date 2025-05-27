import { _decorator, AudioClip, Component, Node } from "cc";
import { AudioManager } from "./AudioManager";
const { ccclass, property } = _decorator;

export enum EventEnum {
  EVENT_OPEN_MISSION_LIST = "EVENT_OPEN_MISSION_LIST",
  EVENT_OPEN_RANKING = "EVENT_OPEN_RANKING",
  EVENT_OPEN_SHOP = "EVENT_OPEN_SHOP",
}

@ccclass("EventManager")
export class EventManager extends Component {
  protected onLoad(): void {}

  @property(AudioClip)
  clickSound: AudioClip = null!;

  emitOpenMissionList() {
    AudioManager.instance.playSFX(this.clickSound);
    this.node.emit(EventEnum.EVENT_OPEN_MISSION_LIST);
  }

  emitOpenRankingsList() {
    AudioManager.instance.playSFX(this.clickSound);
    this.node.emit(EventEnum.EVENT_OPEN_RANKING);
  }

  emitOpenShop() {
    AudioManager.instance.playSFX(this.clickSound);
    this.node.emit(EventEnum.EVENT_OPEN_SHOP);
  }

  emitOpenSetting() {
    AudioManager.instance.playSFX(this.clickSound);
  }

  emitOpenPvP() {
    AudioManager.instance.playSFX(this.clickSound);
  }

  emitOpenQuit() {
    AudioManager.instance.playSFX(this.clickSound);
  }
}
