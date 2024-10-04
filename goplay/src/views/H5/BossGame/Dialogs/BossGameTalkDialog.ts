import { BossMsgData, BossMsgDataRoleType, BossTalkInfo } from '@/manager/TableManager';
import { AsyncHelper } from '../../Helper/AsyncHelper';
import PhaserHelper from '../../Helper/PhaserHelper';
import UIHelper from '../../Helper/UIHelper';
import Localization, { LocalKeyType } from '../../Scripts/Components/Localization';
import Object2D from '../../Scripts/Components/Object2D';
import UIDialog from '../../Scripts/Components/UIDialog';
import { BossString } from '../BossConfig';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

export default class BossGameTalkDialog extends UIDialog {
  /** 對話一行幾個字 */
  private readonly wordWrapWidth = 8;
  /** 魔王對話一句話的停留時間 */
  private readonly eachTalkSec = 2;
  /** 對話文字風格 */
  private readonly textStyle: TextStyle = { color: UIHelper.blackString, fontSize: '16px', strokeThickness: 0 };

  /** 對話框(左) */
  private heroTalkBubble!: Phaser.GameObjects.Image;
  /** 對話框(右) */
  private bossTalkBubble!: Phaser.GameObjects.Image;
  /** 對話內容(左) */
  private heroTalkText!: Phaser.GameObjects.Text;
  /** 對話內容(右) */
  private bossTalkText!: Phaser.GameObjects.Text;

  /** 本次對話組的BossMsgData Array */
  private bossTalkInfo: BossTalkInfo | undefined;
  /** 當前allBossMsgData index */
  private currentBossMsgIndex: number = 0;
  /** 當前對話是否已完成 */
  private _isTalkFinished: boolean = false;
  public get isTalkFinished(): boolean {
    if (this.bossTalkInfo === undefined) {
      return true;
    }
    return this._isTalkFinished;
  }

  protected setUI(): void {
    //
  }

  /** 設定對話框圖片 & 對話Text */
  public init(heroPosition: Phaser.Math.Vector2, bossPosition: Phaser.Math.Vector2): void {
    // 對話泡泡相關參數
    const bubbleY = 120;
    const heroBubbleX = heroPosition.x + 120;
    const bossBubbleX = bossPosition.x - 120;

    // 英雄對話框
    const heroBubble: Object2D = new Object2D(this.scene, heroBubbleX, bubbleY);
    // heroTalkBubble
    this.heroTalkBubble = heroBubble.addImage(BossString.TalkBubble, 0, 0);
    this.heroTalkBubble.setScale(1.2, 1.6);
    // heroTalkText
    this.heroTalkText = heroBubble.addText('', 0, -10, this.textStyle);

    // 魔王對話框
    const bossBubble: Object2D = new Object2D(this.scene, bossBubbleX, bubbleY);
    // bossTalkBubble
    this.bossTalkBubble = bossBubble.addImage(BossString.TalkBubble, 0, 0);
    this.bossTalkBubble.setScale(-1.2, 1.6);
    // bossTalkText
    this.bossTalkText = bossBubble.addText('', 0, -10, this.textStyle);

    // 隱藏對話框
    this.handleTalkMsg(undefined);
  }

  /** 設定一組對話進talkHandler */
  public async startTalk(bossTalkInfo: BossTalkInfo): Promise<void> {
    this.bossTalkInfo = bossTalkInfo;
    // index歸零
    this.currentBossMsgIndex = 0;

    this._isTalkFinished = false;

    // 開始播放對話
    this.playNextMsg();

    await AsyncHelper.pendingUntil(() => this.isTalkFinished);
  }

  /** 停止對話組 */
  public stopTalk(): void {
    this.bossTalkInfo = undefined;
    this.handleTalkMsg(undefined);
  }

  /** 播放下句話 */
  private async playNextMsg(): Promise<void> {
    // 防呆
    if (this.bossTalkInfo === undefined) {
      console.error('BossGameTalkHandler.showMsg() error, this.allBossMsgData is undefined!');
      this.handleTalkMsg(undefined);
      return;
    }

    // 當前對話組, 所有對話播放完成
    if (this.currentBossMsgIndex > this.bossTalkInfo.msg.length) {
      this._isTalkFinished = true;
      // 隱藏對話框
      this.handleTalkMsg(undefined);
      return;
    }

    // 取得對應對話
    const currentBossMsg = this.bossTalkInfo.msg[this.currentBossMsgIndex];
    // 顯示對話文字
    this.handleTalkMsg(currentBossMsg);

    // index++
    this.currentBossMsgIndex++;

    const lastBossTalkInfoId = this.bossTalkInfo.id;

    // 設定下句話時間點
    await AsyncHelper.sleep(this.eachTalkSec);

    // 防呆新對話組取代舊對話組的狀況
    if (this.bossTalkInfo === undefined || lastBossTalkInfoId !== this.bossTalkInfo.id) {
      return;
    }

    // 播放下句對話
    this.playNextMsg();
  }

  /** 播放一段對話, 顯示在魔王或英雄旁邊 */
  private async handleTalkMsg(bossMsgData: BossMsgData | undefined): Promise<void> {
    // undefined表示要清空對話
    if (bossMsgData === undefined) {
      this.heroTalkBubble.visible = false;
      this.bossTalkBubble.visible = false;
      this.heroTalkText.text = '';
      this.bossTalkText.text = '';
      return;
    }
    // 說話者是否魔王
    const isBossTalking = bossMsgData.roleType === BossMsgDataRoleType.Boss;
    const message = Localization.getText(LocalKeyType.Common, bossMsgData.key);
    // 根據說話者決定要顯示的對話框
    this.heroTalkBubble.visible = isBossTalking === false;
    this.bossTalkBubble.visible = isBossTalking;
    this.heroTalkText.text = isBossTalking ? '' : message;
    this.bossTalkText.text = isBossTalking ? message : '';

    // 由於Phaser不支持中文自動換行, 所以自行插入\n來換行
    PhaserHelper.setWordWrap(this.heroTalkText, this.wordWrapWidth);
    PhaserHelper.setWordWrap(this.bossTalkText, this.wordWrapWidth);
  }
}
