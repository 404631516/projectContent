import UIDialog from '../../../Scripts/Components/UIDialog';
import UIHelper from '@/views/H5/Helper/UIHelper';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import EnergyBar from '@/views/H5/Scripts/Components/UI/EnergyBar';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import ScoreLayout from '@/views/H5/Scripts/Components/UI/ScoreLayout';
import VerticalParkourGameScene from '../Scenes/VerticalParkourGameScene';
import { VerticalParkourString } from '../Data/VerticalParkourConfig';

export default class VerticalParkourGuiDialog extends UIDialog {
  /** 遊戲場景 */
  public declare scene: VerticalParkourGameScene;

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
  /** 魔力條位置 */
  private readonly energyBarPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(126, this.height - 60);
  /** 分數元件位置 */
  private readonly scoreLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(140, 40);
  /** 鑰匙元件位置 */
  private readonly keyLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(63, 100);
  //#endregion

  //#region variable
  /** 能量條 */
  private energyBar!: EnergyBar;
  /** 分數顯示 */
  private scoreLayout!: ScoreLayout;
  //#endregion

  /** 鑰匙數量 */
  private keyAmount: number = 0;
  /** 鑰匙數量文字 */
  private keyAmountText: Phaser.GameObjects.Text;

  /** 設置玩家Gui */
  protected setUI(): void {
    this.setEnergyComponent();

    this.setScoreComponent();

    this.setMuteIcon();

    this.setKeyAmountText();

    this.setTimerIcon();
  }

  //#region 畫面顯示
  /** 更新魔力條 */
  public updateEnergyBar(currentEnergy: number, maximumEnergy: number): void {
    this.energyBar.updateEnergy(currentEnergy, maximumEnergy);
  }

  /** 更新分數顯示
   * @param score 分數數值
   */
  public updateScoreCount(score: number, targetScore: number): void {
    this.scoreLayout.setScoreText(`${score} / ${targetScore}`);
  }

  /** 增加鑰匙數量
   * @param amount 增加數量
   */
  public increaseKeyAmount(amount: number): void {
    this.keyAmount += amount;
    this.keyAmountText.setText(this.keyAmount.toString());
  }

  /** 減少鑰匙數量
   * @param amount 減少數量
   * @returns 是否減少成功
   */
  public decreaseKeyAmount(amount: number): boolean {
    if (this.keyAmount <= 0 || this.keyAmount < amount) {
      return false;
    }

    this.keyAmount -= amount;
    this.keyAmountText.setText(this.keyAmount.toString());
    return true;
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
  /** 設定魔力元件 */
  private setEnergyComponent(): void {
    // 能量值 bar
    this.energyBar = this.addObject(this.energyBarPos.x, this.energyBarPos.y, EnergyBar);
    this.energyBar.energyIcon.setPosition(-65, -25);
    this.energyBar.energyIcon.setTexture(VerticalParkourString.MagicIcon);
    // this.energyBar.energyIcon.setScale(1);
  }

  /** 設置分數元件(圖像、文字) */
  private setScoreComponent(): void {
    this.scoreLayout = this.addObject(
      this.scoreLayoutPosition.x,
      this.scoreLayoutPosition.y,
      ScoreLayout,
      VerticalParkourString.Coin,
      64,
    );
  }

  /**設置音訊開關按鈕 */
  private setMuteIcon(): void {
    this.addImage('', this.muteIconPos.x, this.muteIconPos.y, '', MuteIcon);
  }

  /** 設置鑰匙數量文字 */
  private setKeyAmountText() {
    this.addSprite(VerticalParkourString.Key, this.keyLayoutPosition.x, this.keyLayoutPosition.y);
    this.addText('鑰匙', this.keyLayoutPosition.x + 50, this.keyLayoutPosition.y);
    this.keyAmountText = this.addText('0', this.keyLayoutPosition.x + 100, this.keyLayoutPosition.y);
  }

  private setTimerIcon() {
    this.addSprite(BaseSceneString.TimerIcon, this.width - 200, this.height - 150);
  }
  //#endregion
}
