import { Scene } from 'phaser';
import { Align } from '../../Helper/MathHelper';
import HorizontalLayout from './HorizontalLayout';
import Object2D from './Object2D';

/** 使用"數個小圖案(愛心)"做表示的血條 */
export default class ElementSlider extends Object2D {
  /** 當前值 */
  private currentValue: number = 0;

  /** 每格的圖案(愛心) */
  private elementIconKey: string;

  /** 自動調整element間距、位置的component */
  private layout: HorizontalLayout;

  /** 整條外框的尺寸 */
  private elementSize: Phaser.Math.Vector2 = new Phaser.Math.Vector2(30, 30);

  /** 是否值為零 */
  public get isEmpty(): boolean {
    return this.currentValue <= 0;
  }

  /** 取得目前的值 */
  public get value(): number {
    return this.currentValue;
  }

  /** constructor
   * @param scene Object2D constructor需要的input
   * @param elementIconKey 每格數值要顯示的圖案
   * @param value 要顯示的icon數量
   * @param align 圖案在layout中的對齊方式
   */
  constructor(
    scene: Scene,
    x: number,
    y: number,
    elementIconKey: string,
    value: number,
    align: Align = Align.BottomCenter
  ) {
    super(scene, x, y);
    // 存圖片key
    this.elementIconKey = elementIconKey;
    // 設定當前值
    this.currentValue = value;
    // 設定HorizontalLayout
    this.layout = new HorizontalLayout(this);
    this.layout.setSpacing(1);
    this.layout.setAlign(align);
    this.layout.setElementSize(this.elementSize.x, this.elementSize.y);
    // 重算容器範圍及背景，排列容器內元件
    this.layout.draw();

    // 更新顯示
    this.draw();
  }

  /** 設置顯示的element尺寸 */
  public setElementSize(width: number, height: number) {
    this.elementSize.x = width;
    this.elementSize.y = height;
    // 設定layout間距
    this.layout.setElementSize(this.elementSize.x, this.elementSize.y);
    // 重算容器範圍及背景，排列容器內元件
    this.layout.draw();

    this.draw();
  }

  /** 設定值(icon顯示數量) */
  public setValue(value: number) {
    this.currentValue = value;
    this.draw();
  }

  /** 增加或減少值
   * @param amount 正數則增加，負數則減去
   */
  public addValue(amount: number) {
    this.currentValue += amount;
    // 防呆
    if (this.currentValue < 0) {
      this.currentValue = 0;
    }
    this.draw();
  }

  /** 更新血條顯示 */
  public draw() {
    // 清除舊的layout element
    this.layout.removeAllElements(true);
    // 生成icons, 加進layout
    for (let i = 0; i < this.currentValue; ++i) {
      const icon = this.addImage(this.elementIconKey, 0, 0);
      icon.setDisplaySize(this.elementSize.x, this.elementSize.y);
      this.layout.addElement(icon);
    }
    // layout刷新
    this.layout.draw();
  }
}
