import { _decorator, Component, instantiate, Label, Node, Prefab, ScrollView } from "cc";
const { ccclass, property } = _decorator;

@ccclass("RankingManager")
export class RankingManager extends Component {
  @property(ScrollView)
  rankingList: ScrollView = null;

  @property(Prefab)
  rankingPrefab: Prefab = null;

  protected onLoad(): void {
    if(this.rankingList.content.children.length > 0){
      this.rankingList.content.removeAllChildren();
    } else {
      this.getData();
    }
  }

  private async getData(): Promise<void>{
    const firebase = (window as any).FirebaseBundle;
    try {
      const users = await firebase.getAllData("users");
      const arr = [];
      for (const userId in users) {
        arr.push(users[userId]);
      }

      arr.sort((a, b) => {
        if (a.mission === b.mission) {
          return b.score - a.score; 
        }
        return b.mission - a.mission;
      });

      for(let i = 0 ; i < arr.length; i++){
        const rank = instantiate(this.rankingPrefab);

        const indexComp = rank.getChildByName("index").getComponent(Label);
        indexComp.string = `No${i+1}:`;

        const nameComp = rank.getChildByName("name").getComponent(Label);
        nameComp.string = arr[i].name;

        const scoreComp = rank.getChildByName("score").getComponent(Label);
        scoreComp.string = arr[i].score ?? 0;

        const missionComp = rank.getChildByName("mission").getComponent(Label);
        missionComp.string = arr[i].mission ?? 0;

        this.rankingList.content.addChild(rank);
      }
    } catch (err) {
      console.error("Error get users", err.message);
    }
   
  }
}
