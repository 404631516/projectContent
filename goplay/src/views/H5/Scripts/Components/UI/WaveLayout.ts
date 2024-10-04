import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { BaseSceneString } from '../../Data/BaseSceneConfig';
import Localization, { LocalKeyType } from '../Localization';
import Object2D from '../Object2D';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

export default class WaveLayout extends Object2D {
  /** 波次提示-文字 */
  private readonly wavePromptTextKey1: string = 'wave_title_text1';
  private readonly wavePromptTextKey2: string = 'wave_title_text2';
  /** 波次題示-文字風格 */
  private readonly wavePromptTextStyle: TextStyle = { color: UIHelper.whiteString, fontSize: '24px' };
  /** 波次題示-數字風格 */
  private readonly wavePromptNumberStyle: TextStyle = { color: UIHelper.yellowString, fontSize: '24px' };
  /** 波次題示-位置 */
  private readonly wavePromptPosition1: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-60, 0);
  private readonly wavePromptNumberPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, -4);
  private readonly wavePromptPosition2: Phaser.Math.Vector2 = new Phaser.Math.Vector2(50, 0);

  /** 波次題示文字 */
  private wavePromptText1!: Phaser.GameObjects.Text;
  private wavePromptNumberText!: Phaser.GameObjects.Text;
  private wavePromptText2!: Phaser.GameObjects.Text;
  /** 波次題示背景圖 */
  private wavePromptBg!: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x?: number | undefined, y?: number | undefined) {
    super(scene, x, y);
    this.wavePromptBg = this.addImage(BaseSceneString.GradientPurple, 0, 0);
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
    this.hideWavePrompt();
  }

  /** 顯示波次提示
   * @param wave 波次
   * @param staySecond 停留秒數
   */
  public async showWavePrompt(wave: number, staySecond: number): Promise<void> {
    // 顯示
    this.wavePromptBg.alpha = 1;

    this.wavePromptText1.text = `${Localization.getText(LocalKeyType.Common, this.wavePromptTextKey1)}`;
    this.wavePromptText1.alpha = 1;
    this.wavePromptNumberText.text = `${wave + 1}`;
    this.wavePromptNumberText.alpha = 1;
    this.wavePromptText2.text = `${Localization.getText(LocalKeyType.Common, this.wavePromptTextKey2)}`;
    this.wavePromptText2.alpha = 1;

    // 等待數秒
    await AsyncHelper.sleep(staySecond);

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
}
