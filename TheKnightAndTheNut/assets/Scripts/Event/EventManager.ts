import { _decorator, AudioClip, Component } from "cc";
import { AudioManager } from "../Audio/AudioManager";
import { EventEnum } from "../Enum/EventEnum";
const { ccclass, property } = _decorator;

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
    this.node.emit(EventEnum.EVENT_SETTING_SHOP);
  }

  emitOpenPvP() {
    AudioManager.instance.playSFX(this.clickSound);
  }

  emitOpenQuit() {
    AudioManager.instance.playSFX(this.clickSound);
  }
}
