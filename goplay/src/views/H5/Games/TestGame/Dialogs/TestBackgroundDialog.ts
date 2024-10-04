import UIDialog from '../../../Scripts/Components/UIDialog';
import { TestNumber, TestString } from '../Data/TestConfig';

export default class TestBackgroundDialog extends UIDialog {
  protected setUI() {
    this.changeBackground(TestString.Background);
    this.setWave();
  }

  // 浪花
  private setWave(): void {
    // 創建浪花
    const wave = this.addTileSprite(TestString.Wave, this.centerX, TestNumber.SeaLevel, 0, 0);
    wave.setOrigin(0.5, 1);
    // 需先用TileSprite預設寬高載入後，再進行寬高的調整
    wave.width = this.width;
    wave.height = wave.height / 2;

    // 浪花滾動效果
    this.scene.tweens.add({
      targets: wave,
      tilePositionX: { from: 0, to: this.width },
      ease: 'Linear',
      duration: 75000,
      repeat: -1,
    });
  }
}
