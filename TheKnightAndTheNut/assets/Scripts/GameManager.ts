import { _decorator, Component, director, instantiate, Node, Prefab, Sprite } from 'cc';
import { DataManager } from './DataManager';
import { RailwayManager } from './Railway/RailwayManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(Node)
    railwayManager: Node = null;

    @property(Node)
    gamePlay: Node = null;

    @property(Prefab)
    scorePrefab: Prefab = null;

    @property(Prefab)
    timerPrefab: Prefab = null;

    timerProgress = null;

    scoreLB = null;

    private key: string = "";

    private totalTime: number = 10;

    private timeLeft: number = 0;

    private railwayComp = null;

    private totalScore = 0;

    init(){
        console.log(1)
        const score = instantiate(this.scorePrefab);
        // this.scoreLB = score.getComponent("Label")

        console.log(score)

        const timer = instantiate(this.timerPrefab);
        // this.timerProgress = timer.getComponent("TimerProgressBar")

        console.log(timer)
    }

    resetTimer() {
        this.timeLeft = this.totalTime;
        this.timerProgress.progress = this.totalTime;
    }

    protected onLoad(): void {
        this.init()
        this.resetTimer();
        this.railwayComp = this.railwayManager.getComponent(RailwayManager);
    }

    protected start(): void {

        const data = DataManager.instance.getData();
        this.key = data.key;
        const gamePlayComp = this.gamePlay.getComponent(Sprite);
        gamePlayComp.spriteFrame = data.spriteFrame;
        this.railwayComp.startRailway(this.key);
    }

    protected update(dt: number): void {
        this.timeLeft -= dt;
        const progress = this.timeLeft / this.totalTime;
        this.timerProgress.progress = progress;

        if(this.timeLeft <= 0){
            this.onTimeUp();
        }
    }

    updateScore(score: number){
        this.totalScore += score;
        this.scoreLB.string = `${this.totalScore}`;
    }

    protected onTimeUp() {
        this.railwayComp.endRailway()
    }

    finishMission() {
        const stored = localStorage.getItem("FINISH_MISSION");
        let mission: string[] = stored ? JSON.parse(stored) : [];
        mission.push(this.key)
        localStorage.setItem("FINISH_MISSION", JSON.stringify(mission));
        director.loadScene("MenuScene");
    }
}

