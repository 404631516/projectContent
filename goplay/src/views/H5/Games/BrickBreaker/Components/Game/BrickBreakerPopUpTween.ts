import { MinMax } from '@/views/H5/Helper/PhaserHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import BasePopUpTween from '@/views/H5/Scripts/Components/UI/BasePopUpTween';

export default class BrickBreakerPopUpTween extends BasePopUpTween {
  /** 持續秒數 */
  protected readonly duration: number = 1000;
  /** 上浮距離 */
  protected readonly distanceY: number = 60;
  /** 上浮過程中橫移距離 */
  protected readonly distanceX: MinMax = { min: 0, max: 0 };
  /** 起始位置偏移 */
  protected readonly offsetX: MinMax = { min: 0, max: 0 };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      fontSize: '24px',
      color: UIHelper.whiteString,
      stroke: UIHelper.blackString,
      strokeThickness: 3,
    });
  }
}
