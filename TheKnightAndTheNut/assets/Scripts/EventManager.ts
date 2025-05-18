import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

export enum EventEnum {
  EVENT_OPEN_MISSION_LIST = "EVENT_OPEN_MISSION_LIST",
}

@ccclass("EventManager")
export class EventManager extends Component {
  protected onLoad(): void {}

  emitOpenMissionList() {
    this.node.emit(EventEnum.EVENT_OPEN_MISSION_LIST);
  }
}
