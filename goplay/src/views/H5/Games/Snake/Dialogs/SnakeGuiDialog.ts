import UIHelper from '@/views/H5/Helper/UIHelper';
import UIDialog from '../../../Scripts/Components/UIDialog';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { SnakeString } from '../Data/SnakeConfig';
import SnakeGameScene from '../Scenes/SnakeGameScene';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';

export default class SnakeGuiDialog extends UIDialog {
  /** 遊戲場景 */
  public declare scene: SnakeGameScene;

  //#region readonly
  /** 倒數計時 */
  private readonly countDownTime: number = 3;

  /** 遊戲準備文字Key */
  private readonly readyTextKey: string = 'ready';
  /** 遊戲準備文字風格 */
  private readonly readyTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: '96px',
    color: UIHelper.yellowString,
  };
  /** 遊戲開始文字Key */
  private readonly startTextKey: string = 'start';

  /** 靜音按鈕位置 */
  private readonly muteIconPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 60, this.height - 40);
  /** 分數元件位置 */
  private readonly scorePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(240, this.height - 40);
  //#endregion

  //#region 變數
  /** 分數顯示 */
  private scoreText!: Phaser.GameObjects.Text;
  //#endregion

  protected setUI(): void {
    this.setScoreComponent();

    this.setMuteIcon();

    this.setTimerIcon();
  }

  //#region 畫面顯示

  /** 更新分數顯示
   * @param score 分數數值
   */
  public updateScoreCount(score: number, targetScore: number): void {
    this.scoreText.setText(`${score} / ${targetScore}`);
  }

  /** 顯示遊戲開始動畫 */
  public async showOpeningGameText(): Promise<void> {
    const sound = this.scene.sound.add(BaseSceneString.CountDownSound);
    sound.play('', { delay: 1 });
    await AnimationHelper.playOpeningCountDown(
      this,
      this.countDownTime,
      this.readyTextKey,
      this.startTextKey,
      this.readyTextStyle,
    );
  }
  //#endregion

  //#region 初始化

  /** 設定分數元件 */
  private setScoreComponent(): void {
    // 分數圖示
    this.addImage(SnakeString.IconScore, this.scorePosition.x, this.scorePosition.y - 10);
    // '目標'文字
    this.addText('目標', this.scorePosition.x + 50, this.scorePosition.y, {
      fontSize: '24px',
      color: UIHelper.whiteString,
    });
    // 分數文字
    this.scoreText = this.addText('0 / 0', this.scorePosition.x + 140, this.scorePosition.y, {
      fontSize: '24px',
      color: UIHelper.whiteString,
    });
  }

  /**設置音訊開關按鈕 */
  private setMuteIcon(): void {
    this.addImage('', this.muteIconPos.x, this.muteIconPos.y, '', MuteIcon);
  }

  /** 設置計時器圖示 */
  private setTimerIcon(): void {
    this.addImage(BaseSceneString.TimerIcon, 730, 30);
  }
  //#endregion
}
