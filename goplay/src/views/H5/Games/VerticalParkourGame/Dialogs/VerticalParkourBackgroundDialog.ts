import UIDialog from '../../../Scripts/Components/UIDialog';
import { VerticalParkourNumber, VerticalParkourString } from '../Data/VerticalParkourConfig';

export default class VerticalParkourBackgroundDialog extends UIDialog {
  /** 背景 */
  private tileSprite!: Phaser.GameObjects.TileSprite;
  /** 捲動速度 */
  private speed: number;

  /** 設置背景 */
  protected setUI(): void {
    // 載入tileSprite，並調整大小
    this.tileSprite = this.addTileSprite(VerticalParkourString.Grass, this.centerX, this.centerY, 512, 512);
    // 設置捲動速度
    this.speed = VerticalParkourNumber.BackgroundSpeed;
  }

  update(time: number, delta: number): void {
    this.tileSprite.tilePositionY -= this.speed * (delta / 1000);
  }
}
