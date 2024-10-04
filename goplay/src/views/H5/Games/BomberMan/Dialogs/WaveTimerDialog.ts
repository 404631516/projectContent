import TimerDialog from '../../UIHelper/TimerDialog';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';

/** 波次倒數畫面 */
export default class WaveTimerDialog extends TimerDialog {
  //#region readonly
  /** 波次提示-背景圖位置 */
  private readonly bgPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(60, 0);
  /** 波次提示-驚嘆號圖位置 */
  private readonly iconPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-25, -5);
  /** 波次提示-文字位置 */
  private readonly promptTextPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(50, 2);
  /** 波次提示-時間文字位置 */
  private readonly timeTextPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(140, 0);
  /** 波次提示-文字 */
  private readonly promptTextKey: string = 'next_wave_prompt_text';
  //#endregion readonly

  /** UIDialog.setUI, 設置Dialog版面 */
  public setUI(): void {
    // 背景圖
    this.addImage(BaseSceneString.RectanglePurple, this.bgPosition.x, this.bgPosition.y);

    // 波次提示icon
    this.addImage(BaseSceneString.InfoIcon, this.iconPosition.x, this.iconPosition.y);

    // 波次提示-文字
    this.addText(
      Localization.getText(LocalKeyType.Common, this.promptTextKey),
      this.promptTextPosition.x,
      this.promptTextPosition.y,
      {
        fontSize: '18px',
      }
    );

    // 倒數時間
    this.timeText = this.addText('00:00', this.timeTextPosition.x, this.timeTextPosition.y, {
      color: '#FFFF00',
      fontSize: '18px',
      stroke: '#000',
      strokeThickness: 1,
    });

    // 倒數完畢時隱藏ui
    this.setEvent(this.hideWavePrompt.bind(this), new Map());
  }

  /** 顯示 下一波提示
   * @param countDownSec 倒數秒數
   */
  public async showWavePrompt(countDownSec: number): Promise<void> {
    // 顯示UI
    this.active = true;
    this.visible = true;

    // 開始計時
    this.startCountdown(countDownSec);
    // 等待倒數
    await AsyncHelper.sleep(countDownSec);
  }

  /** 關閉 下一波提示 */
  public async hideWavePrompt(): Promise<void> {
    this.active = false;
    this.visible = false;
  }
}
