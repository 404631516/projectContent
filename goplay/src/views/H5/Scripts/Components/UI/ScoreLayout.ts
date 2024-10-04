import UIHelper from '@/views/H5/Helper/UIHelper';
import { BaseSceneString } from '../../Data/BaseSceneConfig';
import HorizontalLayout from '../HorizontalLayout';
import Localization, { LocalKeyType } from '../Localization';
import Object2D from '../Object2D';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

export default class ScoreLayout extends Object2D {
  /** 標題文字風格 */
  private readonly titleTextStyle: TextStyle = {
    stroke: UIHelper.blackString,
    strokeThickness: 1,
    color: UIHelper.yellowString,
  };
  /** 分數文字寬度 */
  private readonly scoreTextWidth: number = 120;

  /** 分數文字 */
  private scoreText!: Phaser.GameObjects.Text;

  /** 建構式
   * @param scene 場景
   * @param x 位置x
   * @param y 位置y
   * @param iconKey 圖示key，若無則不顯示
   * @param iconSize 圖示尺寸
   * @param titleKey 標題文字多國Key
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    iconKey: string = '',
    iconSize: number = 32,
    titleKey: string = 'target'
  ) {
    super(scene, x, y);

    // 背景框
    this.addImage(BaseSceneString.TargetGradient, 0, 0);

    // 創建Layout
    const layout = new HorizontalLayout(this);
    layout.fitElements = true;

    // 假如有設置圖示
    if (iconKey !== '') {
      // 分數圖示
      const scoreIcon = this.addImage(iconKey, 0, 0);
      // 設置分數圖示尺寸
      scoreIcon.setDisplaySize(iconSize, iconSize);
      // 加入Layout
      layout.addElements([scoreIcon]);
    }

    // 假如有設置標題
    if (titleKey !== '') {
      // 標題文字
      const titleText = this.addText(Localization.getText(LocalKeyType.Common, titleKey), 0, 0, this.titleTextStyle);
      // 加入Layout
      layout.addElements(titleText);
    }

    // 分數文字
    this.scoreText = this.addText('', 0, 0);
    // 設置寬度(約可容納10個數字)
    this.scoreText.width = this.scoreTextWidth;
    // 加入Layout
    layout.addElements(this.scoreText);

    // 重算容器範圍及背景，排列容器內元件
    layout.draw();
  }

  /** 設置分數文字
   * @param score 要顯示的分數文字
   */
  public setScoreText(score: string): void {
    this.scoreText.setText(score);
  }
}
