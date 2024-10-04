import UIHelper from '@/views/H5/Helper/UIHelper';
import RemainHintLayout from '@/views/H5/Scripts/Components/UI/RemainHintLayout';

/** 避免配對失敗處罰-剩餘數量顯示元件 */
export class AvoidNotMatchPenaltyLayout extends RemainHintLayout {
  /** 元件x軸間隔 */
  protected readonly textSpacingX: number = 3;

  /** 標題文字顏色 */
  protected readonly titleTextColor: string = UIHelper.whiteString;
  /** 標題文字大小 */
  protected readonly titleTextFontSize: number = 20;

  /** 剩餘文字顏色 */
  protected readonly remainTextColor: string = UIHelper.whiteString;
  /** 單位文字顏色 */
  protected readonly unitTextColor: string = UIHelper.whiteString;
  /** 剩餘/單位文字大小 */
  protected readonly remainUnitTextFontSize: number = 12;
  /** 剩餘/單位文字y軸錨點 */
  protected readonly remainUnitOriginY: number = 0.375;

  /** 數量文字顏色 */
  protected readonly amountTextColor: string = UIHelper.yellowString;
  /** 數量文字大小 */
  protected readonly amountTextFontSize: number = 22;
}

/** 翻牌加速-剩餘數量顯示元件 */
export class FlipSpeedUpLayout extends RemainHintLayout {
  /** 元件x軸間隔 */
  protected readonly textSpacingX: number = 3;

  /** 標題文字顏色 */
  protected readonly titleTextColor: string = UIHelper.whiteString;
  /** 標題文字大小 */
  protected readonly titleTextFontSize: number = 20;

  /** 剩餘文字顏色 */
  protected readonly remainTextColor: string = UIHelper.whiteString;
  /** 單位文字顏色 */
  protected readonly unitTextColor: string = UIHelper.whiteString;
  /** 剩餘/單位文字大小 */
  protected readonly remainUnitTextFontSize: number = 12;
  /** 剩餘/單位文字y軸錨點 */
  protected readonly remainUnitOriginY: number = 0.4375;

  /** 數量文字顏色 */
  protected readonly amountTextColor: string = UIHelper.yellowString;
  /** 數量文字大小 */
  protected readonly amountTextFontSize: number = 20;
}
