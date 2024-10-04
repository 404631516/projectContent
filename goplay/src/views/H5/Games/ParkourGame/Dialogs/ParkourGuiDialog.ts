import UIDialog from '../../../Scripts/Components/UIDialog';
import ParkourGameScene from '../Scenes/ParkourGameScene';
import { ParkourString } from '../Data/ParkourConfig';
import UIHelper from '@/views/H5/Helper/UIHelper';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import EnergyBar from '@/views/H5/Scripts/Components/UI/EnergyBar';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import ScoreLayout from '@/views/H5/Scripts/Components/UI/ScoreLayout';

export default class ParkourGuiDialog extends UIDialog {
  /** 遊戲場景 */
  public declare scene: ParkourGameScene;

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
  private readonly energyBarPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(190, this.height - 40);
  /** 分數元件位置 */
  private readonly scoreLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 125, 30);
  /** 操控跳躍的按鍵碼 */
  private readonly jumpKey = 'SPACE';
  //#endregion

  //#region variable
  /** 偵測點擊範圍，控制角色跳躍 */
  private mainHitZone!: Phaser.GameObjects.Zone;
  /** 能量條 */
  private energyBar!: EnergyBar;
  /** 分數顯示 */
  private scoreLayout!: ScoreLayout;
  //#endregion

  /** 設置玩家Gui */
  protected setUI(): void {
    this.setMainHitZone();

    this.setEnergyComponent();

    this.setScoreComponent();

    this.setMuteIcon();
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

  //#region 初始化
  /** 設定主要觸控範圍 */
  private setMainHitZone(): void {
    // 全螢幕
    this.mainHitZone = this.addZone(this.centerX, this.centerY, this.width, this.height);
    this.mainHitZone.setInteractive({ useHandCursor: true });

    // 點擊觸發跳躍
    this.mainHitZone.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.scene.heroJump();
    });

    // 綁定鍵盤觸發跳躍
    this.scene.input.keyboard!.on(`keydown-${this.jumpKey}`, () => {
      this.scene.heroJump();
    });
  }

  /** 設定魔力元件 */
  private setEnergyComponent(): void {
    // 能量值 bar
    this.energyBar = this.addObject(this.energyBarPos.x, this.energyBarPos.y, EnergyBar);
  }

  /** 設置分數元件(圖像、文字) */
  private setScoreComponent(): void {
    this.scoreLayout = this.addObject(
      this.scoreLayoutPosition.x,
      this.scoreLayoutPosition.y,
      ScoreLayout,
      ParkourString.IconScore
    );
  }

  /**設置音訊開關按鈕 */
  private setMuteIcon(): void {
    this.addImage('', this.muteIconPos.x, this.muteIconPos.y, '', MuteIcon);
  }
  //#endregion
}
