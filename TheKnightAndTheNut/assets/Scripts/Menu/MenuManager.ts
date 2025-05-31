import {
  _decorator,
  AudioClip,
  Button,
  Component,
  Label,
  Node,
  PageView,
} from "cc";
import { DataManager } from "../DataManager";
import { EventManager } from "../Event/EventManager";
import { AudioManager } from "../Audio/AudioManager";
const { ccclass, property } = _decorator;

@ccclass("MenuManager")
export class MenuManager extends Component {
 
  @property(PageView)
  missionList: PageView = null;

  @property(Node)
  rankingPanel: Node = null;

  @property(Node)
  shopPanel: Node = null;

  @property(Node)
  settingPanel: Node = null;

  @property(Node)
  eventManager: Node = null;

  @property(Label)
  goldLabel: Label = null;

  private eventComp = null;

  protected onLoad(): void {
    AudioManager.instance.stopBGM();
    const menuClip = AudioManager.instance.getMenuClip();
    AudioManager.instance.playBGM(menuClip);
    
    this.eventComp = this.eventManager.getComponent(EventManager);
    const user = DataManager.instance.getUser();
    this.goldLabel.string = user.gold.toString();
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

    if (this.settingPanel.active && s != "setting") {
      this.settingPanel.active = false;
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

  clickOpenSetting() {
    this.closePanel("setting");
    if (!this.settingPanel.active) {
      this.settingPanel.active = true;
    }
  }
}
