import { _decorator, AudioClip, Button, Component, Node } from "cc";
import { EventManager } from "../EventManager";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("MenuManager")
export class MenuManager extends Component {
  @property(Node)
  eventManager: Node = null;

  @property(Button)
  missionbtn: Button = null;

  @property(AudioClip)
  audioBGClip: AudioClip = null;

  protected onLoad(): void {
    AudioManager.instance.stopBGM();
    AudioManager.instance.playBGM(this.audioBGClip);
  }

  openMissionList() {
    this.eventManager.getComponent(EventManager).emitOpenMissionList();
  }
}
