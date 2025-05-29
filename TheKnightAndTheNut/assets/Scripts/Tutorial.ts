import { _decorator, Component, EventKeyboard, Input, input, KeyCode, Node, Tween, tween, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Tutorial')
export class Tutorial extends Component {
    @property(Node)
    private labelJump: Node = null;

    @property(Node)
    private labelShoot: Node = null;

    @property(Node)
    private labelFlip: Node = null;

    private currentStep: number = 0;

    protected onLoad(): void {
        this.labelJump.active = false;
        this.labelShoot.active = false;
        this.labelFlip.active = false;
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    protected start() {
        this.showStep(0);
    }

    showStep(step) {
        this.currentStep = step;

        this.stopAll();

        switch (step) {
            case 0:
                this.labelJump.active = true;
                this.playPulseTween(this.labelJump);
                break;
            case 1:
                this.labelShoot.active = true;
                this.playPulseTween(this.labelShoot);
                break;
            case 2:
                this.labelFlip.active = true;
                this.playPulseTween(this.labelFlip);
                break;
            default:
                break;
        }
    }

    playPulseTween(node) {
        tween(node)
            .repeatForever(
                tween()
                    .to(0.5, { scale: new Vec2(1.2, 1.2) })
                    .to(0.5, { scale: new Vec2(1, 1) })
            )
            .start();
    }

    private onKeyDown(event: EventKeyboard) {
        if (this.currentStep === 0 && event.keyCode === KeyCode.KEY_W) {
            this.showStep(1);
        } else if (this.currentStep === 1 && event.keyCode === KeyCode.KEY_F) {
            this.showStep(2);
        } else if (this.currentStep === 2 && event.keyCode === KeyCode.SPACE) {
            this.stopAll();
        }
    }

    stopAll() {
        Tween.stopAllByTarget(this.labelJump);
        Tween.stopAllByTarget(this.labelShoot);
        Tween.stopAllByTarget(this.labelFlip);

        this.labelJump.active = false;
        this.labelShoot.active = false;
        this.labelFlip.active = false;
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
}

