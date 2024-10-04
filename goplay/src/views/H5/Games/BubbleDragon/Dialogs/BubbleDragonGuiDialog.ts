import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import ScoreLayout from '@/views/H5/Scripts/Components/UI/ScoreLayout';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import UIDialog from '../../../Scripts/Components/UIDialog';
import { BubbleDragonNumber, BubbleDragonString } from '../Data/BubbleDragonConfig';
import BubbleDragonGameScene from '../Scenes/BubbleDragonGameScene';

export default class BubbleDragoneGuiDialog extends UIDialog {
  /** 遊戲場景 */
  public declare scene: BubbleDragonGameScene;
  /** 靜音按鈕位置 */
  private readonly muteIconPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 60, this.height - 40);
  /** 分數元件位置 */
  private readonly scoreLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 125, 30);
  /** 彈匣位置 */
  private readonly magazinePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(89, this.height - 150);
  /** 防禦線偏移量 */
  private readonly defenceLineOffset: number = 23;
  /** 防禦線位置Y */
  private readonly defenceLinePositionY: number = 253;
  /** 防禦線縮放比例 */
  private readonly defenceLineScale: number = 0.83;
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
  /** 分數顯示 */
  private scoreLayout!: ScoreLayout;

  protected setUI(): void {
    this.setScoreComponent();
    this.setMuteIcon();
    this.setMagazine();
    this.setDefenceLine();
  }

  /** 更新分數顯示
   * @param score 分數數值
   */
  public updateScoreCount(score: number, targetScore: number): void {
    this.scoreLayout.setScoreText(`${score} / ${targetScore}`);
  }

  /** 設置分數元件(圖像、文字) */
  private setScoreComponent(): void {
    this.scoreLayout = this.addObject(this.scoreLayoutPosition.x, this.scoreLayoutPosition.y, ScoreLayout);
  }

  /** 設置音訊開關按鈕 */
  private setMuteIcon(): void {
    this.addImage('', this.muteIconPos.x, this.muteIconPos.y, '', MuteIcon);
  }

  /** 設置彈匣 */
  private setMagazine(): void {
    this.addImage(BubbleDragonString.Magazine, this.magazinePosition.x, this.magazinePosition.y);
  }

  /** 設置防禦線 */
  private setDefenceLine(): void {
    const defenceLine = this.addImage(
      BubbleDragonString.DefenceLine,
      this.width -
        BubbleDragonNumber.BubbleWidth * BubbleDragonNumber.MapTotalRow +
        BubbleDragonNumber.BubblePositionRowOffset * (BubbleDragonNumber.MapTotalRow - 1) +
        this.defenceLineOffset,
      this.defenceLinePositionY
    );
    defenceLine.setScale(this.defenceLineScale);
    defenceLine.setOrigin(1, 0.5);
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
      this.readyTextStyle
    );
  }
}
