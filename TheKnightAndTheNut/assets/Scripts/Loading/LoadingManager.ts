import { _decorator, AudioClip, Component, director, Node, ProgressBar } from "cc";
import { AudioManager } from "../Audio/AudioManager";
import { SceneTransitionManager } from "../SceneTransitionManager";
const { ccclass, property } = _decorator;

@ccclass("LoadingManager")
export class LoadingManager extends Component {
  private _fakeProgress: number = 0;
  private _isLoading: boolean = false;

  @property(ProgressBar)
  progressBar: ProgressBar = null;

  protected start(): void {
    AudioManager.instance.stopBGM();
    const menuClip = AudioManager.instance.getMenuClip();
    AudioManager.instance.playBGM(menuClip);
    
    const nextScene = SceneTransitionManager.getNextScene();
    this.loadSceneWithLoading(nextScene);
  }

  update(deltaTime: number) {
    if (this._isLoading && this._fakeProgress <= 0.95) {
      this._fakeProgress += deltaTime * 0.3;
      if (this._fakeProgress >  0.95) {
        this._fakeProgress =  0.95;
      }
      this.progressBar.progress = this._fakeProgress;
    } else if(this._isLoading && this._fakeProgress == 1){
        this.progressBar.progress = this._fakeProgress;
    }
  }

  showLoading(callBack?: () => void) {
    this._isLoading = true;
    callBack();
  }

  loadSceneWithLoading(sceneName: string) {
    this.showLoading(() => {
      director.preloadScene(sceneName, () => {
        this.progressBar.progress = 1;
        this._fakeProgress = 1;
        this.scheduleOnce(() => {
            director.loadScene(sceneName);
        }, 0.2)
      });
    });
  }
}
