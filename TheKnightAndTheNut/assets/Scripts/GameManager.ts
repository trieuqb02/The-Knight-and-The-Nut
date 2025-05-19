import {
  _decorator,
  Button,
  Component,
  director,
  instantiate,
  Label,
  Node,
  Prefab,
  ProgressBar,
  Sprite,
  SpriteFrame,
} from "cc";
import { DataManager } from "./DataManager";
import { RailwayManager } from "./Railway/RailwayManager";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Node)
  railwayManager: Node = null;

  @property(Node)
  gamePlay: Node = null;

  @property(Prefab)
  scorePrefab: Prefab = null;

  @property(Prefab)
  timerPrefab: Prefab = null;

  @property(Prefab)
  resultPrefab: Prefab = null;

  @property(SpriteFrame)
  winPriteFrame: SpriteFrame = null;

  @property(SpriteFrame)
  loseSpriteFrame: SpriteFrame = null;

  @property(Prefab)
  btn: Prefab = null;

  timerProgress = null;

  scoreLB = null;

  private key: string = "";

  private totalTime: number = 10;

  private timeLeft: number = 0;

  private railwayComp = null;

  private totalScore: number = 0;

  private winScore: number = 0;

  init() {
    const score = instantiate(this.scorePrefab);
    this.scoreLB = score.getChildByName("Label").getComponent(Label);

    const timer = instantiate(this.timerPrefab);
    this.timerProgress = timer
      .getChildByName("TimerProgressBar")
      .getComponent(ProgressBar);

    score.setPosition(0, 280);
    timer.setPosition(400, 280);

    this.gamePlay.addChild(score);
    this.gamePlay.addChild(timer);
  }

  resetTimer() {
    this.timeLeft = this.totalTime;
    this.timerProgress.progress = this.totalTime;
    this.scoreLB.string = `${this.totalScore}`;
  }

  protected onLoad(): void {
    this.init();
    this.resetTimer();
    this.railwayComp = this.railwayManager.getComponent(RailwayManager);
  }

  protected start(): void {
    const data = DataManager.instance.getData();
    this.key = data.key;
    this.winScore = data.score;
    const gamePlayComp = this.gamePlay.getComponent(Sprite);
    gamePlayComp.spriteFrame = data.spriteFrame;
    this.railwayComp.startRailway(this.key);
  }

  protected update(dt: number): void {
    this.timeLeft -= dt;
    const progress = this.timeLeft / this.totalTime;
    this.timerProgress.progress = progress;

    if (this.timeLeft <= 0) {
      this.onTimeUp();
    }
  }

  updateScore(score: number) {
    this.totalScore += score;
    this.scoreLB.string = `${this.totalScore}`;
  }

  protected onTimeUp() {
    this.railwayComp.endRailway();
    const result = instantiate(this.resultPrefab);
    if (this.totalScore > this.winScore) {
      result.getComponent(Sprite).spriteFrame = this.winPriteFrame;
    } else {
      result.getComponent(Sprite).spriteFrame = this.loseSpriteFrame;
    }

    const button = result.getChildByName("Button").getComponent(Button);
    const buttonHome = result.getChildByName("HomeBtn").getComponent(Button);

    if (this.totalScore < this.winScore) {
      button.node.getComponent(Sprite).spriteFrame = this.loseSpriteFrame;
    }
    button.node.on(Button.EventType.CLICK, this.onClickButton, this);
    buttonHome.node.on(Button.EventType.CLICK, this.onClickHome, this);

    result
      .getChildByName("Score")
      .getComponent(Label).string = `Score: ${this.totalScore}`;
    result.setPosition(0, 0);
    this.gamePlay.addChild(result);
  }

  onClickHome() {
    if (this.totalScore > this.winScore) {
      const stored = localStorage.getItem("FINISH_MISSION");
      let mission: string[] = stored ? JSON.parse(stored) : [];
      mission.push(this.key);
      localStorage.setItem("FINISH_MISSION", JSON.stringify(mission));
    }
    director.loadScene("MenuScene");
  }

  onClickButton() {
    console.log(1);
  }
}
