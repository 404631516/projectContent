import { Scene } from 'phaser';
import { PiggyItemData } from '@/manager/TableManager';
import { Size } from '../../../Helper/PhaserHelper';
import StoreItem from '../../UIHelper/StoreItem';
import { PiggyString } from '../Data/PiggyConfig';
import UIHelper from '@/views/H5/Helper/UIHelper';

export default class PiggyItem extends StoreItem<PiggyItemData> {
  /** 旋轉tween時間 */
  private readonly rotateTweenDuration: number = 3000;
  /** 遮罩透明度 */
  private readonly itemMaskAlpha: number = 0.5;

  /** 道具遮罩 */
  private itemMask: Phaser.GameObjects.Graphics;
  /** 子彈圖示 */
  private bulletIcon: Phaser.GameObjects.Image;
  /** 使用中圖示 */
  private useIcon: Phaser.GameObjects.Image;
  /** 使用中旋轉動畫 */
  private useIconRotateTween?: Phaser.Tweens.Tween;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    size: Size,
    data: PiggyItemData,
    count: number = 0,
    content: string = ''
  ) {
    super(scene, x, y, size, data, count, content);

    // icon
    this.setIconSize(size.width - 10, size.height - 10);

    // 設置highLight圖片
    this.setHighlightIconSize(size.width + 10, size.height + 10);
    // 遮罩
    this.itemMask = this.addGraphics(0, 0);
    this.itemMask.fillStyle(UIHelper.blackNumber, this.itemMaskAlpha);
    this.itemMask.fillRect(-size.width / 2, -size.height / 2, size.width, size.height);
    this.itemMask.setVisible(false);

    // 子彈圖
    this.bulletIcon = this.addImage(PiggyString.BulletIcon, 0, 0);
    this.bulletIcon.setVisible(false);
    // 使用中圖
    this.useIcon = this.addImage(PiggyString.Using, 0, 0);
    this.useIcon.setVisible(false);
  }

  /** 裝備子彈 */
  public equipBullet(): void {
    this.bulletIcon.setVisible(true);
    this.useIcon.setVisible(true);
    this.setHighlight(true);
    this.itemMask.setVisible(true);

    // 設定旋轉效果
    this.useIconRotateTween = this.scene.tweens.add({
      targets: this.useIcon,
      angle: { from: 0, to: 360 },
      duration: this.rotateTweenDuration,
      repeat: -1,
    });
  }

  /** 解除裝備子彈 */
  public unequipBullet(): void {
    this.bulletIcon.setVisible(false);
    this.useIcon.setVisible(false);
    this.setHighlight(false);
    this.itemMask.setVisible(false);

    // 停止旋轉效果
    if (this.useIconRotateTween) {
      this.useIconRotateTween.remove();
      this.useIconRotateTween = undefined;
    }
  }
}
