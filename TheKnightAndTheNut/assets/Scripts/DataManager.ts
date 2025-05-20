export class DataManager {
  private static _instance: DataManager = null;
  private _data: any = null;

  private missionList: any[] = null;

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
