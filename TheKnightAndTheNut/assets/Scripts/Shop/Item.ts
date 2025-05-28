import { _decorator, Component, Label, Sprite, SpriteFrame } from "cc";
import { DataManager } from "../DataManager";
import { MyEvent } from "./MyEvent";
import { EventEnum } from "../Enum/EventEnum";
const { ccclass, property } = _decorator;

type ItemShop = {
  title: string;
  price: number;
  description: string;
  image: SpriteFrame;
};

@ccclass("Item")
export class Item extends Component {
  private title: string;
  private price: number;
  private description: string;
  private image: SpriteFrame;

  public getTitle(): string {
    return this.title;
  }

  init(data: ItemShop) {
    this.title = data.title;
    this.price = data.price;
    this.description = data.description;
    this.image = data.image;

    const imageComp = this.node.getChildByName("image").getComponent(Sprite);
    imageComp.spriteFrame = this.image;

    const priceComp = this.node.getChildByName("price").getComponent(Label);
    priceComp.string = this.price.toString();
  }

  clickBuy() {
    const user = DataManager.instance.getUser();
    if (this.price > user.gold) {
      this.node.dispatchEvent(
        new MyEvent(EventEnum.OPPEN_MESSAGE, true, "open message")
      );
      return;
    }

    user.gold -= this.price;
    this.node.dispatchEvent(new MyEvent(EventEnum.BUY_ITEM, true, {nameItem: this.title, gold:user.gold}));
    DataManager.instance.setUser(user);
    DataManager.instance.setSkill(this.title);
  }
}
