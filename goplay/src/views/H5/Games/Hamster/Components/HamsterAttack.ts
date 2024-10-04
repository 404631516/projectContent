import { HamsterNumber } from '../Data/HamsterConfig';
import { Scene } from 'phaser';
export default class HamsterAttack extends Phaser.Physics.Arcade.Image {
  public onDestroy: () => void;
  constructor(scene: Scene, key: string) {
    super(scene, 0, 0, key);
    this.onDestroy = this.destroy;
  }

  public attack(start: Phaser.Math.Vector2, target: Phaser.Math.Vector2, onAttack: () => void) {
    this.setPosition(start.x, start.y);
    // 計算物攻數值
    const velocityX = -600 + Math.random() * 200;
    const sec = (target.x - start.x) / velocityX;
    const velocityY = (target.y - start.y - (HamsterNumber.Gravity * sec * sec) / 2) / sec;

    // 執行攻擊動畫
    this.setPosition(start.x, start.y);
    this.setVelocity(velocityX, velocityY);
    this.setVisible(true);
    this.setGravityY(HamsterNumber.Gravity);
    this.setActive(true);

    this.scene.time.addEvent({
      delay: sec * 1000,
      callback: () => {
        this.setVisible(false);
        this.setActive(false);

        // 啟動攻擊的回呼
        if (onAttack) {
          onAttack();
        }

        // 攻擊後消失
        this.onDestroy();
      },
    });
  }
}
