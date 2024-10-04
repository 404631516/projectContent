import { Align, Padding } from '../../Helper/MathHelper';
import { Size } from '../../Helper/PhaserHelper';
import UIHelper from '../../Helper/UIHelper';
import { Vector2 } from './LoopScroll/BaseLoopScroll';

/** 子元件類型 */
interface ElementType
  extends Phaser.GameObjects.GameObject,
    Phaser.GameObjects.Components.ComputedSize,
    Phaser.GameObjects.Components.Transform {}

/** UI物件排版 */
export default abstract class Layout {
  //#region data
  /** 容器 */
  private _container: Phaser.GameObjects.Container;
  public get container(): Phaser.GameObjects.Container {
    return this._container;
  }

  /** 需要排列的物件陣列 */
  protected elementList: ElementType[] = [];
  /** 繪製背景用的物件 */
  protected graphics: Phaser.GameObjects.Graphics;

  /** 排列子元件時的對齊方式 */
  protected align: Align = Align.Center;

  //#region 容器相關屬性
  /** 容器內元件間的間距 */
  protected spacing: number = 0;

  /** 容器-子元件與容器四周的邊距
   * TODO 是否要只設x,y
   */
  protected padding: Padding = { top: 0, left: 0, bottom: 0, right: 0 };

  /** 容器背景-是否需要容器背景 */
  private isFill: boolean = false;
  /** 容器背景-繪製背景顏色 */
  private color: number = UIHelper.blackNumber;
  /** 容器背景-繪製背景透明度 */
  private alpha: number = 1;
  /** 容器背景-繪製背景圓角半徑 */
  private radius: number = 1;
  //#endregion 容器相關屬性

  //#region 元件相關屬性
  /** 元件屬性-寬度 */
  protected elementWidth: number = 0;
  /** 元件屬性-高度 */
  protected elementHeight: number = 0;

  /** 元件屬性-是否繪製背景 */
  public isFillElement: boolean = false;
  /** 元件屬性-繪製背景顏色 */
  protected elementColor: number = UIHelper.whiteNumber;
  /** 元件屬性-繪製背景透明度 */
  protected elementAlpha: number = 1;

  /** 元件屬性-是否繪製外框 */
  public isElementStroke: boolean = false;
  /** 元件屬性-繪製外框顏色 */
  protected elementStrokeColor: number = UIHelper.whiteNumber;
  /** 元件屬性-繪製外框透明度 */
  protected elementStrokeAlpha: number = 1;
  /** 元件屬性-繪製外框粗細 */
  protected elementThin: number = 1;

  /** 元件屬性-容器範圍以子元件範圍為準 */
  public fitElements: boolean = false;
  //#endregion 元件相關屬性

  /** 容器寬度 */
  public get width(): number {
    return this.container.width;
  }
  /** 容器高度 */
  public get height(): number {
    return this.container.height;
  }
  //#endregion data

  // 主要流程function
  /** 建構子
   * @param parent 當作父層容器的物件
   */
  constructor(parent: Phaser.GameObjects.Container) {
    // 容器
    this._container = parent;

    // 繪製背景用的物件
    this.graphics = parent.scene.add.graphics();
    parent.add(this.graphics);
  }

  /** 重算容器範圍及背景，排列容器內元件 */
  public draw(): void {
    // 防呆
    if (this.elementList.length <= 0) {
      return;
    }

    // TODO 改為displayWidth
    // 記錄子元件顯示範圍的陣列
    const elementRangeList: Size[] = this.elementList.map(
      (element): Size => ({
        width: element.displayWidth,
        height: element.displayHeight,
      })
    );

    // 清除已繪製的背景
    this.graphics.clear();

    // 計算容器高度及寬度，並設定容器大小
    this._container.setSize(
      this.calcTotalDisplayWidth(elementRangeList),
      this.calcTotalDisplayHeight(elementRangeList)
    );

    // 取得主次軸向的錨點
    const majorAnchor = this.majorAnchor;
    const secondaryAnchor = this.secondaryAnchor;

    // 將軸向錨點轉為座標錨點
    const xyAnchor = this.axisToXY(majorAnchor, secondaryAnchor);

    // 是否需要容器背景
    if (this.isFill) {
      // 繪製背景
      this.graphics.fillStyle(this.color, this.alpha);
      this.graphics.fillRoundedRect(-1 * xyAnchor.x, -1 * xyAnchor.y, this.width, this.height, this.radius);
    }

    // 重算所有子元件位置及背景
    this.drawElements(majorAnchor, secondaryAnchor, elementRangeList);
  }

