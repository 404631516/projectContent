import ParkourMapObject from './ParkourMapObject';

export default class ParkourEnemy extends ParkourMapObject {
  /** 微調縮放比例 */
  public get adjustScale(): number {
    return 1;
  }

  constructor(scene: Phaser.Scene) {
    super(scene);

    // 設置弦波動畫
    this.scene.tweens.add({
      targets: this,
      duration: Phaser.Math.Between(1000, 3000),
      y: this.y + Phaser.Math.Between(50, 100),
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
    });
  }

  public onHit(objectGroup: Phaser.Physics.Arcade.Group): void {
    //
  }
}
