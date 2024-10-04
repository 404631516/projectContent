import UIDialog from '../../../Scripts/Components/UIDialog';
import { BomberManString, BomberManDepth } from '../Data/BomberManConfig';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import EnergyBar from '@/views/H5/Scripts/Components/UI/EnergyBar';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import ScoreLayout from '@/views/H5/Scripts/Components/UI/ScoreLayout';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** 顯示炸彈超人的資訊 */
export default class BomberManDialog extends UIDialog {
  //#region readonly
  /** 血條位置 */
  private readonly hpBarPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(200, 460);
  /** 下方黑底位置 */
  private readonly gradientGrayBottomPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(400, 460);

  /** 放炸彈鈕位置 */
  private readonly putBombBtnPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(880, 456);
  /** 放炸彈鈕縮放 */
  private readonly putBombBtnBgScale: number = 0.8;
  private readonly putBombBtnScale: number = 0.6;

  //#region opening
  /** 倒數計時 */
  private readonly countDownTime: number = 3;
  /** 遊戲準備提示文字 */
  private readonly readyTextKey: string = 'ready';
  private readonly startTextKey: string = 'start';
  /** 準備提示文字風格 */
  private readonly hintTextStyle: TextStyle = { fontSize: '96px', color: UIHelper.yellowString };
  /** 無法移動提示-文字 */
  private readonly forbidMoveTextKey: string = 'bomber_forbid_move_text';
  /** 無法移動提示-文字風格 */
  private readonly forbidMoveStyle: TextStyle = { fontSize: '24px', color: UIHelper.whiteString };
  /** 無法移動提示-位置 */
  private readonly forbidMovePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(500, 80);
  /** 無法移動提示-持續秒數 */
  private readonly forbidMoveDurationSec: number = 1;
  //#endregion opening

