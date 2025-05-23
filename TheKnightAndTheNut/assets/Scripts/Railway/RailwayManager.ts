import {
  _decorator,
  Component,
  instantiate,
  Node,
  Prefab,
  UITransform,
} from "cc";
import { KeyMission } from "../Mission/Mission";
import { Railway } from "./Railway";
import { PoollingRailway, RailwayPrefabName } from "./PoollingRailway";
import { EnemyCtrl } from "../Enemy/EnemyCtrl";
import { Collectible } from "../Power Ups/Collectible";
const { ccclass, property } = _decorator;

@ccclass("RailwayManager")
export class RailwayManager extends Component {
  @property(Node)
  gamePlayNode: Node = null;

  @property(Node)
  poolRailways: Node = null;

  @property(Number)
  speed: number = 0;

  @property(Prefab)
  enemyPrefab: Prefab = null;

  @property(Prefab)
  coinPrefab: Prefab = null;

  private compPoll = null;

  private pieces: Node[] = [];

  private gamePlaytWidth: number = 0;

  private positionXStart: number = 0;

  private hasSpawnedNext = true;

  private isRunning: boolean = false;

  private isSpeedUp: boolean = false;

  private key: string = "";

  private render: number = 0;

  onLoad(): void {
    this.gamePlaytWidth =
      this.gamePlayNode.getComponent(UITransform)?.contentSize.width ?? 0;

    this.compPoll = this.poolRailways.getComponent(PoollingRailway);
  }

  startRailway(key: string) {
    this.isRunning = true;
    this.key = key;
    switch (key) {
      case KeyMission.MISSION_1: {
        this.spawnPiece(RailwayPrefabName.FLAT);
        this.spawnPiece(RailwayPrefabName.FLAT);
        break;
      }
      case KeyMission.MISSION_2: {
        this.spawnPiece(RailwayPrefabName.FLAT);
        this.spawnPiece(RailwayPrefabName.FLAT);
        break;
      }
      case KeyMission.MISSION_3: {
        this.spawnPiece(RailwayPrefabName.FLAT);
        this.spawnPiece(RailwayPrefabName.FLAT);
        break;
      }
    }
  }

  endRailway() {
    this.isRunning = false;
  }

  start(): void {}

  update(deltaTime: number): void {
    if (this.isRunning) {
      this.checkSpawnNext();
      this.checkRemoveFirst();
      if (!this.isSpeedUp) {
        this.pieces.forEach((piece) => {
          piece.getComponent(Railway).init(this.speed);
        });
      }
    }
  }

  private checkSpawnNext() {
    const piece = this.pieces[0];

    if (!this.hasSpawnedNext) return;

    const worldX = piece.getPosition().x;
    if (worldX <= -(this.gamePlaytWidth / 2)) {
      this.spawnPiece(this.getRandomPrefabName());
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
      this.compPoll.recycleNode(piece);
      this.pieces.shift();
      this.hasSpawnedNext = true;
    }
  }

  private RailwayPrefabValues: RailwayPrefabName[] = [
    RailwayPrefabName.FLAT,
    RailwayPrefabName.UP,
    RailwayPrefabName.DOWN,
    RailwayPrefabName.UP_AND_DOWN,
  ];

  private getRandomPrefabName(): RailwayPrefabName {
    return this.RailwayPrefabValues[
      Math.floor(Math.random() * this.RailwayPrefabValues.length)
    ];
  }

