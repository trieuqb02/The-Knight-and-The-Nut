import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { Railway } from './Railway';
const { ccclass, property } = _decorator;

export enum RailwayPrefabName {
    FLAT = "RailwayFlat",
    UP = "RailwaySlopeUp",
    DOWN = "RailwaySlopeDown",
    UP_AND_DOWN = "RailwaySlopeUpAndDown"
}

@ccclass('RailwayPrefab')
class RailwayPrefab {
    @property(Prefab)
    prefab: Prefab = null;
}

@ccclass('PoollingRailway')
export class PoollingRailway extends Component {

    @property([RailwayPrefab])
    railwayPrefabs: RailwayPrefab[] = [];

    private poolFalt: Node[] = [];
    private poolSlopeUp: Node[] = [];
    private poolSlopeDown: Node[] = [];
    private poolSlopeUpAndDown: Node[] = [];

    initPrefabs(): void {
        this.railwayPrefabs.forEach(railwayPrefab => {
            const arr:Node[] = [];
            for( let i = 0; i < 20; i++){
                const piece = instantiate(railwayPrefab.prefab);
                piece.active = false;
                arr.push(piece);
            }
            switch (railwayPrefab.prefab.name) {
                case  RailwayPrefabName.FLAT: {
                    this.poolFalt = arr;
                    break;
                }
                case  RailwayPrefabName.DOWN: {
                    this.poolSlopeUp = arr;
                    break;
                }
                case  RailwayPrefabName.UP: {
                    this.poolSlopeDown = arr;
                    break;
                }
                case  RailwayPrefabName.UP_AND_DOWN: {
                    this.poolSlopeUpAndDown = arr;
                    break;
                }
            }
        })
    }


    getPrefabNode(name: string): Node {
        let node: Node | undefined;
        switch (name){
            case RailwayPrefabName.FLAT : {
                node = this.poolFalt.pop();
                break;
            }
            case RailwayPrefabName.UP: {
                node = this.poolSlopeUp.pop();
                break;
            }
            case RailwayPrefabName.DOWN: {
                node = this.poolSlopeDown.pop();
                break;
            }
            case RailwayPrefabName.UP_AND_DOWN: {
                node = this.poolSlopeUpAndDown.pop();
                break;
            }
        }
        node.active = true;
        return node;
    }

    recycleNode(railway: Node) {
        railway.active = false;
        switch (railway.name) {
            case  RailwayPrefabName.FLAT: {
                this.poolFalt.push(railway);
                break;
            }
            case  RailwayPrefabName.DOWN: {
                this.poolSlopeUp.push(railway);
                break;
            }
            case  RailwayPrefabName.UP: {
                this.poolSlopeDown.push(railway);
                break;
            }
            case  RailwayPrefabName.UP_AND_DOWN: {
                this.poolSlopeUpAndDown.push(railway);
                break;
            }
        }
    }

    protected onLoad(): void {
        this.initPrefabs()
    }

}

