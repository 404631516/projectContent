import { Scene } from 'phaser';
import { DefenseNumber } from '../Data/DefenseConfig';

export enum BombType {
  Linear,
  Parabola,
}

export default class WeaponBomb extends Phaser.Physics.Arcade.Image {
  // 當子彈摧毀後的回呼
  public onDestroy?: () => void;

  constructor(scene: Scene) {
    super(scene, 0, 0, 'bullet');
  }

  /** 子彈發射 */
  public shoot(
    x: number,
    y: number,
    target: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite | Phaser.Math.Vector2,
    time: number = 500,
    type: BombType
  ) {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);

    // 計算重力
    let gravity = 0;
    switch (type) {
      case BombType.Parabola:
        this.setAccelerationY(DefenseNumber.Gravity);
        gravity = DefenseNumber.Gravity;
        break;
      default:
        this.setAccelerationY(0);
        gravity = 0;
        break;
    }

    // TODO 整合飛行表演進TimeEvent, 最好改變GameSpeed時, 飛行速度跟著改變
    const sec = time * 0.001;
    const velocityY = (target.y - y - (gravity * sec * sec) / 2) / sec;
    const velocityX = (target.x - x) / sec;
    this.setVelocity(velocityX, velocityY);

    // 砲彈旋轉特效
    this.scene.add.tween({
      targets: this,
      rotation: `+=${Phaser.Math.PI2}`,
      duration: 200,
      repeat: -1,
    });

    // TODO 使用TimeEventManager來設定destroy事件
    setTimeout(() => {
      if (this.onDestroy) {
        this.onDestroy();
      }
    }, time);
  }
}
