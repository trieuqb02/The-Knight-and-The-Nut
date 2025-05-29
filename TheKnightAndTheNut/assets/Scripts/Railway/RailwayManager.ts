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
import { RuleEnum } from "../Enum/RuleEnum";
import { DataManager } from "../DataManager";
import { PowerUp } from "../Power Ups/PowerUp";
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
  private magnetPrefeb: Prefab = null;

  @property(Prefab)
  private shielPrefab: Prefab = null;

  @property(Prefab)
  private coinPrefab: Prefab = null;

  @property(Number)
  private speed: number = 200;

  @property(Number)
  private segmentCount: number = 10;

  private defaultSpeed: number = 0;

  private compPoll = null;

  private railways: Node[] = [];

  private gamePlaytWidth: number = 0;

  private hasSpawnedNext: boolean = true;

  private isRunning: boolean = false;

  private key: string = "";

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

    const po_up = railway.getComponentInChildren(PowerUp) ?? null;

    if(po_up){
      po_up.node.destroy();
    }

    if (coin) {
      coin.node.destroy();
    }

    if (enemy) {
      enemy.node.destroy();
    }


    let railwayType = this.RailwayPrefabValues.shift();

    if (railwayType && railwayType.length >= 4) {
      const type = railwayType[0];
      const position = railwayType[1] + railwayType[2];

      const skills = DataManager.instance.getSkills();
      const checkSkill = skills.find(skill => {
        return skill === railwayType[0];
      }) 
      if(checkSkill){
        this.placeObstacle(railway, type, position);
      } else if(railwayType[0] != RuleEnum.MAGNET_PW && railwayType[0] != RuleEnum.SHIEL_PW) {
        this.placeObstacle(railway, type, position);
      }
      railwayType = railwayType[3];
    }

    if (railwayType == RuleEnum.RAILWAY_ROTATION_UP) {
      railway.angle = 45;
    } else if (railwayType == RuleEnum.RAILWAY_ROTATION_DOWN) {
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

  private placeObstacle(railway: Node, type: string, position: string): void {
    let obstacle = null;
    if (type == RuleEnum.COINS) {
      let scaleXCoin = 7;
      let scaleYCoin = 7;
      let scaleZCoin = 7;
      let yCoin = 7;

      obstacle = instantiate(this.coinPrefab);
      const parentScale = railway.getScale();

      switch (position) {
        case RuleEnum.DOWN + RuleEnum.SHORT: {
          yCoin *= -1;
          break;
        }
        case RuleEnum.DOWN + RuleEnum.TALL: {
          yCoin *= -3;
          break;
        }
        case RuleEnum.UP + RuleEnum.SHORT: {
          yCoin += 1;
          break;
        }
        case RuleEnum.UP + RuleEnum.TALL: {
          yCoin *= 3;
          break;
        }
      }

      obstacle.setScale(
        scaleXCoin / parentScale.x,
        scaleYCoin / parentScale.y,
        scaleZCoin / parentScale.z
      );
      obstacle.setPosition(0, yCoin);
    } else if (type == RuleEnum.ENEMY) {
      let scaleXEnemy = 3;
      let scaleYEnemy = 3;
      let scaleZEnemy = 3;
      let yEnemy = 2.6;

      obstacle = instantiate(this.enemyPrefab);
      const parentScale = railway.getScale();

      switch (position) {
        case RuleEnum.DOWN + RuleEnum.SHORT: {
          yEnemy *= -1;
          obstacle.angle = -180;
          scaleXEnemy *= -1;
          break;
        }
      }

      obstacle.setScale(
        scaleXEnemy / parentScale.x,
        scaleYEnemy / parentScale.y,
        scaleZEnemy / parentScale.z
      );
      obstacle.setPosition(0, yEnemy);
    } else if (type == RuleEnum.SHIEL_PW){
      obstacle = instantiate(this.shielPrefab);
      let yMagnet = 7;
      switch (position) {
        case RuleEnum.DOWN + RuleEnum.SHORT: {
          yMagnet *= -1;
          break;
        }
        case RuleEnum.DOWN + RuleEnum.TALL: {
          yMagnet *= -3;
          break;
        }
        case RuleEnum.UP + RuleEnum.SHORT: {
          yMagnet += 1;
          break;
        }
        case RuleEnum.UP + RuleEnum.TALL: {
          yMagnet *= 3;
          break;
        }
      }
      obstacle.setPosition(0, yMagnet);
    } else if (type == RuleEnum.MAGNET_PW){
      obstacle = instantiate(this.magnetPrefeb);
      let yShile = 7;
      switch (position) {
        case RuleEnum.DOWN + RuleEnum.SHORT: {
          yShile *= -1;
          break;
        }
        case RuleEnum.DOWN + RuleEnum.TALL: {
          yShile *= -3;
          break;
        }
        case RuleEnum.UP + RuleEnum.SHORT: {
          yShile += 1;
          break;
        }
        case RuleEnum.UP + RuleEnum.TALL: {
          yShile *= 3;
          break;
        }
      }
      obstacle.setPosition(0, yShile);
    }
    railway.addChild(obstacle);
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
