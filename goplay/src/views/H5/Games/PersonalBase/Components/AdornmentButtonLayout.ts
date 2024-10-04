import UIHelper from '@/views/H5/Helper/UIHelper';
import HorizontalLayout from '@/views/H5/Scripts/Components/HorizontalLayout';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { AdornmentString } from '../Data/AdornmentConfig';

export default class AdornmentButtonLayout extends Object2D {
  /** 箭頭圖案寬度 */
  private readonly arrowImageWidth: number = 22;
  /** 箭頭圖案高度 */
  private readonly arrowImageHeight: number = 17;
  /** 背景寬度 */
  public backgroundWidth: number = 0;

  /** 建構式
   * @param scene 場景
   * @param x 位置x
   * @param y 位置y
   */
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // 背景框
    const bgFrame = this.addImage(AdornmentString.visitRankBtnBg, 0, 0);
    // 給背景圖寬度
    this.backgroundWidth = bgFrame.width;

    // 創建Layout
    const layout = new HorizontalLayout(this);
    layout.fitElements = true;

    // 箭頭圖示
    const arrowIcon = this.addImage(AdornmentString.visitRankBtnArrow, 0, 0);
    // 設置分數圖示尺寸
    arrowIcon.setDisplaySize(this.arrowImageWidth, this.arrowImageHeight);
    // 加入Layout
    layout.addElements([arrowIcon]);

    // 標題文字
    const contentText = this.addText(Localization.getText(LocalKeyType.Common, 'AdornmentVisitRankButton'), 0, 0, {
      color: UIHelper.whiteString,
      fontSize: '20px',
    });
    contentText.setOrigin(contentText.originX, 0.4);

    layout.addElements([contentText]);

    // 重算容器範圍及背景，排列容器內元件
    layout.draw();
  }
}
