type User = {
  name: string,
  level?: string,
  score?: number,
  gold: number
}

export class DataManager {
  private static _instance: DataManager = null;
  private _data: any = null;

  private missionList: any[] = null;

  private user: any = null;

  static get instance() {
    if (!this._instance) {
      this._instance = new DataManager();
    }
    return this._instance;
  }

  setMissionList(data: any){
    this.missionList = data;
  }

  getMissionList(){
    return this.missionList;
  }

  setUser(user: User){
    this.user = user;
  }

  getUser(){
    return this.user;
  }

  setData(data: any) {
    this._data = data;
  }

  getData() {
    return this._data;
  }

  clear() {
    this._data = null;
  }
}
