import UIDialog from '../../../Scripts/Components/UIDialog';
import { BubbleDragonString } from '../Data/BubbleDragonConfig';

export default class BubbleDragonForegroundDialog extends UIDialog {
  /** 漸層位置X */
  private readonly gradientPositionX: number = 820;
  /** 漸層Y軸縮放比例 */
  private readonly gradientScaleY: number = 30;
  /** 牆壁位置X */
  private readonly wallPositionX: number = 580;
  /** 上方牆壁位置Y */
  private readonly topWallPositionY: number = 85;
  /** 下方牆壁位置Y */
  private readonly bottomWallPositionY: number = 425;
  /** 站台位置X */
  private readonly platformPositionX: number = 89;
  /** 站台位置Y */
  private readonly platformPositionY: number = this.height - 99;

  protected setUI() {
    // 設置漸層
    const gradient = this.addImage(BubbleDragonString.Gradient, this.gradientPositionX, this.height * 0.5);
    // 設置上方牆壁
    this.addImage(BubbleDragonString.TopWall, this.wallPositionX, this.topWallPositionY);
    // 設置下方牆壁
    this.addImage(BubbleDragonString.BottomWall, this.wallPositionX, this.bottomWallPositionY);
    // 漸層上下拉長
    gradient.setScale(1, this.gradientScaleY);
    // 設置英雄站的平台
    this.addImage(BubbleDragonString.Platform, this.platformPositionX, this.platformPositionY);
  }
}
