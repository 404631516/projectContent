import UIDialog from '../../Scripts/Components/UIDialog';
import HorizontalLayout from '../../Scripts/Components/HorizontalLayout';
import UIHelper from '../../Helper/UIHelper';
import Localization, { LocalKeyType } from '../../Scripts/Components/Localization';
import { BaseSceneString } from '../../Scripts/Data/BaseSceneConfig';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** 倒數畫面
 * 必須加入key為'timer'的圖片
 */
export default class TimerDialog extends UIDialog {
  /** 計時器標題文字風格 */
  private readonly titleTextStyle: TextStyle = {
    stroke: UIHelper.blackString,
    strokeThickness: 2,
    color: UIHelper.whiteString,
  };
  /** 計時器時間文字風格 */
  private readonly contentTextStyle: TextStyle = {
    stroke: UIHelper.blackString,
    strokeThickness: 1,
    color: UIHelper.yellowString,
  };
  /** 計時器位置 */
  private readonly layoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.centerX, 50);

  /** 時間倒數結束的回呼 */
  private onTimerEnd?: () => void;
  /** 時間倒數剩餘的回呼清單<剩餘多少秒時執行, 要執行的回呼> */
  private onTimerCountMap: Map<number, () => void> = new Map();

  /** 倒數計時剩餘時間(MilliSec) */
  private leftMilliSec: number = 0;
  /** 剩餘秒數(Sec) */
  private lastLeftSec: number = 0;
  /** 計時速率 */
  private countdownSpeed = 1;
  /** 是否啟動計時 */
  private isCounting: boolean = false;

  /** UI元件 */
  public timeText!: Phaser.GameObjects.Text;
  public layout!: HorizontalLayout;
  public layoutBackground!: Phaser.GameObjects.Image;
  public layoutTitle!: Phaser.GameObjects.Text;

  /** UIDialog.setUI, 設置Dialog版面 */
  protected setUI(): void {
    // 背景框
    this.layoutBackground = this.addImage(BaseSceneString.GradientGray, this.layoutPosition.x, this.layoutPosition.y);

    // 設置標題文字
    this.layoutTitle = this.addText(
      Localization.getText(LocalKeyType.Common, 'time'),
      this.layoutPosition.x,
      this.layoutPosition.y - 25,
      this.titleTextStyle,
    );
    // 設置時間文字
    this.timeText = this.addText('00:00', 0, 0, this.contentTextStyle);
    // 設置計時器
    this.layout = new HorizontalLayout(this.addObject(this.layoutPosition.x, this.layoutPosition.y));
    // 設置計時器背景填滿
    this.layout.fitElements = true;
    // 設置計時器排版
    this.layout.addElements(this.timeText);
    // 重算容器範圍及背景，排列容器內元件
    this.layout.draw();
  }

  /** 在特定時間設置計時器回呼
   * @param onTimerEnd 計時完成時執行
   * @param onTimerCountList 特定秒數執行
   */
  public setEvent(onTimerEnd: () => void, onTimerCountList: Map<number, () => void>): void {
    this.onTimerEnd = onTimerEnd;
    this.onTimerCountMap = onTimerCountList;
  }

  /** 設定倒數秒數
   * @param countdownSec 倒數秒數
   */
  public startCountdown(countdownSec: number): void {
    // 計算倒數結束時間
    this.leftMilliSec = countdownSec * 1000;
    // 啟動計時
    this.isCounting = true;
  }

  /** 暫停 */
  public pause(): void {
    // 停止更新秒數
    this.isCounting = false;
  }

  /** 取消暫停, 繼續倒數計時 */
  public resume(): void {
    // 繼續更新秒數
    this.isCounting = true;
  }

  /** 調整倒數速度
   * @param countdownSpeed 遊戲倒數加速倍率
   */
  public setCountdownSpeed(countdownSpeed: number): void {
    // 換算成新的countdownSpeed後的剩餘秒數
    this.leftMilliSec *= this.countdownSpeed / countdownSpeed;
    // 調整倒數速度
    this.countdownSpeed = countdownSpeed;
  }

  /** GameObject.update */
  public update(time: number, delta: number) {
    // 不計時返回
    if (this.isCounting === false) {
      return;
    }

    // 隨Phaser update更新時間
    this.leftMilliSec -= delta;
    // 換算成秒數
    const leftSec = Math.floor((this.leftMilliSec * this.countdownSpeed) / 1000);
    // 時間沒變還不用更新
    if (this.lastLeftSec === leftSec) {
      return;
    }
    this.lastLeftSec = leftSec;

    // 執行特定秒數的回呼
    const onTimerCountFunction = this.onTimerCountMap.get(leftSec);
    onTimerCountFunction?.();

    // 時間到, 執行onTimerEnd()並關閉計時
    if (leftSec <= 0) {
      this.onTimerEnd?.();
      this.isCounting = false;
    }

    // 將總秒數，轉為分:秒的文字，並在不足位數補上0。再更新ui
    this.timeText.setText(UIHelper.toMinuteSecondText(leftSec));
  }
}
