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
  UITransform,
  AudioClip,
  Color,
} from "cc";
import { DataManager } from "./DataManager";
import { RailwayManager } from "./Railway/RailwayManager";
import { SceneTransitionManager } from "./SceneTransitionManager";

import { SceneEnum } from "./Enum/SceneEnum";
import { AudioManager } from "./Audio/AudioManager";
import { KeyMission } from "./Enum/KeyMission";
import { KeyLocalStore } from "./Enum/KeyLocalStore";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Node)
  private railwayManager: Node = null;

  @property(Node)
  private gamePlay: Node = null;

  @property(Node)
  private boss: Node = null;

  @property(Prefab)
  private scorePrefab: Prefab = null;

  @property(Prefab)
  private timerPrefab: Prefab = null;

  @property(Prefab)
  private resultPrefab: Prefab = null;

  @property(Prefab)
  private healthPrefab: Prefab = null;

  @property(Prefab)
  private powerPrefab: Prefab = null;

  @property(SpriteFrame)
  private winPriteFrame: SpriteFrame = null;

  @property(SpriteFrame)
  private loseSpriteFrame: SpriteFrame = null;

  @property(Node)
  private background: Node = null;

  @property(SpriteFrame)
  private blackHeald: SpriteFrame = null;

  @property(SpriteFrame)
  private power0: SpriteFrame = null;

  @property(SpriteFrame)
  private power1: SpriteFrame = null;

  @property(SpriteFrame)
  private power2: SpriteFrame = null;

  @property(SpriteFrame)
  private power3: SpriteFrame = null;

  @property(SpriteFrame)
  private power4: SpriteFrame = null;

  @property(AudioClip)
  audioBGClip: AudioClip = null;

  private powerComp = null;

  private timerProgress = null;

  private scoreLB = null;

  private key: string = "";

  private totalTime: number = 0;

  private timeLeft: number = 0;

  private railwayComp = null;

  private totalScore: number = 0;

  private winScore: number = 0;

  private idlPlayer: boolean = false;

  private isHealthInit: boolean = true;

  private healthArr: any[] = [];

  private isPlay: boolean = false;

  private isBoss: boolean = false;

  private totalGlod: number = 0;

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

      const sprite = this.timerProgress.barSprite;
            if (sprite) {
                if (progress <= 0.3) {
                    sprite.color = new Color(255, 0, 0);
                } else if (progress <= 0.6) {
                    sprite.color = new Color(255, 255, 0);
                }
            }

      if (this.key == KeyMission.MISSION_3 && !this.isBoss) {
        if (this.totalScore >= 200) {
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

  private init(): void {
    AudioManager.instance.stopBGM();
    AudioManager.instance.playBGM(this.audioBGClip);

    this.setupUI();

    if (!this.idlPlayer) {
      director.resume();
    }
  }

  private setupUI(): void {
    const score = instantiate(this.scorePrefab);
    this.scoreLB = score.getChildByName("Label").getComponent(Label);

    const timer = instantiate(this.timerPrefab);
    this.timerProgress = timer
      .getChildByName("TimerProgressBar")
      .getComponent(ProgressBar);

    const power = instantiate(this.powerPrefab);

    this.powerComp = power.getComponent(Sprite);

    this.powerComp.spriteFrame = this.power0;

    score.setPosition(-380, 280);
    timer.setPosition(330, 280);
    power.setPosition(-80, 280);

    this.gamePlay.addChild(power);
    this.gamePlay.addChild(score);
    this.gamePlay.addChild(timer);
  }

  public displayHealth(curHealth: number): void {
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

  public displayPower(curPower: number): void {
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

  public playPower(time: number): void {
    const anim = this.powerComp.node.getComponent(Animation);
    const [idleClip] = anim.clips;
    const idleState = anim.getState(idleClip.name);
    const clipDuration = idleState.duration;
    const targetDuration = time;
    idleState.speed = clipDuration / targetDuration;
    anim.play("power-bar");
    this.powerComp.spriteFrame = this.power0;
  }

  public gameOver(): void {
    this.idlPlayer = true;
    this.isPlay = false;
    this.scheduleOnce(() => {
      this.onTimeUp();
    }, 0);
  }

  private reset(): void {
    const data = DataManager.instance.getData();
    this.totalTime = data.time;
    this.winScore = data.score;
    this.timeLeft = this.totalTime;
    this.timerProgress.progress = this.totalTime;
    this.scoreLB.string = `${this.totalScore}/${this.winScore}`;
    this.key = data.key;

    const backgroundComp = this.background.getComponent(Sprite);
    backgroundComp.spriteFrame = data.image;
  }

  public updateScore(score: number): void {
    this.totalScore += score;
    this.scoreLB.string = `${this.totalScore}/${this.winScore}`;
  }

  public receiveGold(gold: number): void {
    this.totalGlod += gold;
  }

  protected onTimeUp(): void {
    director.pause();

    const user = DataManager.instance.getUser();
    user.gold += this.totalGlod;
    DataManager.instance.setUser(user);

    this.railwayComp.endRailway();

    this.handleResult();
  }

  private handleResult(): void {
    const result = instantiate(this.resultPrefab);

    if (this.totalScore >= this.winScore && !this.idlPlayer) {
      result.getComponent(Sprite).spriteFrame = this.winPriteFrame;
    } else if (this.totalScore >= this.winScore && this.idlPlayer) {
      result.getComponent(Sprite).spriteFrame = this.loseSpriteFrame;
    } else {
      result.getComponent(Sprite).spriteFrame = this.loseSpriteFrame;
    }

    const buttonNext = result.getChildByName("Button").getComponent(Button);
    const buttonHome = result.getChildByName("HomeBtn").getComponent(Button);

    const missionList = DataManager.instance.getMissionList();
    const index = missionList.findIndex((item) => item.key === this.key);

    if (this.totalScore < this.winScore) {
      buttonNext.node.getChildByName("Label").getComponent(Label).string =
        "Replay";
    }

    if (index == missionList.length - 1) {
      buttonNext.node.getChildByName("Label").getComponent(Label).string =
        "Replay";
    }

    if (this.idlPlayer) {
      buttonNext.node.getChildByName("Label").getComponent(Label).string =
        "Replay";
    }

    result
      .getChildByName("Score")
      .getComponent(Label).string = `Score: ${this.totalScore}`;

    result.setPosition(0, 0);
    this.gamePlay.addChild(result);

    buttonNext.node.on(Button.EventType.CLICK, this.onClickNext, this);
    buttonHome.node.on(Button.EventType.CLICK, this.onClickHome, this);
  }

  private onClickHome(): void {
    if (this.totalScore >= this.winScore && !this.idlPlayer) {
      this.saveLocalData();
    }
    director.resume();
    SceneTransitionManager.setNextScene(SceneEnum.MENU);
    director.loadScene(SceneEnum.LOADING);
  }

  private onClickNext(): void {
    director.resume();
    const missionList = DataManager.instance.getMissionList();
    const index = missionList.findIndex((item) => item.key === this.key);
    if (index == missionList.length - 1) {
      this.saveLocalData();
      const currentScene = director.getScene();
      const sceneName = currentScene.name;
      director.loadScene(sceneName);
    }

    if (this.totalScore >= this.winScore && !this.idlPlayer) {
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

  private saveLocalData(): void {
    const stored = localStorage.getItem(KeyLocalStore.FINISH_MISSION);
    let mission: string[] = stored ? JSON.parse(stored) : [];
    mission.push(this.key);
    localStorage.setItem(KeyLocalStore.FINISH_MISSION, JSON.stringify(mission));

    const user = DataManager.instance.getUser();

    const missionNumber = parseInt(this.key.replace(KeyMission.MISSION, ""));

    const firebase = (window as any).FirebaseBundle;

    const userA = firebase.getUser(user.name);
    if (missionNumber >= userA.mission && this.totalScore > userA.score) {
      firebase.updateData(`users/${user.name}`, {
        name: user.name,
        score: this.totalScore,
        mission: missionNumber,
      });
    } else {
      firebase.updateData(`users/${user.name}`, {
        name: user.name,
        score: this.totalScore,
        mission: missionNumber,
      });
    }
  }
}
