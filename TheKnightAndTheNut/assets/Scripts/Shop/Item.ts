import { _decorator, Component, Label, Sprite, SpriteFrame } from 'cc';
import { DataManager } from '../DataManager';
import {MyEvent} from './MyEvent'
const { ccclass, property } = _decorator;

type ItemShop = {
    title: string,
    price: number,
    description: string,
    image: SpriteFrame
}

@ccclass('Item')
export class Item extends Component {
    private title: string;
    private price: number;
    private description: string;
    private image: SpriteFrame;

    init(data: ItemShop){
        this.title = data.title;
        this.price = data.price;
        this.description = data.description;
        this.image = data.image;
        
        const imageComp = this.node.getChildByName("image").getComponent(Sprite);
        imageComp.spriteFrame = this.image;
        
        const priceComp = this.node.getChildByName("price").getComponent(Label);
        priceComp.string = this.price.toString();
    }

    clickBuy() {
        const user = DataManager.instance.getUser();
        if(this.price > user.gold){
            this.node.dispatchEvent( new MyEvent('OPPEN_MESSAGE', true, 'open message') );
            return;
        }

        user.gold -= this.price;

        DataManager.instance.setUser(user);
    }
}

