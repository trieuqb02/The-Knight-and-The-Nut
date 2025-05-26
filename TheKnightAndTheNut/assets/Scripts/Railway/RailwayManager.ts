import {
  _decorator,
  Component,
  instantiate,
  Node,
  Prefab,
  resources,
  TextAsset,
  UITransform,
  Vec3,
} from "cc";
import { PoollingRailway } from "./PoollingRailway";
import { Collectible } from "../Power Ups/Collectible";
import { EnemyCtrl } from "../Enemy/EnemyCtrl";
import { KeyMission } from "../Mission/Mission";
const { ccclass, property } = _decorator;

@ccclass("RailwayManager")
export class RailwayManager extends Component {
  @property(Node)
  private gamePlayNode: Node = null;

  @property(Node)
  private poolRailways: Node = null;

  @property(Prefab)
  private enemyPrefab: Prefab = null;

  @property(Prefab)
  private coinPrefab: Prefab = null;

  @property(Number)
  private speed: number = 200;

  @property(Number)
  private segmentCount: number = 10;

  @property(Number)
  private timeAppearObstacle: number = 3;

  @property(Number)
  private distantAppearObstacle: number = 3;

  @property(Number)
  private quantityObstacle: number = 4;

  private defaultSpeed: number = 0;

  private compPoll = null;

  private railways: Node[] = [];

  private gamePlaytWidth: number = 0;

  private hasSpawnedNext: boolean = true;

  private isRunning: boolean = false;

  private key: string = "";

  private countTime: number = 0;

  private isSpawnObstacle: boolean = true;

  private count: number = 0;

  private RailwayPrefabValues: string[] = [];

  protected onLoad(): void {
    this.gamePlaytWidth =
      this.gamePlayNode.getComponent(UITransform)?.contentSize.width ?? 0;

    this.compPoll = this.poolRailways.getComponent(PoollingRailway);

    this.defaultSpeed = this.speed;
  }

  protected start(): void {
    this.initRailways();
  }

  protected update(deltaTime: number): void {
    if (this.isRunning) {
      this.checkSpawnNext();
      this.checkRemoveFirst();
      this.railways.forEach((railway) => {
        const pos = railway.getPosition();
        railway.setPosition(pos.x - this.speed * deltaTime, pos.y, pos.z);
      });
    }
  }

  private initRailways(): void {
    let lastEndPoint: Vec3 | null = null;

    const startX = -this.gamePlaytWidth / 2;

    for (let i = 0; i < this.segmentCount; i++) {
      const railway = this.compPoll.getPrefabNode();

      this.gamePlayNode.addChild(railway);

      if (lastEndPoint == null) {
        railway.setPosition(startX, 0);
      } else {
        this.calEPointAndSPoint(railway, lastEndPoint);
      }

      const endPoint = railway.getChildByName("EndPoint");

      lastEndPoint = endPoint.getWorldPosition();

      this.railways.push(railway);
    }
  }

  public startRailway(key: string): void {
    this.isRunning = true;
    this.key = key;

    resources.load(`missions/${this.key}`, TextAsset, (err, asset) => {
      if (err) {
        console.log(err);
        return;
      }
      const content = asset.text;
      this.RailwayPrefabValues = content.split(" ");
    });
  }

  public endRailway(): void {
    this.isRunning = false;
  }

  private checkSpawnNext(): void {
    const piece = this.railways[0];
    if (!this.hasSpawnedNext) return;
    const worldX = piece.getPosition().x;
    if (worldX <= -(this.gamePlaytWidth / 2)) {
      this.spawnRailway();
      this.hasSpawnedNext = false;
    }
  }

  private checkRemoveFirst(): void {
    const railway = this.railways[0];
    if (!railway) return;

    const uiTransform = railway.getComponent(UITransform);
    if (!uiTransform) return;

    const worldRect = uiTransform.getBoundingBoxToWorld();

    if (worldRect.x <= -worldRect.width) {
      this.compPoll.recycleNode(railway);
      this.railways.shift();
      this.hasSpawnedNext = true;
    }
  }

  private spawnRailway(): void {
    const railway = this.compPoll.getPrefabNode();

    const coin = railway.getComponentInChildren(Collectible) ?? null;

    const enemy = railway.getComponentInChildren(EnemyCtrl) ?? null;

    if (coin) {
      coin.node.destroy();
    }

    if (enemy) {
      enemy.node.destroy();
    }

    const railwayType = this.RailwayPrefabValues.shift();

    if (
      this.isSpawnObstacle &&
      this.count >= 0 &&
      this.count < this.quantityObstacle
    ) {
      this.placeObstacle(railway);
      this.count++;
      if (this.count == this.quantityObstacle) {
        this.isSpawnObstacle = this.isSpawnObstacle!;
        this.count = -this.distantAppearObstacle;
      }
    } else {
      this.isSpawnObstacle = this.isSpawnObstacle!;
      this.count++;
    }

    if (railwayType == "U") {
      railway.angle = 45;
    } else if (railwayType == "D") {
      railway.angle = -45;
    } else {
      railway.angle = 0;
    }

    this.gamePlayNode.addChild(railway);

    const lastEndPoint = this.railways[this.railways.length - 1]
      .getChildByName("EndPoint")
      .getWorldPosition();

    this.calEPointAndSPoint(railway, lastEndPoint);

    this.railways.push(railway);
  }

  private placeObstacle(railway: Node): void {
    let obstacle = null;
    let rand = Math.floor(Math.random() * 100) + 1;
    if (this.countTime >= this.timeAppearObstacle) {
      if (this.key == KeyMission.MISSION_1) {
        rand = 1;
      }
      let scaleXCoin = 7;
      let scaleYCoin = 7;
      let scaleZCoin = 7;
      let yCoin = 7;

      let scaleXEnemy = 3;
      let scaleYEnemy = 3;
      let scaleZEnemy = 3;
      let yEnemy = 2.6;
      let randUpOrDown = Math.floor(Math.random() * 100) + 1;
      if (rand % 2 != 0) {
        obstacle = instantiate(this.coinPrefab);
        const parentScale = railway.getScale();

        if (randUpOrDown % 2 != 0) {
          yCoin *= -1;
        }
        obstacle.setScale(
          scaleXCoin / parentScale.x,
          scaleYCoin / parentScale.y,
          scaleZCoin / parentScale.z
        );
        obstacle.setPosition(0, yCoin);
      } else {
        obstacle = instantiate(this.enemyPrefab);
        const parentScale = railway.getScale();

        if (randUpOrDown % 2 != 0) {
          yEnemy *= -1;
          obstacle.angle = -180;
          scaleXEnemy *= -1;
        }

        obstacle.setScale(
          scaleXEnemy / parentScale.x,
          scaleYEnemy / parentScale.y,
          scaleZEnemy / parentScale.z
        );
        obstacle.setPosition(0, yEnemy);
      }
      railway.addChild(obstacle);
    }
    this.countTime++;
  }

  private calEPointAndSPoint(railway: Node, lastEndPoint: Vec3): void {
    const startPoint = railway.getChildByName("StartPoint");

    const startPointWorld = startPoint.getWorldPosition();

    const offset = lastEndPoint.subtract(startPointWorld);

    const currentPos = railway.getPosition();

    railway.setPosition(currentPos.add(offset));
  }

  public runSpeedUp(speedUp: number, time: number): void {
    this.speed = speedUp;
    this.scheduleOnce(() => {
      this.speed = this.defaultSpeed;
    }, time);
  }
}
