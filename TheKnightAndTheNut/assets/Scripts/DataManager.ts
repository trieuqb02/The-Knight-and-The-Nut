import { GamePlay } from "./Entity/GamePlay";

export class DataManager {
  private static _instance: DataManager = null;
  private _data: GamePlay = null;

  private missionList: any[] = null;

  private user: User = null;

  private skills: string[] = [];

  static get instance() {
    if (!this._instance) {
      this._instance = new DataManager();
    }
    return this._instance;
  }

  setMissionList(data: any) {
    this.missionList = data;
  }

  getMissionList() {
    return this.missionList;
  }

  setUser(user: User) {
    this.user = user;
  }

  getUser() {
    return this.user;
  }

  setData(data: any) {
    this._data = data;
  }

  getData() {
    return this._data;
  }

  getSkills() {
    return this.skills;
  }

  setSkill(skill: string) {
    this.skills.push(skill);
  }

  clearSkills() {
    this.skills = [];
  }

  clear() {
    this._data = null;
    this.user = null;
    this.missionList = null;
    this.skills = [];
  }
}
