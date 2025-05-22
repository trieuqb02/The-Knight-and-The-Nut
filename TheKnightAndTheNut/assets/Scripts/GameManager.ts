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
  Animation,
  AnimationClip,
  UITransform,
  AudioClip,
} from "cc";
import { DataManager } from "./DataManager";
import { RailwayManager } from "./Railway/RailwayManager";
import { KeyMission } from "./Mission/Mission";
import { SceneTransitionManager } from "./SceneTransitionManager";
import { AudioManager } from "./AudioManager";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Node)
  railwayManager: Node = null;

  @property(Node)
  gamePlay: Node = null;

  @property(Node)
  player: Node = null;

  @property(Node)
  boss: Node = null;

  @property(Prefab)
  scorePrefab: Prefab = null;

  @property(Prefab)
  timerPrefab: Prefab = null;

  @property(Prefab)
  resultPrefab: Prefab = null;

  @property(Prefab)
  healthPrefab: Prefab = null;

  @property(Prefab)
  powerPrefab: Prefab = null;

  @property(SpriteFrame)
  winPriteFrame: SpriteFrame = null;

  @property(SpriteFrame)
  loseSpriteFrame: SpriteFrame = null;

  @property(Node)
  background: Node = null;

  @property(SpriteFrame)
  blackHeald: SpriteFrame = null;

  @property(SpriteFrame)
  power0: SpriteFrame = null;
  @property(SpriteFrame)
  power1: SpriteFrame = null;
  @property(SpriteFrame)
  power2: SpriteFrame = null;
  @property(SpriteFrame)
  power3: SpriteFrame = null;
  @property(SpriteFrame)
  power4: SpriteFrame = null;

  @property(AudioClip)
  audioBGClip: AudioClip = null;

  powerComp = null;

  timerProgress = null;

  scoreLB = null;

  private key: string = "";

  private totalTime: number = 0;

  private timeLeft: number = 0;

  private railwayComp = null;

  private totalScore: number = 3000;

  private winScore: number = 0;

  private idlPlayer: boolean = false;

  private isHealthInit: boolean = true;

  private healthArr: any[] = [];

  private isPlay: boolean = false;

  private isBoss: boolean = false;

  init() {
    AudioManager.instance.stopBGM();
    AudioManager.instance.playBGM(this.audioBGClip);
    const score = instantiate(this.scorePrefab);
    this.scoreLB = score.getChildByName("Label").getComponent(Label);

    const timer = instantiate(this.timerPrefab);
    this.timerProgress = timer
      .getChildByName("TimerProgressBar")
      .getComponent(ProgressBar);

    const power = instantiate(this.powerPrefab);

    this.powerComp = power.getComponent(Sprite);

    this.powerComp.spriteFrame = this.power0;

    score.setPosition(-350, 280);
    timer.setPosition(400, 280);
    power.setPosition(-20, 280);

    this.gamePlay.addChild(power);
    this.gamePlay.addChild(score);
    this.gamePlay.addChild(timer);
    if (!this.idlPlayer) {
      director.resume();
    }
  }

  displayHealth(curHealth: number) {
    if (this.isHealthInit) {
      for (let index = 1; index <= curHealth; index++) {
        const health = instantiate(this.healthPrefab);
        const withGamePlay =
          this.gamePlay.getComponent(UITransform)?.contentSize.width ?? 0;
        health.setPosition(-(withGamePlay / 2) + index * 40, 280);
        this.gamePlay.addChild(health);
        this.healthArr.push(health);
      }
      this.isHealthInit = false;
    } else {
      this.healthArr[curHealth].getComponent(Sprite).spriteFrame =
        this.blackHeald;
    }
  }

  displayPower(curPower: number) {
    switch (curPower) {
      case 1: {
        this.powerComp.spriteFrame = this.power1;
        break;
      }
      case 2: {
        this.powerComp.spriteFrame = this.power2;
        break;
      }
      case 3: {
        this.powerComp.spriteFrame = this.power3;
        break;
      }
      case 4: {
        this.powerComp.spriteFrame = this.power4;
        break;
      }
    }
  }

  playPower(time: number) {
    const anim = this.powerComp.node.getComponent(Animation);
    const [idleClip] = anim.clips;
    const idleState = anim.getState(idleClip.name);
    const clipDuration = idleState.duration;
    const targetDuration = time;
    idleState.speed = clipDuration / targetDuration;
    anim.play("power-bar");
    this.powerComp.spriteFrame = this.power0;
  }

  gameOver() {
    this.idlPlayer = true;
    this.isPlay = false;
    this.scheduleOnce(() => {
      this.onTimeUp();
    }, 2);
  }

  reset() {
    const data = DataManager.instance.getData();
    this.totalTime = data.time;
    this.winScore = data.score;
    this.timeLeft = this.totalTime;
    this.timerProgress.progress = this.totalTime;
    this.scoreLB.string = `${this.totalScore}`;
    this.key = data.key;

    const backgroundComp = this.background.getComponent(Sprite);
    backgroundComp.spriteFrame = data.image;
  }

  protected onLoad(): void {
    this.init();
    this.reset();
  }

  protected start(): void {
    this.railwayComp = this.railwayManager.getComponent(RailwayManager);
    this.railwayComp.startRailway(this.key);
    this.isPlay = true;
  }

  protected update(dt: number): void {
    if (this.isPlay) {
      this.timeLeft -= dt;
      const progress = this.timeLeft / this.totalTime;
      this.timerProgress.progress = progress;

      if (this.key == KeyMission.MISSION_3 && !this.isBoss) {
        if (this.totalScore >= 3000) {
          this.boss.active = true;
          this.isBoss = true;
        }
      }

      if (this.timeLeft <= 0) {
        this.isPlay = false;
        this.onTimeUp();
      }
    }
  }

  updateScore(score: number) {
    this.totalScore += score;
    this.scoreLB.string = `${this.totalScore}`;
  }

  protected onTimeUp() {
    director.pause();
    this.railwayComp.endRailway();
    const result = instantiate(this.resultPrefab);
    if (this.totalScore > this.winScore && !this.idlPlayer) {
      result.getComponent(Sprite).spriteFrame = this.winPriteFrame;
    } else if (this.totalScore > this.winScore && this.idlPlayer) {
      result.getComponent(Sprite).spriteFrame = this.loseSpriteFrame;
    } else {
      result.getComponent(Sprite).spriteFrame = this.loseSpriteFrame;
    }

    const button = result.getChildByName("Button").getComponent(Button);
    const buttonHome = result.getChildByName("HomeBtn").getComponent(Button);

    const missionList = DataManager.instance.getMissionList();
    const index = missionList.findIndex((item) => item.key === this.key);

    if (this.totalScore < this.winScore) {
      button.node.getChildByName("Label").getComponent(Label).string = "Replay";
    }

    if (index == missionList.length - 1) {
      button.node.getChildByName("Label").getComponent(Label).string = "Replay";
    }

    if (this.idlPlayer) {
      button.node.getChildByName("Label").getComponent(Label).string = "Replay";
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
      this.saveLocalData();
    }
    SceneTransitionManager.setNextScene("MenuScene");
    director.resume();
    director.loadScene("LoadingScene");
  }

  onClickButton() {
    director.resume();
    const missionList = DataManager.instance.getMissionList();
    const index = missionList.findIndex((item) => item.key === this.key);
    if (index == missionList.length - 1) {
      this.saveLocalData();
      const currentScene = director.getScene();
      const sceneName = currentScene.name;
      director.loadScene(sceneName);
    }

    if (this.totalScore > this.winScore && !this.idlPlayer) {
      missionList.forEach((mission, index) => {
        if (mission.key === this.key) {
          if (index != missionList.length - 1) {
            DataManager.instance.setData(missionList[index + 1]);
            this.saveLocalData();
            const currentScene = director.getScene();
            const sceneName = currentScene.name;
            director.loadScene(sceneName);
          }
        }
      });
    } else {
      const currentScene = director.getScene();
      const sceneName = currentScene.name;
      director.loadScene(sceneName);
    }
  }

  saveLocalData() {
    const stored = localStorage.getItem("FINISH_MISSION");
    let mission: string[] = stored ? JSON.parse(stored) : [];
    mission.push(this.key);
    localStorage.setItem("FINISH_MISSION", JSON.stringify(mission));
  }
}
