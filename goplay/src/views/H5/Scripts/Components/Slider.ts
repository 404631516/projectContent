import { Scene } from 'phaser';
import Object2D from './Object2D';

export interface ValueColor {
  value: number;
  color: number;
}

/** 滑標物件 */
export default class Slider extends Object2D {
  // 設定基礎值
  public fullValue: Readonly<number> = 0;

  /** 是否值為零 */
  public get isEmpty(): boolean {
    return this.barValue <= 0;
  }

  /** 是否為最大值 */
  public get isFull(): boolean {
    return this.barValue === this.fullValue;
  }

  /** 取得目前的值 */
  public get value(): number {
    return this.barValue;
  }

  // 外觀相關
  private size: Phaser.Math.Vector2 = new Phaser.Math.Vector2(100, 15); // 滑標尺寸
  private padding: number = 2; // 滑標與進度條間格

  // 預設外觀
  private graphics: Phaser.GameObjects.Graphics; // 滑標圖形
  private stroke: number = 2; // 滑標粗細
  private radius: number = 4; // 滑標圓角
  private frameColor: number = 0xffffff; // 外框顏色
  private frameAlpha: number = 0.8; // 外框透明度
  private backColor: number = 0x222222; // 內框顏色
  private backAlpha: number = 0.0; // 內框透明度
  private valueDefaultColor: number = 0x00ff00; // 進度條預設顏色
  private valueAlpha: number = 0.8; // 進度條透明度

  // 顯示目前數值
  private barValue: number = 0;

  // 各值範圍內的進度條設定
  private valueColors: ValueColor[] = [
    { value: 0.3, color: 0xd35137 },
    { value: 0.5, color: 0xffff00 },
    { value: 1, color: 0x00ff00 },
  ];

  /**
   * @param fullvalue 基本值
   * @param value     設定值
   * @param frame     外框圖片key(沒有則用色塊代替)
   * @param slider    進度條圖片key(沒有則用色塊代替)
   */
  constructor(scene: Scene, x: number, y: number, fullvalue: number, value?: number) {
    super(scene, x, y);

    this.graphics = this.addGraphics(0, 0);
    this.fullValue = fullvalue; // 基本值
    this.barValue = value ? value : fullvalue; // 目前值
    this.draw();
  }

  /** 設定血量初值 */
  public setValue(value: number, fullValue?: number) {
    this.barValue = value;
    if (fullValue) {
      this.fullValue = fullValue;
    }

    this.draw();
  }

  /** 重置血量 */
  public resetHP() {
    this.barValue = this.fullValue;
    this.draw();
  }

  /** 設置顯示的外框尺寸 */
  public setBarSize(width: number, height: number, stroke?: number, padding?: number, radius?: number) {
    this.size.x = width;
    this.size.y = height;
    this.stroke = stroke ? stroke : this.stroke;
    this.padding = padding ? padding : this.padding;
    this.radius = radius ? radius : this.radius;
    this.draw();
  }

  /** 設置各值的進度條變化
   * @param ratio 進度條比例(0 ~ 1之間)
   * @param color 顏色
   */
  public addValueColor(ratio: number, color: number) {
    // 值不超過0~1
    ratio = Math.min(1, Math.max(0, ratio));

    // 若有相同的值則直接更換顏色
    const index = this.valueColors.findIndex((e) => e.value === ratio);

    // 否則新增並依照value排序
    if (index < 0) {
      this.valueColors.push({ value: ratio, color });
      this.valueColors.sort((a, b) => {
        return a.value - b.value;
      });
    } else {
      this.valueColors[index].color = color;
    }
  }

  /** 重置各值的進度條變化
   */
  public setValueColor(valueColors: ValueColor[] | ValueColor) {
    let valueColorArry: ValueColor[] = [];
    valueColorArry = valueColorArry.concat(valueColors);

    // 根據顏色的值排列
    valueColorArry.sort((a, b) => {
      return a.value - b.value;
    });

    // 清空值
    this.valueColors = [];
    valueColorArry.forEach((valueColor: ValueColor) => {
      // 比例不超過1也不小於0則加入
      if (valueColor.value <= 1 && valueColor.value >= 0) {
        this.valueColors.push(valueColor);
      }
    });
  }

  /** 設置外框及內框顏色 */
  public setColor(frameColor: number, backColor: number = 0xffffff, frameAlpha: number = 1, backAlpha: number = 0) {
    this.frameColor = frameColor;
    this.frameAlpha = frameAlpha;
    this.backColor = backColor;
    this.backAlpha = backAlpha;
  }

  /** 增加或減少值
   * @param amount 正數則增加，負數則減去
   */
  public addValue(amount: number) {
    this.barValue += amount;

    // 確定值不超過基本值以及不低於0
    if (amount >= 0) {
      this.barValue = Math.min(this.fullValue, this.barValue);
    } else {
      this.barValue = Math.max(0, this.barValue);
    }

    this.draw();
  }

  /** 更新血條顯示 */
  public draw() {
    this.graphics.clear();

    // 置中的offset
    const offset = { x: -this.size.x / 2, y: -this.size.y / 2 };

    // 設定外框及內框
    this.graphics.fillStyle(this.backColor, this.backAlpha);
    this.graphics.fillRoundedRect(offset.x, offset.y, this.size.x, this.size.y, this.radius);
    this.graphics.lineStyle(this.stroke, this.frameColor, this.frameAlpha);
    this.graphics.strokeRoundedRect(offset.x, offset.y, this.size.x, this.size.y, this.radius);

    // 進度條比例
    if (this.fullValue === 0) {
      return;
    }
    const ratio = this.barValue / this.fullValue;
    if (ratio > 0) {
      // 根據目前血量與基本血量的比例更換血條顏色
      this.graphics.fillStyle(this.getColor(ratio), this.valueAlpha);
      const width = (this.size.x - this.padding * 2) * ratio;
      const radius = Math.min(this.radius - this.padding, width);
      this.graphics.fillRoundedRect(
        offset.x + this.padding,
        offset.y + this.padding,
        width,
        this.size.y - this.padding * 2,
        radius
      );
    }
  }

  /** 取得該值對應的顏色  */
  private getColor(ratio: number) {
    if (this.valueColors.length === 0) {
      return this.valueDefaultColor;
    }

    const index = this.valueColors.findIndex((e) => e.value >= ratio);
    if (index < 0) {
      return this.valueDefaultColor;
    }

    return this.valueColors[index].color;
  }
}
