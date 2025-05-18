export class DataManager {
  private static _instance: DataManager = null;
  private _data: any = null;

  static get instance() {
    if (!this._instance) {
      this._instance = new DataManager();
    }
    return this._instance;
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
