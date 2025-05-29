import { _decorator, Component, Slider } from "cc";
import { AudioManager } from "./Audio/AudioManager";

const { ccclass } = _decorator;

@ccclass("BaseAudio")
export class BaseAudio extends Component {
  protected onSliderChangeBG(slider: Slider) {
    const value = slider.progress;
    AudioManager.instance.setBgmVolume(value);
  }

  protected onSliderChangeSFX(slider: Slider) {
    const value = slider.progress;
    AudioManager.instance.setSfxVolume(value);
  }

  protected getVolumGB() {
    return AudioManager.instance.getBgmVolume();
  }

  protected getVolumSFX() {
    return AudioManager.instance.getSfxVolume();
  }
}
