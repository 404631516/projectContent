import { Scene } from 'phaser';
import { clamp } from '../../Helper/MathHelper';
import { Size } from '../../Helper/PhaserHelper';
import UIHelper from '../../Helper/UIHelper';
import Object2D from './Object2D';

/** 橫條值在各比例的顏色 */
export interface BarRatioColor {
  /** 橫條比例 */
  ratio: number;
  /** 橫條值顏色 */
  color: number;
}

/** 橫條物件
 * 因Slider元件使用Graphics較耗效能，因此創建此Class用以取代Slider元件，同時也將元件名稱重新命名為Bar
 */
export default class Bar extends Object2D {
  /** 橫條背景圖像 */
  private bgImage: Phaser.GameObjects.Image;
  /** 橫條值圖像 */
  private valueImage: Phaser.GameObjects.Image;
  /** 各值範圍內的進度條設定 */
  private rationColorList: BarRatioColor[] = [];

  /** 橫條值 */
  private _value: number = 100;
  public get value(): number {
    return this._value;
  }

  /** 橫條最大值 */
  private _fullValue: number = 100;
  public get fullValue(): number {
    return this._fullValue;
  }

  /** 橫條值是否為最大值 */
  public get isFull(): boolean {
    return this._value === this._fullValue;
  }
  /** 橫條值是否為零 */
  public get isEmpty(): boolean {
    return this._value <= 0;
  }

  /** 創建橫條物件前請先使用Bar.createStyle創建樣式 */
  constructor(scene: Scene, x: number, y: number, bgKey: string, valueKey: string) {
    super(scene, x, y);
    // 初始化橫條框、橫條值圖像
    this.bgImage = this.addImage('', 0, 0);
    this.valueImage = this.addImage('', 0, 0);
    this.valueImage.setOrigin(0, 0.5);

    // 重設橫條樣式
    this.resetStyle(bgKey, valueKey);
  }

  /** 重設橫條樣式
   * @param bgKey 背景圖Key
   * @param valueKey 背景值Key
   * @returns
   */
  private resetStyle(bgKey: string, valueKey: string): void {
    this.bgImage.setTexture(bgKey);
    this.valueImage.setTexture(valueKey);
    this.valueImage.x = -this.valueImage.displayWidth / 2;

    this.updateBarDisplay();
  }

  /** 更新橫條值顯示 */
  private updateBarDisplay(): void {
    if (this._fullValue === 0) {
      return;
    }

    // 計算目前比例
    const ratio = this._value / this._fullValue;
    if (ratio <= 0) {
      return;
    }

    // 更新橫條值縮放
    this.valueImage.setScale(ratio, 1);
    // 更新橫條值顏色配置
    const ratioColor = this.rationColorList.find((value: BarRatioColor) => value.ratio >= ratio);
    this.valueImage.setTint(ratioColor ? ratioColor.color : UIHelper.whiteNumber);
  }

  /** 重置橫條初值 */
  public resetValue(fullValue: number): void {
    this._fullValue = fullValue;
    this._value = this._fullValue;

    this.updateBarDisplay();
  }

  /** 橫條值在各比例的顏色
   * @param ratioColorList  各比例顏色配置
   */
  public resetValueColor(ratioColorList: BarRatioColor[]): void {
    // 找出是否有 ration 大於1 或 負值
    const illegalRatioColor = ratioColorList.find(
      (ratioColor: BarRatioColor) => ratioColor.ratio > 1 || ratioColor.ratio < 0
    );
    if (illegalRatioColor) {
      console.error(`barRationColorList 中還有不合法的ration: ${illegalRatioColor.ratio}。 請限制範圍為 0 ~ 1。`);
      return;
    }

    // 根據比例大小排列
    this.rationColorList = ratioColorList.sort((a, b) => {
      return a.ratio - b.ratio;
    });

    // 更新顏色顯示
    this.updateBarDisplay();
  }

  /** 設定橫條值 */
  public setValue(value: number) {
    this._value = value;

    this.updateBarDisplay();
  }

  /** 更新橫條值
   * @param amount 正數則增加，負數則減去
   */
  public updateValue(amount: number) {
    this._value = clamp(this._value + amount, this._fullValue, 0);
    this.updateBarDisplay();
  }
}
