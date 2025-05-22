import {
  _decorator,
  Component,
  director,
  AudioSource,
  Node,
  AudioClip,
} from "cc";
const { ccclass } = _decorator;

@ccclass("AudioManager")
export class AudioManager extends Component {
  private static _instance: AudioManager;

  public bgmSource: AudioSource = null!;
  public sfxSource: AudioSource = null!;

  onLoad() {
    if (AudioManager._instance) {
      this.destroy();
      return;
    }
    console.log("AudioManager loaded");
    this.node.parent = null;
    AudioManager._instance = this;
    director.addPersistRootNode(this.node);

    const bgmNode = this.node.getChildByName("BGM");
    const sfxNode = this.node.getChildByName("SFX");

    if (bgmNode && sfxNode) {
      this.bgmSource = bgmNode.getComponent(AudioSource)!;
      this.sfxSource = sfxNode.getComponent(AudioSource)!;
    } else {
      console.error("Không tìm thấy node BGM hoặc SFX!");
    }
  }

  static get instance(): AudioManager {
    return this._instance;
  }

  playBGM(clip: AudioClip) {
    if (this.bgmSource) {
      if (this.bgmSource.playing) {
        this.bgmSource.stop();
      }
      this.bgmSource.clip = clip;
      this.bgmSource.loop = true;
      this.bgmSource.play();
    }
  }

  playSFX(clip: AudioClip) {
    if (this.sfxSource) {
      this.sfxSource.playOneShot(clip);
    }
  }

  stopBGM() {
    if (this.bgmSource && this.bgmSource.playing) {
      this.bgmSource.stop();
    }
  }

  stopSFX() {
    if (this.sfxSource && this.sfxSource.playing) {
      this.sfxSource.stop();
    }
  }

  stopAll() {
    this.stopBGM();
    this.stopSFX();
  }
}
