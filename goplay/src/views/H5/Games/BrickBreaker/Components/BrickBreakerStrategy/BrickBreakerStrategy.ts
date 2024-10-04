import {
  BrickBreakerAvatarData,
  BrickBreakerAvatarUpdateData,
  BrickBreakerAvatarUpdateType,
  BrickBreakerGridEventType,
  BrickBreakerItemType,
} from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import BrickBreakerEventMsgDialog from '../../Dialogs/BrickBreakerEventMsgDialog';
import BrickBreakerGameScene from '../../Scenes/BrickBreakerGameScene';
import BrickBreakerGamePlayerComponent from '../Game/BrickBreakerGamePlayerComponent';

/** BrickBreakerStrategy基礎類別 */
export default abstract class BaseBrickBreakerStrategy {
  protected readonly mainMsgKey = 'brickBreaker_eventHintMain';
  protected readonly subMsgKey = 'brickBreaker_eventHintSub';

  protected get isSelf(): boolean {
    return this.playerComponent.isSelf;
  }

  constructor(
    protected playerComponent: BrickBreakerGamePlayerComponent,
    protected updateData: BrickBreakerAvatarUpdateData,
    protected avatarData: BrickBreakerAvatarData
  ) {}

  protected getMsg(msgKey: string, gridEventTypeString: string, params: string[] = []): string {
    const updateTypeString = '_' + BrickBreakerAvatarUpdateType[this.updateData.updateType];
    return Localization.getText(LocalKeyType.Common, msgKey + updateTypeString + gridEventTypeString, params);
  }

  public abstract showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void>;

  public abstract onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void>;
}

/** ShowError事件 */
export class BrickBreakerShowErrorStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(): Promise<void> {
    return;
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    // 若為玩家自己
    if (this.isSelf) {
      console.error('BrickBreakerAvatarUpdateType.ShowError');
      // TODO 表演錯誤提示視窗
    }
  }
}

/** DoNothing事件 */
export class BrickBreakerDoNothingStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(): Promise<void> {
    return;
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    // 什麼都不做
  }
}

/** HitWall事件 */
export class BrickBreakerHitWallStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(): Promise<void> {
    return;
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    if (this.isSelf) {
      return this.playerComponent.playHitWall();
    }
  }
}

/** Online事件 */
export class BrickBreakerOnlineStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(): Promise<void> {
    return;
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    return this.playerComponent.playOnline(this.avatarData.isOnline);
  }
}

/** Move事件 */
export class BrickBreakerMoveStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(): Promise<void> {
    return;
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    const moveTargetGrid = scene.gridManager.getGridComponent(this.avatarData.currentGridId);
    return this.playerComponent.playMove(moveTargetGrid);
  }
}

/** StartAnswer事件 */
export class BrickBreakerStartAnswerStrategy extends BaseBrickBreakerStrategy {
  constructor(
    playerComponent: BrickBreakerGamePlayerComponent,
    updateData: BrickBreakerAvatarUpdateData,
    avatarData: BrickBreakerAvatarData,
    private gridEventType: BrickBreakerGridEventType | undefined
  ) {
    super(playerComponent, updateData, avatarData);
  }

  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    if (this.gridEventType === undefined) {
      console.error(`BrickBreakerEventMsgDialog.onSelfAvatarUpdate() error, gridEventType undefined!`);
      return;
    }
    const gridEventTypeString = '_' + BrickBreakerGridEventType[this.gridEventType];
    const mainMsg = this.getMsg(this.mainMsgKey, gridEventTypeString);
    const subMsg = this.getMsg(this.subMsgKey, gridEventTypeString);
    return msgDialog.showMsg(mainMsg, subMsg);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    // 若為玩家自己
    if (this.isSelf) {
      return scene.startAnswerQuestions();
    }
  }
}

/** Attack事件 */
export class BrickBreakerAttackStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(): Promise<void> {
    return;
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    // 是否表演威力上升
    const isPowerUp = this.updateData.itemId === BrickBreakerItemType.Axe;
    if (isPowerUp) {
      await this.playerComponent.playUseItem(BrickBreakerItemType.Axe);
    }
    return this.playerComponent.playAttack();
  }
}

