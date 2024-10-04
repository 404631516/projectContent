import { SpaceInvadersString } from '../../Data/SpaceInvadersConfig';
import SpaceInvadersGameScene from '../../Scenes/SpaceInvadersGameScene';
import { BaseSpaceInvadersBullet } from './BaseSpaceInvadersBullet';

export class SpaceInvadersPlayerBulletCircle extends BaseSpaceInvadersBullet {
  public declare scene: SpaceInvadersGameScene;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, SpaceInvadersString.PlayerBulletCircle);
  }

  /** 發射 */
  public shoot(x: number, y: number) {
    this.scene.sound.play(SpaceInvadersString.AudioShoot);
    this.setPosition(x, y);
    this.setVelocityY(-this.scene.gameSetting.playerBulletSpeed);
  }

  public kill(): void {
    // 觸發圓形爆炸效果
    this.scene.explodeCircle(this.x, this.y);
    // destroy
    super.kill();
  }
}
