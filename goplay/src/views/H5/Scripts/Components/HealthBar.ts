import { Scene } from 'phaser';
import UIHelper from '../../Helper/UIHelper';
import BaseBar, { BarRatioColor } from './BaseBar';

export default class HealthBar extends BaseBar {
  /** 橫條背景圖像 */
  protected bgImage: Phaser.GameObjects.Image;
  /** 橫條值圖像 */
  protected valueImage: Phaser.GameObjects.Image;

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
  protected resetStyle(bgKey: string, valueKey: string): void {
    this.bgImage.setTexture(bgKey);
    this.valueImage.setTexture(valueKey);
    this.valueImage.x = -this.valueImage.displayWidth / 2;

    this.updateBarDisplay();
  }

  /** 更新橫條值顯示 */
  protected updateBarDisplay(): void {
    if (this.fullValue === 0) {
      return;
    }

    // 計算目前比例
    const ratio = this.value / this.fullValue;
    if (ratio <= 0) {
      return;
    }

    // 更新橫條值縮放
    this.valueImage.setScale(ratio, 1);
    // 更新橫條值顏色配置
    const ratioColor = this.rationColorList.find((value: BarRatioColor) => value.ratio >= ratio);
    this.valueImage.setTint(ratioColor ? ratioColor.color : UIHelper.whiteNumber);
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
}
