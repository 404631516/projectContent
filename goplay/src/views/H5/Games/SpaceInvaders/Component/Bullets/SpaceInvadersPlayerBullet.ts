import { SpaceInvadersString } from '../../Data/SpaceInvadersConfig';
import SpaceInvadersGameScene from '../../Scenes/SpaceInvadersGameScene';
import { BaseSpaceInvadersBullet } from './BaseSpaceInvadersBullet';

export class SpaceInvadersPlayerBullet extends BaseSpaceInvadersBullet {
  public declare scene: SpaceInvadersGameScene;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, SpaceInvadersString.PlayerBullet);
  }

  /** 發射 */
  public shoot(x: number, y: number) {
    this.scene.sound.play(SpaceInvadersString.AudioShoot);
    this.setPosition(x, y);
    this.setVelocityY(-this.scene.gameSetting.playerBulletSpeed);
  }
}
