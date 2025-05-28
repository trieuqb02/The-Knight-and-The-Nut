import {
  _decorator,
  AudioClip,
  Button,
  Component,
  Node,
  PageView,
  ScrollView,
} from "cc";
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
  shopPanel: Node = null;

  @property(Node)
  eventManager: Node = null;

  private eventComp = null;

  protected onLoad(): void {
    AudioManager.instance.stopBGM();
    AudioManager.instance.playBGM(this.audioBGClip);
    this.eventComp = this.eventManager.getComponent(EventManager);
  }

  private closePanel(s: string) {
    if (this.rankingPanel.active && s != "rank") {
      this.rankingPanel.active = false;
    }

    if (this.missionList.node.active && s != "mission") {
      this.missionList.node.active = false;
    }

    if (this.shopPanel.active && s != "shop") {
      this.shopPanel.active = false;
    }
  }

  clickOpenMissionList() {
    this.closePanel("mission");
    if (!this.missionList.node.active) {
      this.missionList.node.active = true;
      this.eventComp.emitOpenMissionList();
    }
  }

  clickOpenRankingList() {
    this.closePanel("rank");
    if (!this.rankingPanel.active) {
      this.rankingPanel.active = true;
      this.eventComp.emitOpenRankingsList();
    }
  }

  clickOpenShop() {
    this.closePanel("shop");
    if (!this.shopPanel.active) {
      this.shopPanel.active = true;
      this.eventComp.emitOpenShop();
    }
  }
}
