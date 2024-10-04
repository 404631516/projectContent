import { AnimationTextureKey } from '../../Data/SpaceInvadersConfig';

/** 機體摧毀特效 */
export class SpaceInvadersAnimDestroy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, AnimationTextureKey.AnimDestroy);
  }
}
