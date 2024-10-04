import UIHelper from '@/views/H5/Helper/UIHelper';
import UIDialog from '../../../Scripts/Components/UIDialog';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import WaveLayout from '@/views/H5/Scripts/Components/UI/WaveLayout';
import Slider, { ValueColor } from '@/views/H5/Scripts/Components/Slider';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import PopUpHintLayout from '@/views/H5/Scripts/Components/UI/PopUpHintLayout';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import AntiTDGameScene from '../Scenes/AntiTDGameScene';
import { AntiTDNumber, AntiTDString } from '../Data/AntiTDConfig';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

export default class AntiTDGuiDialog extends UIDialog {
  /** 遊戲場景 */
  public declare scene: AntiTDGameScene;

  //#region readonly
  /** 倒數計時 */
  private readonly countDownTime: number = 3;
  /** 遊戲準備文字Key */
  private readonly readyTextKey: string = 'ready';
  /** 遊戲準備文字風格 */
  private readonly readyTextStyle: TextStyle = { fontSize: '96px', color: UIHelper.yellowString };
  /** 遊戲開始文字Key */
  private readonly startTextKey: string = 'start';
  /** 魔力不足PopUp提示元件位置 */
  private readonly popUpHintLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.centerX, 145);
  /** PopUp提示圖示尺寸 */
  private readonly popUpHintIconSize: number = 40;
  /** 魔力不足PopUp提示元件多國Key */
  private readonly popUpNotEnoughEnergyTextKey: string = 'notEnoughEnergy';
  /** 道具不能使用PopUp提示元件多國Key */
  private readonly popUpItemNotAvailableTextKey: string = 'itemNotAvailable';
  /** 有英雄可供選擇PopUp提示元件多國Key */
  private readonly popUpHeroAvailableTextKey: string = 'antiTD_heroAvailable';
  /** 魔力條位置 */
  private readonly energyBarPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(120, this.height - 35);
  /** 魔力條尺寸 */
  private readonly energyBarSize: Size = { width: 120, height: 24 };
  /** 魔力條Stroke */
  private readonly energyBarStroke = 1.5;
  /** 魔力條Padding */
  private readonly energyBarPadding = 2;
  /** 魔力條標題文字 */
  private readonly energyTitle: string = Localization.getText(LocalKeyType.Common, 'currentEnergy');
  /** 魔力條標題文字位置 */
  private readonly energyTitlePos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, -25);
  /** 魔力條標題文字風格 */
  private readonly energyTitleStyle: TextStyle = { fontSize: '14px' };
  /** 波次題示-持續秒數 */
  private readonly wavePromptDurationSec: number = 3;
  /** 波次進度元件尺寸 */
  private readonly waveProgressComponentSize: Size = { width: 80, height: 28 };
  /** 波次進度元件位置 */
  private readonly waveProgressComponentPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 47, 67);
  /** 波次進度元件左緣 */
  public readonly waveProgressComponentLeft: number =
    this.waveProgressComponentPos.x - this.waveProgressComponentSize.width / 2;
  /** 波次進度元件下緣 */
  public readonly waveProgressComponentDown: number =
    this.waveProgressComponentPos.y + this.waveProgressComponentSize.height / 2;
  /** 波次進度標題文字 */
  private readonly waveProgressTitle: string = Localization.getText(LocalKeyType.Common, 'Wave');
  /** 波次進度標題文字位置 */
  private readonly waveProgressTitlePos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-20, 0);
  /** 波次進度標題文字風格 */
  private readonly waveProgressTitleStyle: TextStyle = { fontSize: '16px' };
  /** 波次進度標題文字位置 */
  private readonly currentWaveProgressPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(10, 0);
  /** 波次目前進度文字風格 */
  private readonly currentWaveProgressStyle: TextStyle = { fontSize: '16px', color: '#F7E735' };
  /** 波次進度標題文字位置 */
  private readonly totalWaveProgressPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(25, 0);
  /** 波次總進度文字風格 */
  private readonly totalWaveProgressStyle: TextStyle = { fontSize: '16px' };

  /** 進度條元件尺寸 */
  private readonly progressBarComponentSize: Size = { width: 276, height: 38 };
  /** 進度條元件位置 */
  private readonly progressBarComponentPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    this.width - this.progressBarComponentSize.width / 2 - 5,
    this.progressBarComponentSize.height / 2 + 5
  );
  /** 進度條元件左緣 */
  public readonly progressBarComponentLeft: number =
    this.progressBarComponentPos.x - this.progressBarComponentSize.width / 2;
  /** 進度條元件下緣 */
  public readonly progressBarComponentDown: number =
    this.progressBarComponentPos.y + this.progressBarComponentSize.height / 2;
  /** 進度條位置 */
  private readonly progressBarPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(70, 0);
  /** 進度條顏色 */
  private readonly progressBarValueColor: ValueColor[] = [{ value: 1, color: 0xe072ea }];
  /** 進度條尺寸 */
  private readonly progressBarSize: Size = { width: 120, height: 24 };
  /** 進度條敵人圖示 */
  private readonly progressBarEnemyIconPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-120, 0);
  /** 進度條標題文字 */
  private readonly progressTitle: string = Localization.getText(LocalKeyType.Common, 'antiTD_enemyClearRate');
  /** 進度條標題文字位置 */
  private readonly progressTitlePos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-50, 0);
  /** 進度條標題文字風格*/
  private readonly progressTitleStyle: TextStyle = { fontSize: '16px' };
  /** 波次顯示元件 */
  private readonly waveLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.centerX, 90);

  /** 時間到警示元件位置 */
  private readonly timeUpWarningComponentPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.centerX, this.centerY);
  /** 時間到警示背景位置 */
  private readonly timeUpWarningBgPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  /** 時間到警示背景縮放 */
  private readonly timeUpWarningBgScale: number = 0.54;
  /** 時間到警示圖示位置 */
  private readonly timeUpWarningIconPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-120, -40);
  /** 時間到警示圖示縮放 */
  private readonly timeUpWarningIconScale: number = 0.6;
  /** 時間到警示分隔線位置 */
  private readonly timeUpWarningLinePos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  /** 時間到警示分隔線縮放 */
  private readonly timeUpWarningLineScale: number = 0.54;
  /** 時間到警示標題文字 */
  private readonly timeUpWarningTitleText: string = Localization.getText(
    LocalKeyType.Common,
    'antiTD_timeUpWarning_title'
  );
  /** 時間到警示標題文字位置 */
  private readonly timeUpWarningTitlePos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, -30);
  /** 時間到警示標題文字風格 */
  private readonly timeUpWarningStyle: TextStyle = { color: UIHelper.yellowString, fontSize: '40px' };
  /** 時間到警示內容文字 */
  private readonly timeUpWarningContent: string = Localization.getText(
    LocalKeyType.Common,
    'antiTD_timeUpWarning_content'
  );
  /** 時間到警示內容文字位置 */
  private readonly timeUpWarningContentPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 30);
  /** 時間到警示內容文字風格 */
  private readonly timeUpWarningContentStyle: TextStyle = { fontSize: '20px' };
  //#endregion readonly

  //#region UI元件
  /** 魔力條 */
  private energyBar!: Slider;
  /** 進度條元件 */
  public progressBarComponent!: Object2D;
  /** 進度條 */
  private progressBar!: Slider;
  /** 魔力文字 */
  private energyText!: Phaser.GameObjects.Text;
  /** 進度文字 */
  private progressText!: Phaser.GameObjects.Text;
  /** 波次進度元件 */
  public waveProgressComponent!: Object2D;
  /** 目前波次進度文字 */
  private currentWaveProgressText!: Phaser.GameObjects.Text;
  /** 最大波次進度文字 */
  private totalWaveProgressText!: Phaser.GameObjects.Text;
  /** 波次顯示 */
  private waveLayout!: WaveLayout;
  /** 使用道具時魔力不足、冷卻中PopUp提示 */
  private itemHintLayout!: PopUpHintLayout;
  /** 隊友出現PopUp提示 */
  private teammateHintLayout!: PopUpHintLayout;
  /** 時間到警示元件 */
  public timeUpWarningComponent!: Object2D;
  //#endregion UI元件

  protected setUI(): void {
    this.setEnergyComponent();

    this.setProgressBarComponent();

    this.setWaveProgressComponent();

    this.setWaveComponent();

    this.setHintComponent();

    this.setTimeUpWarningComponent();
  }

  //#region 畫面顯示
  /** 更新魔力條 */
  public updateEnergyBar(currentEnergy: number, maximumEnergy: number): void {
    this.energyBar.setValue(currentEnergy, maximumEnergy);
    this.energyText.setText(`${currentEnergy} / ${maximumEnergy}`);
  }

  /** 更新進度條 */
  public updateProgressBar(waveKills: number, waveStartEnemyCount: number): void {
    this.progressBar.setValue(waveKills, waveStartEnemyCount);
    const currentProgress = Math.floor((waveKills / waveStartEnemyCount) * 100);
    this.progressText.setText(`${currentProgress}%`);
  }

  /** 設定進度條元件透明度 */
  public setProgressBarComponentAlpha(alpha: number): void {
    this.progressBarComponent.setAlpha(alpha);
  }

  /** 更新目前波次進度 */
  public updateCurrentWaveProgress(wave: number): void {
    this.currentWaveProgressText.setText(`${wave + 1}`);
  }

  /** 更新總波次進度 */
  public updateTotalWaveProgress(totalWave: number): void {
    this.totalWaveProgressText.setText(`/${totalWave}`);
  }

  /** 設定波次進度元件透明度 */
  public setWaveProgressComponentAlpha(alpha: number): void {
    this.waveProgressComponent.setAlpha(alpha);
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
      -this.x,
      -this.y
    );
  }

  /** 顯示波數
   * @param wave 波數
   */
  public async showWavePrompt(wave: number): Promise<void> {
    this.waveLayout.showWavePrompt(wave, this.wavePromptDurationSec);
  }

  /** 顯示時間到警示動畫 */
  public async showTimeUpWarning(): Promise<void> {
    const tweenChain = this.scene.tweens.chain({
      tweens: [
        // 左滑出現
        {
          duration: 500,
          targets: this.timeUpWarningComponent,
          x: {
            from: -250,
            to: this.timeUpWarningComponentPos.x,
          },
          hold: 750,
          onStart: () => {
            this.timeUpWarningComponent.setVisible(true);
          },
        },
        // 右滑消失
        {
          duration: 500,
          targets: this.timeUpWarningComponent,
          x: this.width + 250,
        },
      ],
    });

    await AsyncHelper.pendingUntil(() => tweenChain.isFinished());
  }

  /** 播放魔力不足PopUp提示 */
  public playNotEnoughEnergyHint(): void {
    // 播放提示
    this.itemHintLayout.playPopupTween(this.popUpNotEnoughEnergyTextKey);
  }

  /** 播放道具不可使用PopUp提示 */
  public playItemNotAvailableHint(): void {
    // 播放提示
    this.itemHintLayout.playPopupTween(this.popUpItemNotAvailableTextKey);
  }

  /** 播放有英雄可供選擇PopUp提示 */
  public playHeroAvailableHint(): void {
    // 播放提示
    this.teammateHintLayout.playPopupTween(this.popUpHeroAvailableTextKey);
  }
  //#endregion

  //#region 初始化
  /** 設定魔力元件 */
  private setEnergyComponent(): void {
    // 能量值 bar
    this.energyBar = this.addObject(this.energyBarPos.x, this.energyBarPos.y, Slider);
    this.energyBar.setValueColor({ value: 1, color: UIHelper.energyBarColor });
    this.energyBar.setBarSize(
      this.energyBarSize.width,
      this.energyBarSize.height,
      this.energyBarStroke,
      this.energyBarPadding
    );

    // 魔力條icon
    this.energyBar.addSprite(BaseSceneString.EnergyIcon, -75, 0).setScale(0.6);
    // 魔力條數值文字
    this.energyText = this.energyBar.addText(`0/0`, 0, 0);

    // 魔力條標題
    this.energyBar.addText(this.energyTitle, this.energyTitlePos.x, this.energyTitlePos.y, this.energyTitleStyle);
  }

  /** 設定進度條元件 */
  private setProgressBarComponent(): void {
    // 設定進度條物件
    this.progressBarComponent = this.addObject(this.progressBarComponentPos.x, this.progressBarComponentPos.y);
    this.progressBarComponent.setSize(this.progressBarComponentSize.width, this.progressBarComponentSize.height);
    // 設定進度條背景
    const progressBg = this.progressBarComponent.addGraphics(0, 0);
    progressBg.fillStyle(UIHelper.blackNumber);
    progressBg.fillRoundedRect(
      -this.progressBarComponent.width / 2,
      -this.progressBarComponent.height / 2,
      this.progressBarComponent.width,
      this.progressBarComponent.height,
      10
    );
    // 設定進度條敵人圖示
    this.progressBarComponent.addImage(
      AntiTDString.EnemyIcon,
      this.progressBarEnemyIconPos.x,
      this.progressBarEnemyIconPos.y
    );
    // 設定進度條標題
    this.progressBarComponent.addText(
      this.progressTitle,
      this.progressTitlePos.x,
      this.progressTitlePos.y,
      this.progressTitleStyle
    );
    // 設定進度條
    this.progressBar = this.progressBarComponent.addObject(this.progressBarPos.x, this.progressBarPos.y, Slider);
    this.progressBar.setValueColor(this.progressBarValueColor);
    this.progressBar.setBarSize(this.progressBarSize.width, this.progressBarSize.height, 1.5, 2);
    // 設定進度條數值
    this.progressText = this.progressBar.addText(`0%`, 0, 0);
    // 設定進度條合格線
    const qualifiedLine = this.progressBar.addGraphics(0, 0);
    qualifiedLine.lineStyle(3, UIHelper.whiteNumber);
    const qualifiedLineX =
      -this.progressBarSize.width / 2 + this.progressBarSize.width * AntiTDNumber.WaveEnemyTeamKillsRequireRate;
    const qualifiedLineHalfHeight = this.progressBarSize.height / 2 + 3;
    qualifiedLine.lineBetween(qualifiedLineX, -qualifiedLineHalfHeight, qualifiedLineX, qualifiedLineHalfHeight);
  }

  /** 設波次進度元件 */
  private setWaveProgressComponent(): void {
    // 設定波次進度元件
    this.waveProgressComponent = this.addObject(this.waveProgressComponentPos.x, this.waveProgressComponentPos.y);
    this.waveProgressComponent.setSize(this.waveProgressComponentSize.width, this.waveProgressComponentSize.height);
    // 設定波次進度背景
    const waveProgressBg = this.waveProgressComponent.addGraphics(0, 0);
    waveProgressBg.fillStyle(UIHelper.blackNumber);
    waveProgressBg.fillRoundedRect(
      -this.waveProgressComponent.width / 2,
      -this.waveProgressComponent.height / 2,
      this.waveProgressComponent.width,
      this.waveProgressComponent.height,
      5
    );
    // 設定波次進度標題
    this.waveProgressComponent.addText(
      this.waveProgressTitle,
      this.waveProgressTitlePos.x,
      this.waveProgressTitlePos.y,
      this.waveProgressTitleStyle
    );

    // 設定波次目前進度
    this.currentWaveProgressText = this.waveProgressComponent.addText(
      '0',
      this.currentWaveProgressPos.x,
      this.currentWaveProgressPos.y,
      this.currentWaveProgressStyle
    );
    // 設定波次總進度
    this.totalWaveProgressText = this.waveProgressComponent.addText(
      '/0',
      this.totalWaveProgressPos.x,
      this.totalWaveProgressPos.y,
      this.totalWaveProgressStyle
    );
  }

  /** 設定波次元件 */
  private setWaveComponent(): void {
    this.waveLayout = this.addObject(this.waveLayoutPosition.x, this.waveLayoutPosition.y, WaveLayout);
  }

  /** 設定提示元件 */
  private setHintComponent(): void {
    // 設定道具PopUp提示顯示
    this.itemHintLayout = this.addObject(
      this.popUpHintLayoutPosition.x,
      this.popUpHintLayoutPosition.y,
      PopUpHintLayout,
      '', // 圖示
      this.popUpHintIconSize, // 圖示尺寸
      BaseSceneString.GradientRed // 背景
    );

    // 設定隊友PopUp提示顯示
    this.teammateHintLayout = this.addObject(
      this.popUpHintLayoutPosition.x,
      this.popUpHintLayoutPosition.y,
      PopUpHintLayout,
      AntiTDString.TeamIcon, // 圖示
      this.popUpHintIconSize // 圖示尺寸
    );
  }

  /** 設定時間到警示元件 */
  private setTimeUpWarningComponent(): void {
    this.timeUpWarningComponent = this.addObject(this.timeUpWarningComponentPos.x, this.timeUpWarningComponentPos.y);
    this.timeUpWarningComponent.setScale(1 / AntiTDNumber.CameraZoomOnResult);
    this.timeUpWarningComponent.setVisible(false);

    // 文字後黑底
    const bg = this.timeUpWarningComponent.addImage(
      AntiTDString.FramePurple,
      this.timeUpWarningBgPos.x,
      this.timeUpWarningBgPos.y
    );
    bg.setScale(this.timeUpWarningBgScale);

    // icon
    const icon = this.timeUpWarningComponent.addImage(
      AntiTDString.WarningIcon,
      this.timeUpWarningIconPos.x,
      this.timeUpWarningIconPos.y
    );
    icon.setScale(this.timeUpWarningIconScale);

    // 標題文字訊息
    this.timeUpWarningComponent.addText(
      this.timeUpWarningTitleText,
      this.timeUpWarningTitlePos.x,
      this.timeUpWarningTitlePos.y,
      this.timeUpWarningStyle
    );

    // 中間線
    const lineImg = this.timeUpWarningComponent.addImage(
      AntiTDString.Line,
      this.timeUpWarningLinePos.x,
      this.timeUpWarningLinePos.y
    );
    lineImg.setScale(this.timeUpWarningLineScale);

    // 副標題文字訊息
    this.timeUpWarningComponent.addText(
      this.timeUpWarningContent,
      this.timeUpWarningContentPos.x,
      this.timeUpWarningContentPos.y,
      this.timeUpWarningContentStyle
    );
  }

  //#endregion
}