  private spawnPiece(name: string) {
    const piece = this.compPoll.getPrefabNode(name);

    const compPiece = piece.getComponent(Railway);

    compPiece.init(this.speed);

    const coinsArr = piece.getComponentsInChildren(Collectible);
    if (coinsArr.length > 0) {
      for (let index = 0; index < coinsArr.length; index++) {
        const element = coinsArr[index];
        element.node.destroy();
      }
    }

    const enemyArr = piece.getComponentsInChildren(EnemyCtrl);
    if (enemyArr.length > 0) {
      for (let index = 0; index < enemyArr.length; index++) {
        const element = enemyArr[index];
        element.node.destroy();
      }
    }

    const width = piece.getComponent(UITransform)?.contentSize.width ?? 0;

    const length = this.pieces.length;

    const namePrefab = piece.name;

    const arr = [];
    let rand = Math.floor(Math.random() * 100) + 1;
    if (this.render >= 2) {
      if (this.key == KeyMission.MISSION_1) {
        rand = 1;
      }

      if (rand % 2 != 0) {
        for (let i = 1; i <= 3; i++) {
          const coin = instantiate(this.coinPrefab);
          arr.push(coin);
        }
      } else {
        for (let i = 1; i <= 3; i++) {
          const enemy = instantiate(this.enemyPrefab);
          arr.push(enemy);
        }
      }
    }
    this.render++;

    switch (length) {
      case 0: {
        this.positionXStart = -(this.gamePlaytWidth / 2 - width / 2);
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
        if (railway1Width / 2 > this.gamePlaytWidth / 2) {
          this.positionXStart =
            railway2Width +
            (railway1Width / 2 - this.gamePlaytWidth / 2) +
            width / 2;
        } else {
          this.positionXStart =
            railway2Width -
            (this.gamePlaytWidth / 2 - railway1Width / 2) +
            width / 2;
        }
        break;
      }
    }

    switch (namePrefab) {
      case RailwayPrefabName.FLAT: {
        arr.forEach((coin, index) => {
          if (rand % 2 != 0) {
            if (index == 0) {
              coin.setPosition(-150, 60);
            } else if (index % 2) {
              coin.setPosition(150, 60);
            } else {
              coin.setPosition(0, 60);
            }
          } else {
            if (index == 0) {
              coin.setPosition(150, 25);
            } else if (index % 2) {
              coin.setPosition(0, 25);
            } else {
              coin.setPosition(-150, 25);
            }
          }
          piece.addChild(coin);
        });
        piece.setPosition(this.positionXStart, 0, 0);
        break;
      }
      case RailwayPrefabName.UP: {
        arr.forEach((coin, index) => {
          if (rand % 2 != 0) {
            if (index == 0) {
              coin.setPosition(0, 130);
            } else if (index % 2) {
              coin.setPosition(-400, 60);
            } else {
              coin.setPosition(400, 60);
            }
          } else {
            if (index == 0) {
              coin.setPosition(-378, 25);
            } else if (index % 2) {
              coin.setPosition(0, 90);
            } else {
              coin.setPosition(378, 25);
            }
          }
          piece.addChild(coin);
        });
        piece.setPosition(this.positionXStart, 0, 0);
        break;
      }
      case RailwayPrefabName.DOWN: {
        arr.forEach((coin, index) => {
          if (rand % 2 != 0) {
            if (index == 0) {
              coin.setPosition(-370, 60);
            } else if (index % 2) {
              coin.setPosition(0, -10);
            } else {
              coin.setPosition(370, 60);
            }
          } else {
            if (index == 0) {
              coin.setPosition(-378, 25);
            } else if (index % 2) {
              coin.setPosition(0, -45);
            } else {
              coin.setPosition(378, 25);
            }
          }
          piece.addChild(coin);
        });
        piece.setPosition(this.positionXStart, 0, 0);
        break;
      }
      case RailwayPrefabName.UP_AND_DOWN: {
        arr.forEach((coin, index) => {
          if (rand % 2 != 0) {
            if (index == 0) {
              coin.setPosition(-370, 60);
            } else if (index % 2) {
              coin.setPosition(0, 120);
            } else {
              coin.setPosition(370, 60);
            }
          } else {
            if (index == 0) {
              coin.setPosition(-378, 25);
            } else if (index % 2) {
              coin.setPosition(0, 85);
            } else {
              coin.setPosition(378, 25);
            }
          }
          piece.addChild(coin);
        });
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

  public runSpeedUp(speedUp: number, time: number) {
    this.isSpeedUp = true;
    let temp = this.speed;
    this.speed = speedUp;
    this.pieces.forEach((piece) => {
      piece.getComponent(Railway).runSpeedUp(speedUp, time);
      this.speed = speedUp;
    });
    this.scheduleOnce(() => {
      this.speed = temp;
      this.isSpeedUp = false;
    }, time);
  }
}
