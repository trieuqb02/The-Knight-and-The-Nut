import { _decorator, Component, EditBox, Label, Node } from "cc";
import { EventEnum } from "../EventManager";
const { ccclass, property } = _decorator;

@ccclass("AuthManager")
export class AuthManager extends Component {
  @property(Node)
  private loginPanel: Node = null;

  @property(Node)
  private registerPanel: Node = null;

  @property(Node)
  private messagePanel: Node = null;

  @property(Node)
  private eventManager: Node = null;

  private username: EditBox = null;
  private password: EditBox = null;

  private newUsername: EditBox = null;
  private newPassword: EditBox = null;
  private confirmPassword: EditBox = null;

  protected onLoad(): void {
    this.eventManager.on(
      EventEnum.EVENT_OPEN_LOGIN_PANEL,
      this.openLoginPanel,
      this
    );
    this.eventManager.on(
      EventEnum.EVENT_OPEN_REGISTER_PANEL,
      this.openRegisterPanel,
      this
    );
    this.eventManager.on(EventEnum.EVENT_LOGIN, this.login, this);
    this.eventManager.on(EventEnum.EVENT_REGISTER, this.register, this);
    this.eventManager.on(EventEnum.EVENT_CLOSE_MESSAGE, this.closeMessagePanel, this);
  }

  protected start(): void {
    this.username = this.loginPanel
      .getChildByName("Username")
      .getComponent(EditBox);
    this.password = this.loginPanel
      .getChildByName("Password")
      .getComponent(EditBox);

      this.newUsername = this.registerPanel
      .getChildByName("Username")
      .getComponent(EditBox);
      this.newPassword = this.registerPanel
      .getChildByName("Password")
      .getComponent(EditBox);
      this.confirmPassword = this.registerPanel
      .getChildByName("ConfirmPassword")
      .getComponent(EditBox);
  }

  private openMessagePanel(message: string): void {
    this.messagePanel.active = true;
    const messageComp = this.messagePanel.getChildByName("Label").getComponent(Label);
    messageComp.string = message;
  }

  private closeMessagePanel(): void {
    this.messagePanel.active = false;
  }

  private openLoginPanel(): void {
    this.loginPanel.active = true;
    this.registerPanel.active = false;
  }

  private openRegisterPanel(): void {
    this.loginPanel.active = false;
    this.registerPanel.active = true;
  }

  private login(): void {
    const username = this.username.string;
    const password = this.password.string;

    if(!username && !password){
        this.openMessagePanel("Please Input Username and Password!");
        return
    }

    // call api to server
  }

  private register(): void {

    const username = this.newUsername.string;
    const password = this.newPassword.string;
    const confirmPassword = this.confirmPassword.string;

    if(!username && !password && !confirmPassword){
        this.openMessagePanel("Please input all!");
        return;
    }

    if(password != confirmPassword){
        this.openMessagePanel("Confirm password fail!");
        return;
    }

     // call api to server
  }
}
