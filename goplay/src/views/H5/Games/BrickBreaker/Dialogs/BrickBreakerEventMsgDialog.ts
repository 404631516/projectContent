import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { BrickBreakerItemType } from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import UIDialog from '@/views/H5/Scripts/Components/UIDialog';
import { BrickBreakerString } from '../Data/BrickBreakerConfig';

export default class BrickBreakerEventMsgDialog extends UIDialog {
  /** bg */
  private bg!: Phaser.GameObjects.Image;
  /** 文字訊息Text */
  private mainMsgText!: Phaser.GameObjects.Text;
  /** 副標題文字訊息Text */
  private subMsgText!: Phaser.GameObjects.Text;
  /** 獲得道具icon */
  private itemIcon!: Phaser.GameObjects.Image;
  /** 獲得道具說明Text */
  private itemText!: Phaser.GameObjects.Text;

  /** 訊息index, 檢查用, 避免關到新訊息 */
  private msgIndex: number = 0;

  /** 訊息框是否已關閉 */
  public isHide(): boolean {
    return this.alpha === 0;
  }

  protected setUI(): void {
    // 文字後黑底
    this.bg = this.addImage(BrickBreakerString.FrameBlack, this.centerX, this.centerY);
    this.bg.setScale(0.54);
    const mainMsgTextY = this.centerY - 30;
    const subMsgTextY = this.centerY + 30;

    // 文字訊息
    this.mainMsgText = this.addText('', this.centerX, mainMsgTextY, {
      color: UIHelper.yellowString,
      fontSize: '40px',
    });

    // 中間線
    const lineImg = this.addImage(BrickBreakerString.EventMsgLine, this.centerX, this.centerY);
    lineImg.setScale(0.54);

    // 副標題文字訊息
    this.subMsgText = this.addText('', this.centerX, subMsgTextY, {
      fontSize: '20px',
    });

    // 獲得道具icon
    this.itemIcon = this.addImage(BrickBreakerString.ItemAxe, this.centerX - 120, subMsgTextY);
    // 獲得道具說明Text
    this.itemText = this.addText('itemText', this.centerX - 100, subMsgTextY, {
      fontSize: '20px',
    });
    this.itemText.setOrigin(0, 0.5);

    // 隱藏整個dialog
    this.alpha = 0;
  }

  /** 顯示時間到, 更改背景顏色 */
  public async showTimeup(): Promise<void> {
    // 更換背景圖
    this.bg.setTexture(BrickBreakerString.FramePurple);
    // 機器人icon
    const robotImg = this.addImage(BrickBreakerString.RobotWarning, this.centerX - 120, this.centerY - 40);
    robotImg.setScale(0.6);

    const mainMsg = Localization.getText(LocalKeyType.Common, 'brickBreaker_eventHintMain_Timeup');
    const subMsg = Localization.getText(LocalKeyType.Common, 'brickBreaker_eventHintSub_Timeup');
    return this.showMsg(mainMsg, subMsg);
  }

  /** 顯示文字表演
   * @param mainMsg 文字內容
   */
  public async showMsg(mainMsg: string, subMsg: string = '', itemId: number = 0, sec: number = 3): Promise<void> {
    // 顯示dialog
    this.alpha = 1;
    // 更換文字
    this.mainMsgText.text = mainMsg;
    // 更換副標題文字
    this.subMsgText.text = subMsg;

    // 更換道具icon及說明
    const isShowItem = itemId !== 0;
    this.itemIcon.setVisible(isShowItem);
    this.itemText.setVisible(isShowItem);
    if (isShowItem) {
      // 換圖
      switch (itemId) {
        // 防傳送盾
        case BrickBreakerItemType.Shield:
          this.itemIcon.setTexture(BrickBreakerString.ItemShield);
          break;
        // 威力上升
        case BrickBreakerItemType.Axe:
          this.itemIcon.setTexture(BrickBreakerString.ItemAxe);
          break;
        // 防冰凍盾
        case BrickBreakerItemType.FreezePrevent:
          this.itemIcon.setTexture(BrickBreakerString.ItemFreezePrevent);
          break;
        default:
          console.error(`BrickBreakerEventMsgDialog.showMsg() error, unexpected itemId ${itemId}`);
          break;
      }
      // 道具說明文字
      this.itemText.text = Localization.getText(LocalKeyType.Common, 'brickBreaker_eventHintItem_' + itemId);
    }

    // 訊息index++
    this.msgIndex++;
    // 紀錄本次訊息的msgIndex
    const currentMsgIndex = this.msgIndex;

    // 等待x秒
    await AsyncHelper.sleep(sec);

    // showMsg重複call的情況會後蓋前, 這邊檢查msgIndex, 避免關到新的訊息
    if (this.msgIndex === currentMsgIndex) {
      // 隱藏dialog
      this.alpha = 0;
    }
  }
}
