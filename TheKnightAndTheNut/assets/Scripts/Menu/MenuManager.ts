import { _decorator, AudioClip, Button, Component, Node, PageView, ScrollView } from "cc";
import { EventManager } from "../EventManager";
import { AudioManager } from "../AudioManager";
import { DataManager } from "../DataManager";
const { ccclass, property } = _decorator;

@ccclass("MenuManager")
export class MenuManager extends Component {

  @property(AudioClip)
  audioBGClip: AudioClip = null;

  @property(PageView)
  missionList: PageView = null;

  @property(Node)
  rankingPanel: Node = null;

  @property(Node)
  eventManager: Node = null;

  private eventComp = null;

  protected onLoad(): void {
    AudioManager.instance.stopBGM();
    AudioManager.instance.playBGM(this.audioBGClip);
    this.eventComp = this.eventManager.getComponent(EventManager);
  }

  clickOpenMissionList(){
    if(this.rankingPanel.active){
      this.rankingPanel.active = false;
    }
    if (!this.missionList.node.active) {
      this.missionList.node.active = true;
      this.eventComp.emitOpenMissionList();
    }
  }

  clickOpenRankingList(){
    if(this.missionList.node.active){
      this.missionList.node.active = false;
    }
    if (!this.rankingPanel.active) {
      this.rankingPanel.active = true;
      this.eventComp.emitOpenRankingsList()
    }
  }
}
