import { _decorator, Component, Node, Slider } from "cc";
import { BaseAudio } from "../BaseAudio";
const { ccclass, property } = _decorator;

@ccclass("SettingManager")
export class SettingManager extends BaseAudio {
  @property(Slider)
  sliderBG: Slider = null;

  @property(Slider)
  sliderSFX: Slider = null;

  protected onLoad(): void {
    this.sliderBG.progress = this.getVolumGB();
    this.sliderSFX.progress = this.getVolumSFX();
  }
}
