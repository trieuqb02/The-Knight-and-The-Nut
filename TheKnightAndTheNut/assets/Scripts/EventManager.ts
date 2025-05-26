import { _decorator, AudioClip, Component, Node } from "cc";
import { AudioManager } from "./AudioManager";
const { ccclass, property } = _decorator;

export enum EventEnum {
  EVENT_OPEN_MISSION_LIST = "EVENT_OPEN_MISSION_LIST",
  EVENT_OPEN_LOGIN_PANEL = "EVENT_OPEN_LOGIN_PANEL",
  EVENT_OPEN_REGISTER_PANEL = "EVENT_OPEN_REGISTER_PANEL",
  EVENT_LOGIN = "EVENT_LOGIN",
  EVENT_REGISTER = "EVENT_REGISTER",
  EVENT_CLOSE_MESSAGE = "EVENT_CLOSE_MESSAGE",
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

  emitOpenSetting() {
    AudioManager.instance.playSFX(this.clickSound);
  }

  emitOpenPvP() {
    AudioManager.instance.playSFX(this.clickSound);
  }

  emitOpenQuit() {
    AudioManager.instance.playSFX(this.clickSound);
  }

  emitOpenLogin(){
    AudioManager.instance.playSFX(this.clickSound);
    this.node.emit(EventEnum.EVENT_OPEN_LOGIN_PANEL);
  }

  emitOpenRegister(){
    AudioManager.instance.playSFX(this.clickSound);
    this.node.emit(EventEnum.EVENT_OPEN_REGISTER_PANEL);
  }

  emitLogin(){
    AudioManager.instance.playSFX(this.clickSound);
    this.node.emit(EventEnum.EVENT_LOGIN);
  }

  emitRegister(){
    AudioManager.instance.playSFX(this.clickSound);
    this.node.emit(EventEnum.EVENT_REGISTER);
  }

  emitCloseMessage(){
    AudioManager.instance.playSFX(this.clickSound);
    this.node.emit(EventEnum.EVENT_CLOSE_MESSAGE);
  }
}
