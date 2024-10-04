import Layout from './Layout';
import { Align } from '@/views/H5/Helper/MathHelper';
import { Size } from '../../Helper/PhaserHelper';

type Vector2 = Phaser.Math.Vector2;

/** 水平UI物件排版 */
export default class HorizontalLayout extends Layout {
  /** 取得主軸向的錨點 */
  protected get majorAnchor(): number {
    // 歸納水平對齊方向後，設置置中/置右/置左的起始點
    switch (this.getHorizontalAlign()) {
      case Align.Center:
        return this.width * 0.5;
      case Align.RightCenter:
        return this.width;
      default:
        return 0;
    }
  }
  /** 取得次軸向的錨點 */
  protected get secondaryAnchor(): number {
    // 歸納垂直對齊方向後，設置置中/置下/置上的起始點
    switch (this.getVerticalAlign()) {
      case Align.Center:
        return this.height / 2;
      case Align.BottomCenter:
        return this.height;
      default:
        return 0;
    }
  }

  /** 主次軸向數值 轉為 xy
   * @param majorValue 主軸向數值
   * @param secondaryValue 次軸向數值
   */
  protected axisToXY(majorValue: number, secondaryValue: number): Vector2 {
    return new Phaser.Math.Vector2(majorValue, secondaryValue);
  }

  /** 加總顯示寬度
   * @param elementRangeList 子元件顯示範圍的陣列
   */
  protected calcTotalDisplayWidth(elementRangeList: Size[]): number {
    // 加總主軸向子元件範圍
    return this.calcTotalMajorAxisRange(elementRangeList);
  }

  /** 加總顯示高度
   * @param elementRangeList 子元件顯示範圍的陣列
   */
  protected calcTotalDisplayHeight(elementRangeList: Size[]): number {
    // 加總次軸向子元件範圍
    return this.calcTotalSecondaryAxisRange(elementRangeList);
  }

  /** 取得容器主軸向起始端邊距 */
  protected get majorStartPadding(): number {
    return this.padding.left;
  }
  /** 取得容器主軸向結束端邊距 */
  protected get majorEndPadding(): number {
    return this.padding.right;
  }
  /** 取得容器次軸向起始端邊距 */
  protected get secondaryStartPadding(): number {
    return this.padding.top;
  }
  /** 取得容器次軸向結束端邊距 */
  protected get secondaryEndPadding(): number {
    return this.padding.bottom;
  }

  /** 取得主軸向子元件範圍
   * @param range 範圍
   */
  protected getMajorAxisElementRange(range: Size): number {
    return this.fitElements ? range.width : this.elementWidth;
  }
  /** 取得次軸向子元件範圍
   * @param range 範圍
   */
  protected getSecondaryAxisElementRange(range: Size): number {
    return this.fitElements ? range.height : this.elementHeight;
  }

  /** 取得主軸向子元件固定範圍 */
  protected get majorAxisElementFixRange(): number {
    return this.elementWidth;
  }
  /** 取得次軸向子元件固定範圍 */
  protected get secondaryAxisElementFixRange(): number {
    return this.elementHeight;
  }

  /** 取得次軸向元件位置
   * @param elementRangeList 子元件顯示範圍的陣列
   */
  protected getSecondaryAxisPosition(elementRangeList: Size[]): number {
    // 取得垂直對齊方向後
    switch (this.getVerticalAlign()) {
      // y置中時，物件對準原點
      case Align.Center:
        return 0;
      // 物件下端對齊原點，故將物件上移
      case Align.BottomCenter:
        // -1 * 次軸向子元件最大範圍 的一半
        return -1 * this.getSecondaryAxisElementMaxRange(elementRangeList) * 0.5;
      // 物件上端對齊原點，故將物件下移
      default:
        // 次軸向子元件最大範圍 的一半
        return this.getSecondaryAxisElementMaxRange(elementRangeList) * 0.5;
    }
  }
}
