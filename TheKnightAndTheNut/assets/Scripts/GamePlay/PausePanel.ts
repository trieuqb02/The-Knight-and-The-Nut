import { _decorator, Component, director, Node, Slider } from "cc";
import { SceneTransitionManager } from "../SceneTransitionManager";
import { SceneEnum } from "../Enum/SceneEnum";
import { BaseAudio } from "../BaseAudio";
const { ccclass, property } = _decorator;

@ccclass("PausePanel")
export class PausePanel extends BaseAudio {
  @property(Node)
  pausePanel: Node = null;

  @property(Slider)
  sliderBG: Slider = null;

  @property(Slider)
  sliderSFX: Slider = null;

  protected onLoad(): void {
    this.sliderBG.progress = this.getVolumGB();
    this.sliderSFX.progress = this.getVolumSFX();
  }

  private clickPauseGame(): void {
    this.pausePanel.active = true;
    director.pause();
  }

  private clickResumeGame(): void {
    this.pausePanel.active = false;
    director.resume();
  }

  private clickMenu(): void {
    this.pausePanel.active = false;
    director.resume();
    SceneTransitionManager.setNextScene(SceneEnum.MENU);
    director.loadScene(SceneEnum.LOADING);
  }

  private clickReplay(): void {
    this.pausePanel.active = false;
    const currentScene = director.getScene();
    const sceneName = currentScene.name;
    director.loadScene(sceneName);
  }
}
