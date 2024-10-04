import UIDialog from '../../../Scripts/Components/UIDialog';
import UIHelper from '@/views/H5/Helper/UIHelper';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import EnergyBar from '@/views/H5/Scripts/Components/UI/EnergyBar';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import ScoreLayout from '@/views/H5/Scripts/Components/UI/ScoreLayout';
import Puzzle2048GameScene from '../Scenes/Puzzle2048GameScene';
import { Puzzle2048String } from '../Data/Puzzle2048Config';

export default class Puzzle2048GuiDialog extends UIDialog {
  /** 遊戲場景 */
  public declare scene: Puzzle2048GameScene;

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
  private readonly scorePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 200, 40);
  //#endregion

  //#region variable
  /** 分數 */
  private scoreText!: Phaser.GameObjects.Text;
  //#endregion

  /** 設置玩家Gui */
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
  /** 設置分數元件(圖像、文字) */
  private setScoreComponent(): void {
    // 分數圖示
    this.addImage(Puzzle2048String.IconScore, this.scorePosition.x - 10, this.scorePosition.y);
    // '目標'文字
    this.addText('目標', this.scorePosition.x + 50, this.scorePosition.y, {
      fontSize: '24px',
      color: UIHelper.whiteString,
    });
    // 分數文字
    this.scoreText = this.addText('0', this.scorePosition.x + 140, this.scorePosition.y, {
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
    this.addImage(BaseSceneString.TimerIcon, 54, 30);
  }
  //#endregion
}
