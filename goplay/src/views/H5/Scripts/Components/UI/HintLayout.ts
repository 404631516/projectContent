import { Size } from '@/views/H5/Helper/PhaserHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { BaseSceneString } from '../../Data/BaseSceneConfig';
import HorizontalLayout from '../HorizontalLayout';
import Localization, { LocalKeyType } from '../Localization';
import Object2D from '../Object2D';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

export default class HintLayout extends Object2D {
  /** 分數圖示實際尺寸 */
  private readonly infoIconSize: Size = { width: 20, height: 42.5 };
  /** 分數圖示渲染尺寸 */
  private readonly infoIconDisplaySize: Size = { width: 25, height: 26 };
  /** 分數圖示描點 */
  private readonly infoIconOrgin: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0.5, 1);

  /** 提示圖示尺寸 */
  private readonly hintIconSize: number = 32;
  /** 提示文字風格 */
  private readonly hintTextStyle: TextStyle = {
    color: UIHelper.whiteString,
    fontSize: '16px',
  };

  /** 建構式
   * @param scene 場景
   * @param x 位置x
   * @param y 位置y
   * @param hintIconKey 圖示key，若無則不顯示
   * @param hintTextKey 提示文字多國Key
   */
  constructor(scene: Phaser.Scene, x: number, y: number, hintIconKey: string = '', hintTextKey: string) {
    super(scene, x, y);

    // 背景框
    this.addImage(BaseSceneString.GradientGray, 0, 0);

    // 創建Layout
    const layout = new HorizontalLayout(this);
    layout.fitElements = true;

    // 設置資訊圖示(驚嘆號)
    const infoIcon = this.addImage(BaseSceneString.InfoIcon, 0, 0);
    infoIcon.setDisplaySize(this.infoIconDisplaySize.width, this.infoIconDisplaySize.height);
    infoIcon.setOrigin(this.infoIconOrgin.x, this.infoIconOrgin.y);
    layout.addElements([infoIcon]);

    // 假如有設置提示圖示
    if (hintIconKey !== '') {
      // 提示圖示
      const scoreIcon = this.addImage(hintIconKey, 0, 0);
      scoreIcon.setDisplaySize(this.hintIconSize, this.hintIconSize);
      // 提示圖示移至資訊圖示下方
      this.moveBelow(scoreIcon, infoIcon);
      // 加入Layout
      layout.addElements([scoreIcon]);
    }

    // 提示文字
    const hintText = this.addText(Localization.getText(LocalKeyType.Common, hintTextKey), 0, 0, this.hintTextStyle);
    // 提示文字移至資訊圖示下方
    this.moveBelow<Phaser.GameObjects.GameObject>(hintText, infoIcon);
    // 加入Layout
    layout.addElements([hintText]);

    // 重算容器範圍及背景，排列容器內元件
    layout.draw();
  }
}
