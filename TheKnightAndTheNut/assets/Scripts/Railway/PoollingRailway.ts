import { _decorator, Component, instantiate, Node, Prefab } from "cc";
const { ccclass, property } = _decorator;
@ccclass("PoollingRailway")
export class PoollingRailway extends Component {
  @property({ type: Prefab })
  railwayPrefabs: Prefab = null;

  @property(Number)
  quantityInit: number = 30;

  private pool: Node[] = [];

  public initPrefabs(): void {
    for (let i = 0; i < this.quantityInit; i++) {
      this.createObject();
    }
  }

  private createObject(): void {
    const railway = instantiate(this.railwayPrefabs);
    railway.active = false;
    this.pool.push(railway);
  }

  public getPrefabNode(): Node {
    let node: Node | undefined;

    if (!this.pool.length) {
      this.createObject();
    }

    node = this.pool.pop();
    node.active = true;
    return node;
  }

  public recycleNode(railway: Node): void {
    railway.active = false;
    this.pool.push(railway);
  }

  protected onLoad(): void {
    this.initPrefabs();
  }
}
