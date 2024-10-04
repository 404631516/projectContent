import { Scene } from 'phaser';
import BaseBar, { BarRatioColor } from './BaseBar';

/** 一顆顆的愛心血條, 由半顆半顆愛心組成 */
export default class HeartBar extends BaseBar {
  /** 橫條值圖像 */
  private valueImageList: Phaser.GameObjects.Image[] = [];
  /** UI最大愛心數 */
  private readonly maxHeartCount: number = 5;

  /** 起始x座標 */
  private readonly startPositionX: number = -50;
  /** 起始y座標 */
  private readonly startPositionY: number = 0;
  /** 每一單位寬度 */
  private readonly unitWidth: number = 10;
  /** 每一單位高度 */
  private readonly unitHeight: number = 20;

  /**
   * 創建橫條物件前請先使用Bar.createStyle創建樣式(bgKey心型血條用不到)
   * @param scene
   * @param x
   * @param y
   * @param bgKey 血條背景圖
   * @param valueKey 愛心血量圖
   * @param halfHeartValue 半顆愛心對應的血量, 假設總血量為100, 想顯示5顆愛心, 則halfHeartValue為10
   */
  constructor(scene: Scene, x: number, y: number, bgKey: string, valueKey: string, private halfHeartValue: number) {
    super(scene, x, y);

    // 以半顆心為單位生成總共5顆心
    for (let i = 0; i < this.maxHeartCount * 2; i++) {
      const valueImage = this.addImage('', this.startPositionX + i * this.unitWidth, this.startPositionY);
      if (i % 2 === 1) {
        valueImage.setFlipX(true);
      }
      this.valueImageList.push(valueImage);
    }
    // 重設橫條樣式
    this.resetStyle(bgKey, valueKey);
  }

  /** 重設橫條樣式(bgKey心型血條用不到)
   * @param bgKey 背景圖Key
   * @param valueKey 背景值Key
   * @returns
   */
  protected resetStyle(bgKey: string, valueKey: string): void {
    this.valueImageList.forEach((valueImage: Phaser.GameObjects.Image) => {
      valueImage.setTexture(valueKey);
      // TODO: 放base setSize
      valueImage.setDisplaySize(10, 20);
    });
    this.updateBarDisplay();
  }

  /** 更新橫條值顯示 */
  protected updateBarDisplay(): void {
    if (this.value > 0) {
      if (this.value % this.halfHeartValue !== 0) {
        console.error('血量不是半顆愛心的倍數', this.value, this.halfHeartValue);
      }
    }

    // 計算顯示的"半顆愛心"數量
    const halfHeartCount = Math.floor(this.value / this.halfHeartValue);
    // 計算顯示愛心的總寬度
    const totalWidth = (halfHeartCount + (halfHeartCount % 2) - 1) * this.unitWidth;
    // 計算起始位置以置中
    const startPosition = -totalWidth / 2;

    // 根據血量顯示愛心, 並調整位置
    for (let i = 0; i < this.valueImageList.length; i++) {
      if (i < halfHeartCount) {
        this.valueImageList[i].setVisible(true);
        this.valueImageList[i].setPosition(startPosition + i * this.unitWidth, this.valueImageList[i].y);
      } else {
        this.valueImageList[i].setVisible(false);
      }
    }
  }

  /** 橫條值在各比例的顏色(心型血條用不到)
   * @param ratioColorList  各比例顏色配置
   */
  public resetValueColor(ratioColorList: BarRatioColor[]): void {
    return;
  }
}
