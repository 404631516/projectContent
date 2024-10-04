import { clamp } from '../../Helper/MathHelper';
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
export default abstract class BaseBar extends Object2D {
  /** 各值範圍內的進度條設定 */
  protected rationColorList: BarRatioColor[] = [];

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

  /** 重設橫條樣式 */
  protected abstract resetStyle(bgKey: string, valueKey: string): void;

  /** 更新橫條值顯示 */
  protected abstract updateBarDisplay(): void;

  /** 橫條值在各比例的顏色 */
  public abstract resetValueColor(ratioColorList: BarRatioColor[]): void;

  /** 重置橫條初值 */
  public resetValue(fullValue: number): void {
    this._fullValue = fullValue;
    this._value = this._fullValue;

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
