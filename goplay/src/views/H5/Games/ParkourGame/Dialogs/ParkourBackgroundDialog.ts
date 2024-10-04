import { ParkourString } from '../Data/ParkourConfig';
import UIDialog from '../../../Scripts/Components/UIDialog';

interface Background {
  /** 圖片Key */
  key: string;
  /** Padding top or bottom */
  isPaddingTop: boolean;
  /** 捲動速度 */
  duration: number;
}

export default class ParkourBackgroundDialog extends UIDialog {
  private readonly backgroundConfigs: Background[] = [
    { key: ParkourString.Background0, isPaddingTop: true, duration: 0 },
    { key: ParkourString.Background1, isPaddingTop: true, duration: 20000 },
    { key: ParkourString.Background2, isPaddingTop: false, duration: 10000 },
  ];

  private backgroundTweens: Phaser.Tweens.Tween[] = [];

  /** 設置背景 */
  protected setUI(): void {
    this.backgroundConfigs.forEach((element) => {
      // 載入tileSprite，並調整大小
      const tileSprite = this.addTileSprite(element.key, this.centerX, this.centerY, 0, 0);
      tileSprite.setScale(this.width / tileSprite.width);
      // 調整Padding
      tileSprite.setY(
        element.isPaddingTop ? tileSprite.displayHeight * 0.5 : this.height - tileSprite.displayHeight * 0.5 + 2
      );

      // duration為0不添加動畫
      if (element.duration === 0) {
        return;
      }
      // 各背景滾動速度不同，增加畫面表現
      const tween = this.scene.tweens.add({
        targets: tileSprite,
        // 使用tilesprite的紋理移動來達到背景無限滾動的效果
        tilePositionX: { from: 0, to: tileSprite.width },
        ease: 'Linear',
        duration: element.duration,
        repeat: -1,
      });

      this.backgroundTweens.push(tween);
    });
  }
}
