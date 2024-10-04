import { AnimationTextureKey } from '../../Data/SpaceInvadersConfig';

/** 道具全畫面敵人摧毀特效 */
export class SpaceInvadersAnimFullScreen extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, AnimationTextureKey.AnimFullScreen);
  }
}
