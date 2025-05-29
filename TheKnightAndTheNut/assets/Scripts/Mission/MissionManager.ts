import {
  _decorator,
  Component,
  instantiate,
  JsonAsset,
  Node,
  PageView,
  Prefab,
  resources,
  SpriteFrame,
} from "cc";
import { Mission } from "./Mission";
import { DataManager } from "../DataManager";
import { EventEnum } from "../Enum/EventEnum";
import { KeyLocalStore } from "../Enum/KeyLocalStore";
const { ccclass, property } = _decorator;

@ccclass("ImageMission")
class ImageMission {
  @property({ type: SpriteFrame, visible: true })
  spriteFrame: SpriteFrame = null;

  @property
  key: string = "";
}

@ccclass("MissionManager")
export class MissionManager extends Component {
  @property(PageView)
  missionList: PageView = null;

  @property({ type: [ImageMission] })
  imageMission: ImageMission[] = [];

  @property({ type: Node })
  eventManager: Node = null;

  @property({ type: Prefab })
  missionPrefab: Prefab = null;

  private isLoadData: boolean = false;

  private missions: {
    key: string;
    islocked: boolean;
    score: number;
    image?: SpriteFrame;
    time: number;
  }[] = [];

  protected onLoad(): void {
    this.eventManager.on(
      EventEnum.EVENT_OPEN_MISSION_LIST,
      this.openMissionList,
      this
    );
  }

  private async loadMissions() {
    return new Promise<void>((resolve, reject) => {
      resources.load("missions/data", JsonAsset, (err, jsonAsset) => {
        if (err) {
          reject(err);
        } else {
          this.missions.push(...(jsonAsset.json as any[]));
          resolve();
        }
      });
    });
  }

  async openMissionList() {
    if (this.missionList.content.children.length > 0) {
      this.missionList.removeAllPages()
    }
    if(!this.isLoadData){
      await this.loadMissions();
      this.isLoadData = !this.isLoadData;
    }
    this.init();
    const finishMissionStr = localStorage.getItem(KeyLocalStore.FINISH_MISSION);
    const finishMission: string[] = finishMissionStr
      ? JSON.parse(finishMissionStr)
      : [];

    if (finishMission.length > 0) {
      finishMission.forEach((key) => {
        this.openMissionNext(key);
      });
    }
  }

  init() {
    this.missions.forEach((mission) => {
      const missionP = instantiate(this.missionPrefab);
      const compMission = missionP.getComponent(Mission);
      const imageItem = this.imageMission.find(
        (img) => img.key === mission.key
      );
      mission.image = imageItem.spriteFrame;
      compMission.init(mission);
      this.missionList.content.addChild(missionP);
      this.missionList.addPage(missionP);
    });
    DataManager.instance.setMissionList(this.missions);
  }

  openMissionNext(key: string) {
    for (let index = 0; index < this.missions.length - 1; index++) {
      if (this.missions[index].key == key) {
        this.missions[index + 1].islocked = false;
      }
    }
  }
}
