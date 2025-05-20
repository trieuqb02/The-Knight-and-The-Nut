import {
  _decorator,
  Component,
  director,
  Node,
  UITransform,
} from "cc";
import { KeyMission } from "../Mission/Mission";
import { Railway } from "./Railway";
import { PoollingRailway, RailwayPrefabName } from "./PoollingRailway";
const { ccclass, property } = _decorator;

@ccclass("RailwayManager")
export class RailwayManager extends Component {

  @property(Node)
  gamePlayNode: Node = null;

  @property(Node)
  poolRailways: Node = null;

  @property()
  speed: number = 0;

  private compPoll = null;

  private positionYOfRailSlopeUP: number = -15;

  private positionYOfRailSlopeDown: number = 15;

  private pieces: Node[] = [];

  private gamePlaytWidth: number = 0;

  private positionXStart: number = 0;

  private hasSpawnedNext = true;

  private isRunning: boolean = false;

  private isSpeedUp: boolean = false;

  onLoad(): void {

    this.gamePlaytWidth = this.gamePlayNode.getComponent(UITransform)?.contentSize.width ?? 0;

    this.compPoll = this.poolRailways.getComponent(PoollingRailway);

  }

  startRailway(key: string) {
    this.isRunning = true;
    switch (key) {
      case KeyMission.MISSION_1: {
        this.spawnPiece(RailwayPrefabName.FLAT);
        this.spawnPiece(RailwayPrefabName.UP);
        break
      }
      case KeyMission.MISSION_2: {
        this.spawnPiece(RailwayPrefabName.FLAT);
        this.spawnPiece(RailwayPrefabName.UP);
        break
      }
      case KeyMission.MISSION_3: {
        this.spawnPiece(RailwayPrefabName.FLAT);
        this.spawnPiece(RailwayPrefabName.UP);
        break
      }
    }

  }

  endRailway() {
    this.isRunning = false;
    this.pieces.forEach(piece => {
      const compPiece = piece.getComponent(Railway);
      compPiece.init(0);
    })
  }

  start(): void { }

  update(deltaTime: number): void {
    if (this.isRunning) {
      this.checkSpawnNext();
      this.checkRemoveFirst();
      if(!this.isSpeedUp){
        this.pieces.forEach(piece => {
          piece.getComponent(Railway).init(this.speed);
        })
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
      this.compPoll.recycleNode(piece)
      this.pieces.shift();
      this.hasSpawnedNext = true;
    }
  }

  private RailwayPrefabValues: RailwayPrefabName[] = [
    RailwayPrefabName.FLAT,
    RailwayPrefabName.UP,
    RailwayPrefabName.DOWN,
    RailwayPrefabName.UP_AND_DOWN
  ];

  private getRandomPrefabName(): RailwayPrefabName {
    return this.RailwayPrefabValues[Math.floor(Math.random() * this.RailwayPrefabValues.length)];
  }

  private spawnPiece(name: string) {

    const piece = this.compPoll.getPrefabNode(name);

    const compPiece = piece.getComponent(Railway);
    compPiece.init(this.speed);

    const width = piece.getComponent(UITransform)?.contentSize.width ?? 0;

    const length = this.pieces.length;

    const namePrefab = piece.name;

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
        piece.setPosition(this.positionXStart, 0, 0);
        break;
      }
      case RailwayPrefabName.UP: {
        piece.setPosition(this.positionXStart, this.positionYOfRailSlopeUP, 0);
        break;
      }
      case RailwayPrefabName.DOWN: {
        piece.setPosition(
          this.positionXStart,
          this.positionYOfRailSlopeDown,
          0
        );
        break;
      }
      case RailwayPrefabName.UP_AND_DOWN: {
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
    const temp = this.speed;
    this.speed = speedUp;
    this.pieces.forEach(piece => {
      piece.getComponent(Railway).runSpeedUp(speedUp, time);
      this.speed = speedUp;
    })
    this.scheduleOnce(() => {
      this.speed = temp;
      this.isSpeedUp = false;
    }, time);
  }
}
