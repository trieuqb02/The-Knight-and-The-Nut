import { _decorator, Component, Node, ScrollView } from "cc";
const { ccclass, property } = _decorator;

@ccclass("RankingManager")
export class RankingManager extends Component {
  @property(ScrollView)
  rankingList: ScrollView = null;
}
