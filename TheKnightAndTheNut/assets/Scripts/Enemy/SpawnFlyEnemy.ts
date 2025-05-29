import { _decorator, Component, instantiate, Node, Prefab, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SpawnFlyEnemy')
export class SpawnFlyEnemy extends Component {
    @property(Prefab)
    private flyEnemyPrefab: Prefab;
    @property
    private minTimeToSpawn: number = 3;
    @property
    private maxTimeToSpawn: number = 10;

    @property(Node)
    private posUpNode: Node;
    @property(Node)
    private posDownNode: Node;

    protected start() {
        this.scheduleSpawn();
    }

    private scheduleSpawn() {
        const randomTime = this.getRandomTime(this.minTimeToSpawn, this.maxTimeToSpawn); 
        this.scheduleOnce(() => {
            this.spawn();
            this.scheduleSpawn();
        }, randomTime);
    }

    private getRandomTime(min, max) {
        return Math.random() * (max - min) + min;
    }

    spawn() {
        const worldPos = Math.random() > 0.5 ? this.posUpNode.worldPosition : this.posDownNode.worldPosition;

        const enemy = instantiate(this.flyEnemyPrefab);
        this.node.addChild(enemy);

        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            const localPos = uiTransform.convertToNodeSpaceAR(worldPos);
            enemy.setPosition(localPos);
        } else {
            enemy.setWorldPosition(worldPos);
        }
    }
}

