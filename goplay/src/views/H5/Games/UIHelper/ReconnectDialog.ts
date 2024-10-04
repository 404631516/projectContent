import UIHelper from '@/views/H5/Helper/UIHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import UIDialog from '../../Scripts/Components/UIDialog';
import { BrickBreakerString } from '../BrickBreaker/Data/BrickBreakerConfig';

export default class ReconnectDialog extends UIDialog {
  /** loading點圖(3個) */
  private dotImages: Phaser.GameObjects.Image[] = [];
  /** loading點圖位置index */
  private currentDotIndex: number = 0;
  /** 下次更新loading點圖位置的時間 */
  private nextSwitchDotAt: number = 0;
  /** 更新loading點圖位置的週期(毫秒) */
  private readonly switchDotMilliSec = 500;
  /** loading點圖(3個)對應位置 */
  private readonly dotPositions: Phaser.Math.Vector2[] = [
    new Phaser.Math.Vector2(490, 290),
    new Phaser.Math.Vector2(512, 290),
    new Phaser.Math.Vector2(534, 290),
  ];

  protected async setUI() {
    // 半透明的黑幕
    const bg = this.addImage(BrickBreakerString.ReconnectBG, this.centerX, this.centerY);
    bg.setScale(8);

    // 背景
    const contentBG = this.addImage(BrickBreakerString.ReconnectBG, this.centerX, this.centerY);
    contentBG.setScale(0.5);
    // icon
    const icon = this.addImage(BrickBreakerString.ReconnectIcon, this.centerX, this.centerY - 30);
    icon.setScale(0.5);
    // 文字提示: '斷線重連中'
    this.addText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_reconnect_reconnectingHint'),
      this.centerX,
      this.centerY + 10,
      {
        color: UIHelper.yellowString,
        fontSize: '24px',
      }
    );
    // 下方會動的點點loading圖案
    this.dotImages.push(this.addImage(BrickBreakerString.ReconnectDot1, 0, 0));
    this.dotImages.push(this.addImage(BrickBreakerString.ReconnectDot2, 0, 0));
    this.dotImages.push(this.addImage(BrickBreakerString.ReconnectDot3, 0, 0));
    for (const dotImage of this.dotImages) {
      dotImage.setScale(0.5);
    }
  }

  update() {
    // 時間到了才更新loading點圖位置
    if (Date.now() < this.nextSwitchDotAt) {
      return;
    }
    // 更新loading點圖位置
    this.switchDotPosition();
    // 下次更新時間
    this.nextSwitchDotAt = Date.now() + this.switchDotMilliSec;
  }

  /** 更新loading點圖位置 */
  private switchDotPosition() {
    // 第一個點圖, 是對應第幾個dotPositions
    this.currentDotIndex = (this.currentDotIndex + 1) % 3;

    for (let i = 0; i < 3; ++i) {
      // 找出目標位置
      const positionIndex = (this.currentDotIndex + i) % 3;
      const targetPos = this.dotPositions[positionIndex];
      // 設定點點對應位置
      this.dotImages[i].setPosition(targetPos.x, targetPos.y);
    }
  }
}