  /** 重算所有子元件位置及背景
   * @param majorAnchor 主軸向起始位置
   * @param secondaryAnchor 次軸向起始位置
   * @param elementRangeList 子元件顯示範圍的陣列
   */
  private drawElements(majorAnchor: number, secondaryAnchor: number, elementRangeList: Size[]): void {
    // 元件擺放位置 = 主軸向起始端邊距 - 主軸向起點
    let drawMajorAxisPosition: number = this.majorStartPadding - majorAnchor;
    // 元件擺放位置 = 次軸向起始端邊距 - 次軸向起點
    const drawSecondaryAxisPosition: number = this.secondaryStartPadding - secondaryAnchor;

    // 容器次軸向範圍 = 次軸向子元件最大範圍
    const secondaryAxisRange = this.getSecondaryAxisElementMaxRange(elementRangeList);

    // 排列元件 及 繪出元件背景
    for (let i = 0; i < this.elementList.length; ++i) {
      // 第一個元件不用算距離
      if (i > 0) {
        // 計算元件位置 += 主軸向前一個子元件範圍 + 元件的間距
        drawMajorAxisPosition += this.getMajorAxisElementRange(elementRangeList[i - 1]) + this.spacing;
      }

      // 取得主軸向子元件範圍
      const majorAxisRange = this.getMajorAxisElementRange(elementRangeList[i]);

      // 將軸向轉為座標
      const bgPosition = this.axisToXY(drawMajorAxisPosition, drawSecondaryAxisPosition);
      const elementRange = this.axisToXY(majorAxisRange, secondaryAxisRange);

      // 要加入元件背景時，繪製背景
      if (this.isFillElement) {
        this.graphics.fillStyle(this.elementColor, this.elementAlpha);
        this.graphics.fillRect(bgPosition.x, bgPosition.y, elementRange.x, elementRange.y);
      }

      // 需要元件外框時，繪製外框
      if (this.isElementStroke) {
        this.graphics.lineStyle(this.elementThin, this.elementStrokeColor, this.elementStrokeAlpha);
        this.graphics.strokeRect(bgPosition.x, bgPosition.y, elementRange.x, elementRange.y);
      }

      // 將軸向轉為座標
      const elementPosition = this.axisToXY(
        drawMajorAxisPosition + majorAxisRange / 2,
        this.getSecondaryAxisPosition(elementRangeList)
      );
      // 設定元件位置
      this.elementList[i].setPosition(elementPosition.x, elementPosition.y);
    }
  }

  // add/remove function
  /** 加入元件
   * @param element 子元件(或陣列)
   */
  public addElements(element: ElementType | ElementType[]): void {
    // 加入陣列
    if (Array.isArray(element)) {
      element.forEach((obj) => {
        this.addElement(obj);
      });
    }
    // 加入單一子元件
    else {
      this.addElement(element);
    }
  }

  /** 加入元件到容器後方
   * @param element 子元件
   */
  public addElement(element: ElementType): void {
    this.elementList.push(element);
    this._container.add(element);
  }

  /** 加入元件到容器前方，但要在背景的後面
   * @param element 子元件
   */
  public addElementAtFront(element: ElementType): void {
    this.elementList.unshift(element);
    // 把元件加到前方，但要在背景圖的後面
    this._container.addAt(element, 1);
  }

  /** 清除容器中的子元件
   * @param destroyChild 立即刪除
   */
  public removeAllElements(destroyChild: boolean): void {
    this.elementList = [];
    this._container.removeAll(destroyChild);
  }

  // 參數 function
  /** 設置元件間的間格
   * @param spacing 間格
   */
  public setSpacing(spacing: number): void {
    this.spacing = spacing;
  }

  /** 設置 子元件與容器四周的邊距
   * @param top 上方
   * @param left 左方
   * @param bottom 下方
   * @param right 右方
   */
  public setPadding(top: number, left: number, bottom?: number, right?: number): void {
    this.padding = {
      top,
      left,
      // 省略下邊距時，沿用上邊距
      bottom: bottom ? bottom : top,
      // 省略右邊距時，沿用左邊距
      right: right ? right : left,
    };
  }

  /** 設置排列子元件時的對齊方式
   * @param align 對齊方式
   */
  public setAlign(align: Align): void {
    this.align = align;
  }

  /** 設置繪製容器背景參數
   * @param color 背景顏色
   * @param radius 背景圓角半徑
   * @param alpha 背景透明度
   */
  public setFill(color: number, radius: number, alpha: number): void {
    this.isFill = true;
    this.color = color;
    this.radius = radius;
    this.alpha = alpha;
  }

  /** 設置元件尺寸
   * @param width 寬
   * @param height 高
   */
  public setElementSize(width: number, height: number): void {
    this.elementWidth = width;
    this.elementHeight = height;
  }

  /** 設置元件繪製背景
   * @param color 顏色
   * @param alpha 半透明
   */
  public setFillElement(color: number, alpha: number): void {
    this.isFillElement = true;
    this.elementColor = color;
    this.elementAlpha = alpha;
  }

  /** 設置元件容器外框
   * @param color 顏色
   * @param alpha 半透明
   * @param thin 外框粗細
   */
  public setElementStroke(color: number, alpha: number, thin: number): void {
    this.elementStrokeColor = color;
    this.elementStrokeAlpha = alpha;
    this.elementThin = thin;
    this.isElementStroke = true;
  }

