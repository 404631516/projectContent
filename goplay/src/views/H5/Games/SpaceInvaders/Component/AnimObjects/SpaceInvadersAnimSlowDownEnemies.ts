import { AnimationTextureKey } from '../../Data/SpaceInvadersConfig';

/** 道具子彈造成的爆炸範圍特效 */
export class SpaceInvadersAnimSlowDownEnemies extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, AnimationTextureKey.AnimSlowDownEnemies);
  }
}
