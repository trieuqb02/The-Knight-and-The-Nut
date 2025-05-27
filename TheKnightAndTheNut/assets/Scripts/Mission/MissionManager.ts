import {
  _decorator,
  Component,
  instantiate,
  Node,
  PageView,
  Prefab,
  SpriteFrame,
} from "cc";
import { EventEnum } from "../EventManager";
import { KeyMission, Mission } from "./Mission";
import { DataManager } from "../DataManager";
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

  private missions: {
    key: string;
    islocked: boolean;
    score: number;
    image: SpriteFrame;
    time: number;
  }[] = [
    {
      key: KeyMission.MISSION_1,
      islocked: false,
      score: 500,
      image: null,
      time: 200,
    },
    {
      key: KeyMission.MISSION_2,
      islocked: true,
      score: 700,
      image: null,
      time: 30,
    },
    {
      key: KeyMission.MISSION_3,
      islocked: true,
      score: 1200,
      image: null,
      time: 30,
    },
  ];

  protected onLoad(): void {
    const finishMissionStr = localStorage.getItem("FINISH_MISSION");
    const finishMission: string[] = finishMissionStr
      ? JSON.parse(finishMissionStr)
      : [];

    if (finishMission.length > 0) {
      finishMission.forEach((key) => {
        this.openMissionNext(key);
      });
    }

    this.eventManager.on(
      EventEnum.EVENT_OPEN_MISSION_LIST,
      this.openMissionList,
      this
    );
  }

  openMissionList() {
    if (!this.missionList.node.active) {
      this.missionList.node.active = true;
      this.init();
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
