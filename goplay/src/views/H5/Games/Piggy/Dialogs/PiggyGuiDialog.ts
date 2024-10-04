import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import EnergyBar from '@/views/H5/Scripts/Components/UI/EnergyBar';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import ScoreLayout from '@/views/H5/Scripts/Components/UI/ScoreLayout';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import UIDialog from '../../../Scripts/Components/UIDialog';
import { PiggyNumber, PiggyString } from '../Data/PiggyConfig';
import PiggyGameScene from '../Scenes/PiggyGameScene';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

export default class PiggyGuiDialog extends UIDialog {
  /** 遊戲場景 */
  public declare scene: PiggyGameScene;
  /** 魔力條位置 */
  private readonly energyBarPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width * 0.11, this.height * 0.92);
  /** 魔力條縮放 */
  private readonly energyBarScale: number = 0.8;
  /** 射擊按鈕大小 */
  private readonly shootButtonSize: Size = { width: 90, height: 93 };
  /** 射擊按鈕文字風格 */
  private readonly shootButtonTextStyle: TextStyle = {
    fontSize: '16px',
  };
  /** 射擊按鈕文字 */
  private readonly shootButtonText: string = Localization.getText(LocalKeyType.Common, 'piggy_UI_Shoot');
  /** 射擊按鈕遮罩圓角 */
  private readonly shootButtonMaskRadius: number = 20;

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

  /** 魔力條 */
  private energyBar!: EnergyBar;
  /** 分數顯示 */
  private scoreLayout!: ScoreLayout;
  /** 射擊按鈕 */
  public shootButton!: Object2D;
  /** 射擊按鈕遮罩 */
  private shootButtonMask!: Phaser.GameObjects.Graphics;

  protected setUI(): void {
    // 設置魔力條
    this.energyBar = this.addObject(this.energyBarPos.x, this.energyBarPos.y, EnergyBar);
    this.energyBar.setScale(this.energyBarScale);
    // 設置分數、目標顯示
    this.scoreLayout = this.addObject(this.width * 0.85, this.height * 0.05, ScoreLayout);

    // 靜音按鈕
    this.addImage('', this.scene.game.canvas.width - 60, this.scene.game.canvas.height - 40, '', MuteIcon);
    // 射擊按鈕
    this.shootButton = this.addObject(this.scene.game.canvas.width - 150, this.scene.game.canvas.height - 50);
    this.shootButton.setSize(this.shootButtonSize.width, this.shootButtonSize.height);
    this.shootButton.addImage(PiggyString.Shoot, 0, 0);
    this.shootButton.addText(this.shootButtonText, 0, 25, this.shootButtonTextStyle);
    // 設置遮罩
    this.shootButtonMask = this.shootButton.addGraphics(0, 0);
    this.shootButtonMask.fillStyle(PiggyNumber.IconBgColor, PiggyNumber.IconAlpha);
    this.shootButtonMask.fillRoundedRect(
      -this.shootButtonSize.width / 2,
      -this.shootButtonSize.height / 2,
      this.shootButtonSize.width,
      this.shootButtonSize.height,
      this.shootButtonMaskRadius
    );
    this.shootButtonMask.setVisible(false);
    // 空白鍵圖示
    this.shootButton.addImage(
      PiggyString.SpaceKeyIcon,
      -this.shootButtonSize.width / 4,
      -this.shootButtonSize.height / 2
    );

    // 開始input互動
    this.shootButton.setInteractive({ useHandCursor: true });
    // 按下/放開偵測
    this.shootButton.on(Phaser.Input.Events.POINTER_DOWN, this.scene.clickShootButton, this.scene);
    this.shootButton.on(Phaser.Input.Events.POINTER_DOWN, () => this.shootButtonMask.setVisible(true));
    this.shootButton.on(Phaser.Input.Events.POINTER_UP, () => this.shootButtonMask.setVisible(false));
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
  //#endregion
}
