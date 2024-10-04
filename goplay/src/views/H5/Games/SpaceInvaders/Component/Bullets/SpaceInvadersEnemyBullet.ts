import { SpaceInvadersString } from '../../Data/SpaceInvadersConfig';
import SpaceInvadersGameScene from '../../Scenes/SpaceInvadersGameScene';
import { BaseSpaceInvadersBullet } from './BaseSpaceInvadersBullet';

export class SpaceInvadersEnemyBullet extends BaseSpaceInvadersBullet {
  public declare scene: SpaceInvadersGameScene;

  /** 子彈移動方向 */
  private moveDirection: Phaser.Math.Vector2;
  /** 子彈移動速度 */
  private moveSpeed: number;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, SpaceInvadersString.EnemyBullet);
  }

  /**
   * 發射子彈
   * @param startPosition 起始位置
   * @param target 目標位置
   * @param speed 速度
   */
  public shoot(startPosition: Phaser.Math.Vector2, target: Phaser.Math.Vector2, speed: number): void {
    this.setPosition(startPosition.x, startPosition.y);

    // this.setVelocity 以speed前往目標所在的方向
    this.moveDirection = new Phaser.Math.Vector2(target.x - this.x, target.y - this.y).normalize();
    this.moveSpeed = speed;

    // 取得當前timeScale
    const timeScale = this.scene.isSlowDown ? this.scene.gameSetting.slowDownTimeScale : 1;

    this.setVelocity(
      this.moveDirection.x * this.moveSpeed * timeScale,
      this.moveDirection.y * this.moveSpeed * timeScale,
    );
  }

  /**
   * 設定移動tween的timeScale
   * @param timeScale timeScale
   */
  public setMovingTimeScale(timeScale: number): void {
    if (this.moveDirection && this.moveSpeed) {
      this.setVelocity(
        this.moveDirection.x * this.moveSpeed * timeScale,
        this.moveDirection.y * this.moveSpeed * timeScale,
      );
    }
  }
}
