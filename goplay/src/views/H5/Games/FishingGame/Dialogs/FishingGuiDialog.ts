import UIHelper from '@/views/H5/Helper/UIHelper';
import UIDialog from '../../../Scripts/Components/UIDialog';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { EnvironmentalAdditionType, FishingNumber, FishingString } from '../Data/FishingConfig';
import FishingGameScene from '../Scenes/FishingGameScene';
import EnergyBar from '@/views/H5/Scripts/Components/UI/EnergyBar';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import ScoreLayout from '@/views/H5/Scripts/Components/UI/ScoreLayout';
import HintLayout from '@/views/H5/Scripts/Components/UI/HintLayout';
import PopUpHintLayout from '@/views/H5/Scripts/Components/UI/PopUpHintLayout';

export default class FishingGuiDialog extends UIDialog {
  /** 釣魚遊戲場景 */
  public declare scene: FishingGameScene;

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

  /** 環保加成提示Key */
  private readonly additionHintKey: string = 'fishing_environmentalAddition_hint';
  /** 環保加成PopUp提示Key */
  private readonly additionPopUpHintKeyMap: Map<EnvironmentalAdditionType, string> = new Map([
    [EnvironmentalAdditionType.Normal, 'fishing_environmentalAddition_popUphint'],
  ]);

  /** 靜音按鈕位置 */
  private readonly muteIconPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 60, this.height - 40);
  /** 魔力條位置 */
  private readonly energyBarPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(190, this.height - 40);
  /** 分數元件位置 */
  private readonly scoreLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 125, 30);
  /** 環保加成提示元件位置 */
  private readonly hintLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 125, 75);
  /** 環保加成PopUp提示元件位置 */
  private readonly popUpHintLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.centerX, 100);

  /** 操控釣魚的按鍵碼 */
  private readonly castKey = 'SPACE';
  //#endregion

  //#region 變數
  /** 魔力條 */
  private energyBar!: EnergyBar;
  /** 分數顯示 */
  private scoreLayout!: ScoreLayout;
  /** 環保加成PopUp提示 */
  private popUpHintLayout!: PopUpHintLayout;
  //#endregion

  protected setUI(): void {
    this.setMainHitZone();

    this.setEnergyComponent();

    this.setScoreComponent();

    this.setHintComponent();

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

  /** 播放PopUp提示
   * @param type 環保加成類別
   */
  public playEnvironmentalAdditionHint(type: EnvironmentalAdditionType): void {
    // 依照環保類別獲取對應文字Key
    const key = this.additionPopUpHintKeyMap.get(type);
    if (key !== undefined) {
      // 播放提示
      this.popUpHintLayout.playPopupTween(key);
    }
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
    const mainHitZone = this.addZone(
      this.centerX,
      // 海平面之下
      (this.height - FishingNumber.SeaLevel) / 2 + FishingNumber.SeaLevel,
      this.width,
      // 與海水高度相同
      this.height - FishingNumber.SeaLevel
    );
    mainHitZone.setInteractive({ useHandCursor: true });

    // 點擊觸發釣魚
    mainHitZone.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.scene.heroCast();
    });

    // 綁定鍵盤觸發釣魚
    this.scene.input.keyboard!.on(`keydown-${this.castKey}`, () => {
      this.scene.heroCast();
    });
  }

  /** 設定魔力元件 */
  private setEnergyComponent(): void {
    // 能量值 bar
    this.energyBar = this.addObject(this.energyBarPos.x, this.energyBarPos.y, EnergyBar);
  }

  /** 設定分數元件 */
  private setScoreComponent(): void {
    this.scoreLayout = this.addObject(
      this.scoreLayoutPosition.x,
      this.scoreLayoutPosition.y,
      ScoreLayout,
      FishingString.IconScore
    );
  }

  /** 設定提示元件 */
  private setHintComponent(): void {
    // 設定固定提示顯示
    this.addObject(
      this.hintLayoutPosition.x,
      this.hintLayoutPosition.y,
      HintLayout,
      FishingString.IconEnvironmentalAddition,
      this.additionHintKey
    );

    // 設定PopUp提示顯示
    this.popUpHintLayout = this.addObject(
      this.popUpHintLayoutPosition.x,
      this.popUpHintLayoutPosition.y,
      PopUpHintLayout,
      FishingString.IconEnvironmentalAddition
    );
  }

  /**設置音訊開關按鈕 */
  private setMuteIcon(): void {
    this.addImage('', this.muteIconPos.x, this.muteIconPos.y, '', MuteIcon);
  }
  //#endregion
}
