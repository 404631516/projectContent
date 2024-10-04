import { ParkourString } from '../Data/ParkourConfig';
import UIDialog from '../../../Scripts/Components/UIDialog';

interface Foreground {
  key: string;
  duration: number;
}

export default class ParkourForegroundDialog extends UIDialog {
  /** 前景(寬度100%) */
  private readonly foregroundConfigs: Foreground[] = [{ key: ParkourString.Foreground0, duration: 20000 }];
  /** 前景物件(高度100%) */
  private readonly foregroundObjectConfigs: Foreground[] = [{ key: ParkourString.Foreground1, duration: 3000 }];

  private foregroundTweens: Phaser.Tweens.Tween[] = [];

  /** 設置前景 */
  protected setUI(): void {
    // 設置前景
    this.foregroundConfigs.forEach((element) => {
      // 載入tileSprite，並調整大小
      const tileSprite = this.addTileSprite(element.key, this.centerX, this.centerY, 0, 0);
      tileSprite.setScale(this.width / tileSprite.width);
      tileSprite.setY(this.height - tileSprite.displayHeight * 0.5 + 2);

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
      // 紀錄前景Tween
      this.foregroundTweens.push(tween);
    });

    // 設置前景物件
    this.foregroundObjectConfigs.forEach((element) => {
      // 載入sprite，並調整大小
      const sprite = this.addSprite(element.key, this.centerX, this.centerY);
      sprite.setScale(this.height / sprite.height);

      // 各背景滾動速度不同，增加畫面表現
      const tween = this.scene.tweens.add({
        targets: sprite,
        // 使用tilesprite的紋理移動來達到背景無限滾動的效果
        x: { from: this.width + sprite.width, to: -(this.width + sprite.width) },
        ease: 'Linear',
        duration: element.duration,
        repeat: -1,
      });
      // 紀錄物件Tween
      this.foregroundTweens.push(tween);
    });
  }
}
