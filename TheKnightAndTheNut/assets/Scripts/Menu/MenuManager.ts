import { _decorator, AudioClip, Button, Component, Node, PageView, ScrollView } from "cc";
import { EventManager } from "../EventManager";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("MenuManager")
export class MenuManager extends Component {

  @property(AudioClip)
  audioBGClip: AudioClip = null;

  @property(PageView)
  missionList: PageView = null;

  @property(ScrollView)
  rankingList: ScrollView = null;

  @property(Node)
  eventManager: Node = null;

  private eventComp = null;

  protected onLoad(): void {
    AudioManager.instance.stopBGM();
    AudioManager.instance.playBGM(this.audioBGClip);

    console.log(this.rankingList)

    this.eventComp = this.eventManager.getComponent(EventManager);

    const app = (window as any).myFirebaseApp;

    console.log(app)

  }

  clickOpenMissionList(){
    if(this.rankingList.node.active){
      this.rankingList.node.active = false;
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
    if (!this.rankingList.node.active) {
      this.rankingList.node.active = true;
      this.eventComp.emitOpenRankingsList()
    }
  }
}
