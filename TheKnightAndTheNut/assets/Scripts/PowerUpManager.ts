import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PowerUpManager')
export class PowerUpManager extends Component {
    private static _instance: PowerUpManager = null; // singleton

    @property(Prefab)
    magnetPrefab: Prefab;
    @property(Prefab)
    shieldPrefab: Prefab;

    public static get Instance(): PowerUpManager {
        if (!this._instance) this._instance = new PowerUpManager();
        return this._instance;
    }

    spawn(pwUpName, pos){
        let pwUpPrefab = null;
        switch (pwUpName) {
            case 'MagnetPW':
                pwUpPrefab = this.magnetPrefab;
                break;

            case 'ShieldPW':
                pwUpPrefab = this.shieldPrefab;
                break;
            default:
                break;
        }
        const pwUp = instantiate(pwUpPrefab);
        this.node.addChild(pwUp);
        pwUp.setWorldPosition(pos);
    }
}


