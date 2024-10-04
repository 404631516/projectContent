import UIHelper from '@/views/H5/Helper/UIHelper';
import TimerDialog from '../../UIHelper/TimerDialog';
import { BrickBreakerString } from '../Data/BrickBreakerConfig';

/** 倒數UI, 繼承自TimerDialog, 使用其計時功能 */
export default class BrickBreakerTimerDialog extends TimerDialog {
  /** 遊戲結束時間點 */
  private gameEndAt!: number;

  /** UIDialog.setUI, 設置Dialog版面 */
  protected setUI(): void {
    // 背景
    const bg = this.addImage(BrickBreakerString.FrameTimer, 512, 25);
    bg.setScale(0.54);
    // icon
    const timerIcon = this.addImage(BrickBreakerString.TimerIcon, 480, 25);
    timerIcon.setScale(0.5);
    // 設置時間文字
    this.timeText = this.addText('00:00', 522, 25, {
      color: UIHelper.yellowString,
      fontSize: '18px',
      stroke: UIHelper.blackString,
      strokeThickness: 1,
    });
  }

  /** 設定遊戲結束時間點
   * @param gameEndAt 遊戲結束時間點
   */
  public setGameEndAt(gameEndAt: number): void {
    // 設定遊戲結束時間
    this.gameEndAt = gameEndAt;
  }

  /** 開始遊戲結束時間倒數
   * @param gameEndAt 遊戲結束時間點
   */
  public startGameEndCountdown(): void {
    // 遊戲結束時間倒數
    const leftSec = (this.gameEndAt - Date.now()) / 1000;
    this.startCountdown(leftSec);
  }
}
