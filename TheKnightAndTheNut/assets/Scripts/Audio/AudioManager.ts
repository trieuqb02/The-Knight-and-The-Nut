import { _decorator, Component, director, AudioSource, AudioClip } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AudioManager")
export class AudioManager extends Component {
  @property(AudioClip)
  mainClip: AudioClip = null;

  @property(AudioClip)
  clickButtonClip: AudioClip = null;

  @property(AudioClip)
  menuClip: AudioClip = null;

  @property(AudioClip)
  reverseSound: AudioClip = null;
  @property(AudioClip)
  coinSound: AudioClip = null;
  @property(AudioClip)
  fireSound: AudioClip = null;
  @property(AudioClip)
  jumpSound: AudioClip = null;
  @property(AudioClip)
  hurtSound: AudioClip = null;
  @property(AudioClip)
  pwUpsSound: AudioClip = null;

  @property(AudioClip)
  fireSoundBoss: AudioClip = null;
  @property(AudioClip)
  hurtSoundBoss: AudioClip = null;
  @property(AudioClip)
  skillSound: AudioClip = null;
  @property(AudioClip)
  previousSkillSound: AudioClip = null;

  @property(AudioClip)
  flySound: AudioClip = null;

  private static _instance: AudioManager;

  public bgmSource: AudioSource = null!;
  public sfxSource: AudioSource = null!;

  onLoad() {
    if (AudioManager._instance) {
      this.destroy();
      return;
    }
    this.node.parent = null;
    AudioManager._instance = this;
    director.addPersistRootNode(this.node);

    const bgmNode = this.node.getChildByName("BGM");
    const sfxNode = this.node.getChildByName("SFX");

    if (bgmNode && sfxNode) {
      this.bgmSource = bgmNode.getComponent(AudioSource)!;
      this.sfxSource = sfxNode.getComponent(AudioSource)!;
    } else {
      console.error("Not Found node BGM or SFX!");
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

  setBgmVolume(volume: number) {
    this.bgmSource.volume = volume;
  }

  setSfxVolume(volume: number) {
    this.sfxSource.volume = volume;
  }

  getBgmVolume() {
    return this.bgmSource.volume;
  }

  getSfxVolume() {
    return this.sfxSource.volume;
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

  getMenuClip() {
    return this.menuClip;
  }

  getMainClip() {
    return this.mainClip;
  }

  getClickButton() {
    return this.clickButtonClip;
  }
}
