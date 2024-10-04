import UIDialog from '../../../Scripts/Components/UIDialog';
import { SpaceInvadersString } from '../Data/SpaceInvadersConfig';

export default class SpaceInvadersBackgroundDialog extends UIDialog {
  /** 背景 */
  private tileSprite!: Phaser.GameObjects.TileSprite;
  /** 捲動速度 */
  private speed: number = 300;

  /** 設置背景 */
  protected setUI(): void {
    // 載入tileSprite，並調整大小
    this.tileSprite = this.addTileSprite(
      SpaceInvadersString.Background,
      this.centerX,
      this.centerY,
      this.width,
      this.height,
    );

    this.addSprite(SpaceInvadersString.BackgroundPlanet, this.centerX, this.centerY);
  }

  update(time: number, delta: number): void {
    this.tileSprite.tilePositionY -= this.speed * (delta / 1000);
  }
}
