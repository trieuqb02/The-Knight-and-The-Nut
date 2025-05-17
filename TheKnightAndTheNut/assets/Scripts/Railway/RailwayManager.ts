import {
  _decorator,
  Component,
  instantiate,
  Node,
  Prefab,
  UITransform,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("RailwayManager")
export class RailwayManager extends Component {
  @property(Node)
  gamePlayNode: Node = null!;

  @property({
    type: Prefab,
  })
  railwayFlat: Prefab;

  @property({
    type: Prefab,
  })
  railwaySlopeUp: Prefab;

  @property({
    type: Prefab,
  })
  railwaySlopeDown: Prefab;

  @property({
    type: Prefab,
  })
  railwaySlopeUpAndDown: Prefab;

  @property()
  speed: number = 0;

  private positionYOfRailSlopeUP: number = -15;

  private positionYOfRailSlopeDown: number = 15;

  private pieces: Node[] = [];

  private gamePlaytWith: number = 0;

  private positionXStart: number = 0;

  private hasSpawnedNext = true;

  onLoad(): void {
    this.gamePlaytWith =
      this.gamePlayNode.getComponent(UITransform)?.contentSize.width ?? 0;
    this.spawnPiece(this.railwayFlat);
    this.spawnPiece(this.railwaySlopeUp);
  }

  start(): void {}

  update(deltaTime: number): void {
    this.movePieces(deltaTime);
    this.checkSpawnNext();
    this.checkRemoveFirst();
  }

  private movePieces(dt: number) {
    for (const piece of this.pieces) {
      const pos = piece.getPosition();
      piece.setPosition(pos.x - this.speed * dt, pos.y, pos.z);
    }
  }

  private checkSpawnNext() {
    const piece = this.pieces[0];

    if (!this.hasSpawnedNext) return;

    const worldX = piece.getPosition().x;
    if (worldX <= -(this.gamePlaytWith / 2)) {
      this.spawnPiece(this.getRandomPrefab());
      this.hasSpawnedNext = false;
    }
  }

  private checkRemoveFirst() {
    const piece = this.pieces[0];
    if (!piece) return;

    const uiTransform = piece.getComponent(UITransform);
    if (!uiTransform) return;

    const worldRect = uiTransform.getBoundingBoxToWorld();

    if (worldRect.x <= -worldRect.width) {
      piece.destroy();
      this.pieces.shift();
      this.hasSpawnedNext = true;
    }
  }

  private getRandomPrefab(): Prefab {
    const prefabs = [
      this.railwayFlat,
      this.railwaySlopeUp,
      this.railwaySlopeDown,
      this.railwaySlopeUpAndDown,
    ];
    const index = Math.floor(Math.random() * prefabs.length);
    return prefabs[index];
  }

  private spawnPiece(prefab: Prefab) {
    const piece = instantiate(prefab);

    const width = piece.getComponent(UITransform)?.contentSize.width ?? 0;

    const length = this.pieces.length;

    const namePrefab = piece.name;

    switch (length) {
      case 0: {
        this.positionXStart = -(this.gamePlaytWith / 2 - width / 2);
        break;
      }
      case 1: {
        this.positionXStart = width / 2 + this.positionXStart;
        break;
      }
      case 2: {
        const railway1Width =
          this.pieces[0].getComponent(UITransform)?.contentSize.width ?? 0;
        const railway2Width =
          this.pieces[1].getComponent(UITransform)?.contentSize.width ?? 0;
        if (railway1Width / 2 > this.gamePlaytWith / 2) {
          this.positionXStart =
            railway2Width +
            (railway1Width / 2 - this.gamePlaytWith / 2) +
            width / 2;
        } else {
          this.positionXStart =
            railway2Width -
            (this.gamePlaytWith / 2 - railway1Width / 2) +
            width / 2;
        }
        break;
      }
    }

    switch (namePrefab) {
      case this.railwayFlat.name: {
        piece.setPosition(this.positionXStart, 0, 0);
        break;
      }
      case this.railwaySlopeUp.name: {
        piece.setPosition(this.positionXStart, this.positionYOfRailSlopeUP, 0);
        break;
      }
      case this.railwaySlopeDown.name: {
        piece.setPosition(
          this.positionXStart,
          this.positionYOfRailSlopeDown,
          0
        );
        break;
      }
      case this.railwaySlopeUpAndDown.name: {
        piece.setPosition(this.positionXStart, 0, 0);
        break;
      }
    }

    if (length === 0) {
      this.positionXStart = width / 2 + this.positionXStart;
    }

    this.gamePlayNode.addChild(piece);
    this.pieces.push(piece);
  }
}