/** DefenseSuccess事件 */
export class BrickBreakerDefenseSuccessStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(): Promise<void> {
    return;
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    return this.playerComponent.playDefenseSuccess();
  }
}

/** DefenseFailedBomb事件 */
export class BrickBreakerDefenseFailedBombStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(): Promise<void> {
    return;
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    return this.playerComponent.playDefenseFailedBomb();
  }
}

/** DefenseFailedShield事件 */
export class BrickBreakerDefenseFailedShieldStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(): Promise<void> {
    return;
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    return this.playerComponent.playDefenseFailedShield();
  }
}

/** Bomb事件 */
export class BrickBreakerBombStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    const mainMsg = this.getMsg(this.mainMsgKey, '');
    const subMsg = this.getMsg(this.subMsgKey, '');
    return msgDialog.showMsg(mainMsg, subMsg);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    return this.playerComponent.playBomb();
  }
}

/** Teleport事件 */
export class BrickBreakerTeleportStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    const mainMsg = this.getMsg(this.mainMsgKey, '');
    const subMsg = this.getMsg(this.subMsgKey, '');
    return msgDialog.showMsg(mainMsg, subMsg);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    return this.playerComponent.playTeleport();
  }
}

/** HitBossSuccess事件 */
export class BrickBreakerHitBossSuccessStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    const mainMsg = this.getMsg(this.mainMsgKey, '');
    const subMsg = this.getMsg(this.subMsgKey, '');
    return msgDialog.showMsg(mainMsg, subMsg);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    // 是否表演威力上升
    const isPowerUp = this.updateData.itemId === BrickBreakerItemType.Axe;
    if (isPowerUp) {
      await this.playerComponent.playUseItem(BrickBreakerItemType.Axe);
    }
    return this.playerComponent.playHitBoss();
  }
}

/** HitBossFailedBomb事件 */
export class BrickBreakerHitBossFailedBombStrategy extends BaseBrickBreakerStrategy {
  constructor(
    playerComponent: BrickBreakerGamePlayerComponent,
    updateData: BrickBreakerAvatarUpdateData,
    avatarData: BrickBreakerAvatarData,
    private correctCount: number
  ) {
    super(playerComponent, updateData, avatarData);
  }

  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    const mainMsg = this.getMsg(this.mainMsgKey, '', [this.correctCount.toString()]);
    const subMsg = this.getMsg(this.subMsgKey, '');
    return msgDialog.showMsg(mainMsg, subMsg);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    // 是否表演威力上升
    const isPowerUp = this.updateData.itemId === BrickBreakerItemType.Axe;
    if (isPowerUp) {
      await this.playerComponent.playUseItem(BrickBreakerItemType.Axe);
    }
    await this.playerComponent.playHitBoss();
    return this.playerComponent.playBomb();
  }
}

/** HitBossFailedShield事件 */
export class BrickBreakerHitBossFailedShieldStrategy extends BaseBrickBreakerStrategy {
  constructor(
    playerComponent: BrickBreakerGamePlayerComponent,
    updateData: BrickBreakerAvatarUpdateData,
    avatarData: BrickBreakerAvatarData,
    private correctCount: number
  ) {
    super(playerComponent, updateData, avatarData);
  }

  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    const mainMsg = this.getMsg(this.mainMsgKey, '', [this.correctCount.toString()]);
    const subMsg = this.getMsg(this.subMsgKey, '');
    return msgDialog.showMsg(mainMsg, subMsg);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    // 是否表演威力上升
    const isPowerUp = this.updateData.itemId === BrickBreakerItemType.Axe;
    if (isPowerUp) {
      await this.playerComponent.playUseItem(BrickBreakerItemType.Axe);
    }
    await this.playerComponent.playHitBoss();
    return this.playerComponent.playUseItem(BrickBreakerItemType.Shield);
  }
}

/** CrossBrickBreak事件 */
export class BrickBreakerCrossBrickBreakStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    const mainMsg = this.getMsg(this.mainMsgKey, '');
    const subMsg = this.getMsg(this.subMsgKey, '');
    msgDialog.showMsg(mainMsg, subMsg);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    // 什麼都不做
  }
}