  /** 靜音按鈕位置 */
  private readonly muteIconPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 60, this.height - 40);

  /** 分數元件位置 */
  private readonly scoreLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 125, 30);

  /** 波次提示-文字 */
  private readonly wavePromptTextKey1: string = 'bomber_wave_title_text1';
  private readonly wavePromptTextKey2: string = 'bomber_wave_title_text2';
  /** 波次題示-文字風格 */
  private readonly wavePromptTextStyle: TextStyle = { fontSize: '24px', color: UIHelper.whiteString };
  /** 波次題示-數字風格 */
  private readonly wavePromptNumberStyle: TextStyle = { fontSize: '24px', color: UIHelper.yellowString };
  /** 波次題示-位置 */
  private readonly wavePromptPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(500, 80);
  private readonly wavePromptPosition1: Phaser.Math.Vector2 = new Phaser.Math.Vector2(465, 80);
  private readonly wavePromptNumberPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(525, 76);
  private readonly wavePromptPosition2: Phaser.Math.Vector2 = new Phaser.Math.Vector2(575, 80);
  /** 波次題示-持續秒數 */
  private readonly wavePromptDurationSec: number = 3;
  //#endregion readonly

  //#region data
  /** 能量條 */
  public energyBar!: EnergyBar;
  /** 分數顯示 */
  private scoreLayout!: ScoreLayout;
  /** 放置炸彈按鈕 */
  public putBombBtn!: Phaser.GameObjects.Image;

  /** 不可移動提示文字 */
  private forbidMoveText!: Phaser.GameObjects.Text;
  /** 不可移動提示背景圖 */
  private forbidMoveBg!: Phaser.GameObjects.Image;

  /** 波次題示文字 */
  private wavePromptText1!: Phaser.GameObjects.Text;
  private wavePromptNumberText!: Phaser.GameObjects.Text;
  private wavePromptText2!: Phaser.GameObjects.Text;
  /** 波次題示背景圖 */
  private wavePromptBg!: Phaser.GameObjects.Image;
  //#endregion data

  /** 設定固定ui */
  protected setUI(): void {
    // 深度
    this.setDepth(BomberManDepth.mainDialog);

    // 下方黑底
    this.addImage(
      BomberManString.GradientGrayBottom,
      this.gradientGrayBottomPosition.x,
      this.gradientGrayBottomPosition.y
    );

    // 能量條
    this.energyBar = this.addObject(this.hpBarPosition.x, this.hpBarPosition.y, EnergyBar);
    this.energyBar.setDepth(BomberManDepth.hpBar);

    // 設置分數元件
    this.setScoreComponent();

    // 放置炸彈按鈕
    const pubBombBtnBg = this.addImage(
      BomberManString.PutBombBtnBg,
      this.putBombBtnPosition.x,
      this.putBombBtnPosition.y
    );
    pubBombBtnBg.setScale(this.putBombBtnBgScale);
    this.putBombBtn = this.addImage(BomberManString.PutBombBtn, this.putBombBtnPosition.x, this.putBombBtnPosition.y);
    this.putBombBtn.setScale(this.putBombBtnScale);
    // 設置按下按鈕event
    this.putBombBtn.setInteractive({ useHandCursor: true });

    // 不可移動提示
    this.forbidMoveBg = this.addImage(
      BomberManString.GradientRed,
      this.forbidMovePosition.x,
      this.forbidMovePosition.y
    );
    this.forbidMoveText = this.addText(
      Localization.getText(LocalKeyType.Common, this.forbidMoveTextKey),
      this.forbidMovePosition.x,
      this.forbidMovePosition.y,
      this.forbidMoveStyle
    );
    // 隱藏
    this.hideForbidMovePrompt();

    // 不可移動提示
    this.setWavePrompt();
    // 隱藏
    this.hideWavePrompt();

    // 設置音訊開關按鈕
    this.setMuteIcon();
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
      this.hintTextStyle
    );
  }

  /** 顯示無法移動提示 */
  public async showForbidMovePrompt(): Promise<void> {
    // 顯示
    this.forbidMoveBg.alpha = 1;
    this.forbidMoveText.alpha = 1;

    // 等待數秒
    await AsyncHelper.sleep(this.forbidMoveDurationSec);

    // 隱藏
    this.hideForbidMovePrompt();
  }
  /** 隱藏無法移動提示 */
  public hideForbidMovePrompt(): void {
    this.forbidMoveBg.alpha = 0;
    this.forbidMoveText.alpha = 0;
  }

  /** 設置波次提示 */
  public async setWavePrompt(): Promise<void> {
    this.wavePromptBg = this.addImage(
      BomberManString.GradientPurple,
      this.wavePromptPosition.x,
      this.wavePromptPosition.y
    );
    this.wavePromptText1 = this.addText(
      '',

      this.wavePromptPosition1.x,
      this.wavePromptPosition1.y,
      this.wavePromptTextStyle
    );
    this.wavePromptNumberText = this.addText(
      '',
      this.wavePromptNumberPosition.x,
      this.wavePromptNumberPosition.y,
      this.wavePromptNumberStyle
    );
    this.wavePromptText2 = this.addText(
      '',
      this.wavePromptPosition2.x,
      this.wavePromptPosition2.y,
      this.wavePromptTextStyle
    );
  }

  /** 顯示波次提示
   * @param wave 波次
   */
  public async showWavePrompt(wave: number): Promise<void> {
    // 顯示
    this.wavePromptBg.alpha = 1;

    this.wavePromptText1.text = `${Localization.getText(LocalKeyType.Common, this.wavePromptTextKey1)}`;
    this.wavePromptText1.alpha = 1;
    this.wavePromptNumberText.text = `${wave + 1}`;
    this.wavePromptNumberText.alpha = 1;
    this.wavePromptText2.text = `${Localization.getText(LocalKeyType.Common, this.wavePromptTextKey2)}`;
    this.wavePromptText2.alpha = 1;

    // 等待數秒
    await AsyncHelper.sleep(this.wavePromptDurationSec);

    // 隱藏
    this.hideWavePrompt();
  }
  /** 隱藏波次提示 */
  public hideWavePrompt(): void {
    this.wavePromptBg.alpha = 0;
    this.wavePromptText1.alpha = 0;
    this.wavePromptNumberText.alpha = 0;
    this.wavePromptText2.alpha = 0;
  }

  /** 更新分數顯示
   * @param score 分數數值
   * @param targetScore 目標分數數值
   */
  public updateScoreCount(score: number, targetScore: number) {
    this.scoreLayout.setScoreText(`${score} / ${targetScore}`);
  }

  /**設置音訊開關按鈕 */
  private setMuteIcon(): void {
    this.addImage('', this.muteIconPos.x, this.muteIconPos.y, '', MuteIcon);
  }

  /** 設置分數元件(圖像、文字) */
  private setScoreComponent(): void {
    this.scoreLayout = this.addObject(this.scoreLayoutPosition.x, this.scoreLayoutPosition.y, ScoreLayout);
  }
}
