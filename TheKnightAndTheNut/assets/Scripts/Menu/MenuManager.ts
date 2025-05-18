import { _decorator, Button, Component, Node } from "cc";
import { EventManager } from "../EventManager";
const { ccclass, property } = _decorator;

@ccclass("MenuManager")
export class MenuManager extends Component {
  @property(Node)
  eventManager: Node = null;

  @property(Button)
  missionbtn: Button = null;

  openMissionList() {
    this.eventManager.getComponent(EventManager).emitOpenMissionList();
  }
}
