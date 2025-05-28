import {
  _decorator,
  Component,
  instantiate,
  JsonAsset,
  Node,
  Prefab,
  resources,
  ScrollView,
  SpriteFrame,
  Event,
} from "cc";
import { Item } from "./Item";
import { MyEvent } from "./MyEvent";
const { ccclass, property } = _decorator;

@ccclass("ImageShopItem")
class ImageItemShop {
  @property({ type: SpriteFrame, visible: true })
  spriteFrame: SpriteFrame = null;

  @property
  key: string = "";
}

@ccclass("ShopManager")
export class ShopManager extends Component {
  @property([ImageItemShop])
  imageList: ImageItemShop[] = [];

  @property(ScrollView)
  shopView: ScrollView = null;

  @property(Prefab)
  shopPrefab: Prefab = null;

  @property(Node)
  messageNode: Node = null;

  protected onLoad(): void {
    if (this.shopView.content.children.length == 0) {
      resources.load("shop/data", JsonAsset, (err, jsonAsset) => {
        if (err) {
          console.error(err);
          return;
        }

        const data = jsonAsset.json;

        data.forEach((element) => {
          const shopNode = instantiate(this.shopPrefab);

          const imageItem = this.imageList.find((item) => {
            return item.key == element.name;
          });

          shopNode.getComponent(Item).init({
            title: element.name,
            price: element.price,
            description: element.description,
            image: imageItem.spriteFrame,
          });

          this.shopView.content.addChild(shopNode);
        });
      });
    }

    this.node.on("OPPEN_MESSAGE", (event: MyEvent) => {
      this.messageNode.active = true;
      event.propagationStopped = true;
    });
  }

  clickCloseMessage() {
    this.messageNode.active = false;
  }
}