/** Shuriken事件 */
export class BrickBreakerShurikenStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    const mainMsg = this.getMsg(this.mainMsgKey, '');
    const subMsg = this.getMsg(this.subMsgKey, '');
    return msgDialog.showMsg(mainMsg, subMsg);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    // 是否表演威力上升
    const isPowerUp = this.updateData.itemId === BrickBreakerItemType.Axe;
    if (isPowerUp) {
      await this.playerComponent.playUseItem(BrickBreakerItemType.Axe);
    }
    return this.playerComponent.playShuriken();
  }
}

/** Freeze事件 */
export class BrickBreakerFreezeStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    const mainMsg = this.getMsg(this.mainMsgKey, '');
    const subMsg = this.getMsg(this.subMsgKey, '');
    msgDialog.showMsg(mainMsg, subMsg);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    return this.playerComponent.playFreeze();
  }
}

/** Horn事件 */
export class BrickBreakerHornStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    const mainMsg = this.getMsg(this.mainMsgKey, '');
    const subMsg = this.getMsg(this.subMsgKey, '');
    msgDialog.showMsg(mainMsg, subMsg);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    return this.playerComponent.playHorn();
  }
}

/** Unfreeze事件 */
export class BrickBreakerUnfreezeStrategy extends BaseBrickBreakerStrategy {
  constructor(
    playerComponent: BrickBreakerGamePlayerComponent,
    updateData: BrickBreakerAvatarUpdateData,
    avatarData: BrickBreakerAvatarData,
    private useHornUserName: string
  ) {
    super(playerComponent, updateData, avatarData);
  }

  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    // 若是自己被別人解凍, 做訊息提示表演
    if (this.useHornUserName !== '') {
      // 設定提示訊息, 代入吹號角的玩家姓名
      const mainMsg = Localization.getText(LocalKeyType.Common, 'brickBreaker_eventHintMain_UnfreezeBy');
      const subMsg = Localization.getText(LocalKeyType.Common, 'brickBreaker_eventHintSub_UnfreezeBy', [
        this.useHornUserName,
      ]);
      // showMsg
      msgDialog.showMsg(mainMsg, subMsg);
    }
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    return this.playerComponent.playUnfreeze();
  }
}

/** GetItem事件 */
export class BrickBreakerGetItemStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    // 若是主動觸發獲得道具, 才需showMsg
    if (this.updateData.activatorUid === this.avatarData.uid) {
      const mainMsg = this.getMsg(this.mainMsgKey, '');
      msgDialog.showMsg(mainMsg, '', this.updateData.itemId);
    }
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    return this.playerComponent.playGetItem(this.updateData.itemId);
  }
}

/** GetItemAround事件 */
export class BrickBreakerGetItemAroundStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    const mainMsg = this.getMsg(this.mainMsgKey, '');
    msgDialog.showMsg(mainMsg, '', this.updateData.itemId);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    this.playerComponent.playGetItemAround(this.updateData.itemId);
    if (this.isSelf) {
      await this.playerComponent.playGetItem(this.updateData.itemId);
    }
  }
}

/** GetItemAll事件 */
export class BrickBreakerGetItemAllStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    const mainMsg = this.getMsg(this.mainMsgKey, '');
    msgDialog.showMsg(mainMsg, '', this.updateData.itemId);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    if (this.isSelf) {
      await this.playerComponent.playGetItem(this.updateData.itemId);
    }
  }
}

/** UseItem事件 */
export class BrickBreakerUseItemStrategy extends BaseBrickBreakerStrategy {
  public async showUpdateMessage(msgDialog: BrickBreakerEventMsgDialog): Promise<void> {
    const mainMsg = this.getMsg(this.mainMsgKey, '');
    msgDialog.showMsg(mainMsg, '', this.updateData.itemId);
  }

  public async onAvatarUpdate(scene: BrickBreakerGameScene): Promise<void> {
    return this.playerComponent.playUseItem(this.updateData.itemId);
  }
}