  // 主軸/次軸function
  /** 加總主軸向子元件範圍
   * @param elementRangeList 子元件顯示範圍的陣列
   */
  protected calcTotalMajorAxisRange(elementRangeList: Size[]): number {
    // 防呆
    if (this.elementList.length <= 0) {
      return 0;
    }

    // 元件範圍，加上元件間間隔
    let contentLength: number = 0;
    // 若是以元件範圍為準，則累加實際顯示範圍
    if (this.fitElements) {
      // 找所有子元件
      this.elementList.forEach((element, i) => {
        // 累加 主軸向子元件範圍 及 元件間距
        contentLength += this.getMajorAxisElementRange(elementRangeList[i]) + this.spacing;
      });
    }
    // 否則 = 元件數 * (元件固定範圍 + 元件間距)
    else {
      contentLength = this.elementList.length * (this.majorAxisElementFixRange + this.spacing);
    }

    // 計算結果 - 一個間隔 + 容器四周的間距
    return contentLength - this.spacing + this.majorStartPadding + this.majorEndPadding;
  }

  /** 加總次軸向子元件範圍
   * @param elementRangeList 子元件顯示範圍的陣列
   */
  protected calcTotalSecondaryAxisRange(elementRangeList: Size[]): number {
    // 次軸向子元件最大範圍 + 容器次軸向總邊距
    return (
      this.getSecondaryAxisElementMaxRange(elementRangeList) + this.secondaryStartPadding + this.secondaryEndPadding
    );
  }

  /** 取得次軸向子元件最大範圍
   * @param elementRangeList 子元件顯示範圍的陣列
   */
  protected getSecondaryAxisElementMaxRange(elementRangeList: Size[]): number {
    let maxRange = 0;

    // 若以元件範圍為準
    if (this.fitElements) {
      // 找所有子元件
      this.elementList.forEach((element, i) => {
        // 取得次軸向子元件範圍, 記錄最大的值
        maxRange = Math.max(maxRange, this.getSecondaryAxisElementRange(elementRangeList[i]));
      });
    }
    // 否則使用固定範圍
    else {
      // 次軸向子元件固定範圍
      maxRange = this.secondaryAxisElementFixRange;
    }

    return maxRange;
  }

  /** 取得垂直的對齊方向 */
  protected getVerticalAlign(): Align {
    switch (this.align) {
      // 垂直置中
      case Align.Center:
      case Align.LeftCenter:
      case Align.RightCenter:
        return Align.Center;
      // 置下
      case Align.BottomCenter:
      case Align.BottomLeft:
      case Align.BottomRight:
        return Align.BottomCenter;
      // 置上
      default:
        return Align.TopCenter;
    }
  }
  /** 取得水平的對齊方向 */
  protected getHorizontalAlign(): Align {
    switch (this.align) {
      // 水平置中
      case Align.Center:
      case Align.TopCenter:
      case Align.BottomCenter:
        return Align.Center;
      // 置右
      case Align.TopRight:
      case Align.RightCenter:
      case Align.BottomRight:
        return Align.RightCenter;
      // 置左
      default:
        return Align.LeftCenter;
    }
  }

  /** 取得主軸向的錨點 */
  protected abstract get majorAnchor(): number;
  /** 取得次軸向的錨點 */
  protected abstract get secondaryAnchor(): number;

  /** 主次軸向數值 轉為 xy
   * @param majorValue 主軸向數值
   * @param secondaryValue 次軸向數值
   */
  protected abstract axisToXY(majorValue: number, secondaryValue: number): Vector2;

  /** 加總顯示寬度
   * @param elementRangeList 子元件顯示範圍的陣列
   */
  protected abstract calcTotalDisplayWidth(elementRangeList: Size[]): number;
  /** 加總顯示高度
   * @param elementRangeList 子元件顯示範圍的陣列
   */
  protected abstract calcTotalDisplayHeight(elementRangeList: Size[]): number;

  /** 取得容器主軸向起始端邊距 */
  protected abstract get majorStartPadding(): number;
  /** 取得容器主軸向結束端邊距 */
  protected abstract get majorEndPadding(): number;
  /** 取得容器次軸向起始端邊距 */
  protected abstract get secondaryStartPadding(): number;
  /** 取得容器次軸向結束端邊距 */
  protected abstract get secondaryEndPadding(): number;

  /** 取得主軸向子元件範圍
   * @param range 範圍
   */
  protected abstract getMajorAxisElementRange(range: Size): number;
  /** 取得次軸向子元件範圍
   * @param range 範圍
   */
  protected abstract getSecondaryAxisElementRange(range: Size): number;

  /** 取得主軸向子元件固定範圍 */
  protected abstract get majorAxisElementFixRange(): number;
  /** 取得次軸向子元件固定範圍 */
  protected abstract get secondaryAxisElementFixRange(): number;

  /** 取得次軸向元件位置
   * @param elementRangeList 子元件顯示範圍的陣列
   */
  protected abstract getSecondaryAxisPosition(elementRangeList: Size[]): number;
}
