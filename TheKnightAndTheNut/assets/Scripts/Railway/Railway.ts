import { _decorator, Component, Node, Quat, UITransform, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Railway")
export class Railway extends Component {
  private speed: number = 0;

  init(speed: number) {
    this.speed = speed
  }

  start() {}

  update(deltaTime: number) {
    const pos = this.node.getPosition();
    this.node.setPosition(pos.x - this.speed * deltaTime, pos.y, pos.z);
  }

  public runSpeedUp(speedUp: number, time: number) {
    const temp = this.speed;
    this.speed = speedUp;
    this.scheduleOnce(() => {
      this.speed = temp;
    }, time);
  }
}
