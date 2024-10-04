import { AnimationTextureKey } from '../../Data/SpaceInvadersConfig';

export enum AnimationType {
  DestroyExplode = 'destroyExplode',
  LineExplode = 'lineExplode',
  CircleExplode = 'circleExplode',
  FullScreenExplode = 'fullScreenExplode',
  SlowDownEnemies = 'slowDownEnemies',
  EnemyFly1 = 'enemyFly1',
  EnemyFly2 = 'enemyFly2',
  EnemyFly3 = 'enemyFly3',
  EnemyFly4 = 'enemyFly4',
  EnemyFly5 = 'enemyFly5',
  EnemyFly6 = 'enemyFly6',
}

export class SpaceInvadersAnimationFactory {
  constructor(private scene: Phaser.Scene) {
    this.init();
  }

  private init() {
    // 機體爆炸動畫
    this.scene.anims.create({
      key: AnimationType.DestroyExplode,
      frames: this.scene.anims.generateFrameNumbers(AnimationTextureKey.AnimDestroy, {
        start: 0,
        end: 12,
      }),
      frameRate: 24,
      repeat: 0,
      hideOnComplete: true,
      showOnStart: true,
    });
    // 直線爆炸動畫
    this.scene.anims.create({
      key: AnimationType.LineExplode,
      frames: this.scene.anims.generateFrameNumbers(AnimationTextureKey.AnimLine, {
        start: 0,
        end: 5,
      }),
      frameRate: 24,
      repeat: 1,
      hideOnComplete: true,
      showOnStart: true,
    });
    // 圓形爆炸動畫
    this.scene.anims.create({
      key: AnimationType.CircleExplode,
      frames: this.scene.anims.generateFrameNumbers(AnimationTextureKey.AnimCircle, {
        start: 0,
        end: 10,
      }),
      frameRate: 24,
      repeat: 0,
      hideOnComplete: true,
      showOnStart: true,
    });
    // 全畫面爆炸動畫
    this.scene.anims.create({
      key: AnimationType.FullScreenExplode,
      frames: this.scene.anims.generateFrameNumbers(AnimationTextureKey.AnimFullScreen, {
        start: 0,
        end: 14,
      }),
      frameRate: 24,
      repeat: 0,
      hideOnComplete: true,
      showOnStart: true,
    });
    // 慢速敵人動畫
    this.scene.anims.create({
      key: AnimationType.SlowDownEnemies,
      frames: this.scene.anims.generateFrameNumbers(AnimationTextureKey.AnimSlowDownEnemies, {
        start: 0,
        end: 10,
      }),
      frameRate: 11,
      repeat: 0,
      hideOnComplete: true,
      showOnStart: true,
    });
    // 敵人1飛行動畫
    this.scene.anims.create({
      key: AnimationType.EnemyFly1,
      frames: this.scene.anims.generateFrameNumbers(AnimationTextureKey.AnimEnemy1, {
        start: 0,
        end: 5,
      }),
      frameRate: 6,
      repeat: -1,
    });
    // 敵人2飛行動畫
    this.scene.anims.create({
      key: AnimationType.EnemyFly2,
      frames: this.scene.anims.generateFrameNumbers(AnimationTextureKey.AnimEnemy2, {
        start: 0,
        end: 9,
      }),
      frameRate: 10,
      repeat: -1,
    });
    // 敵人3飛行動畫
    this.scene.anims.create({
      key: AnimationType.EnemyFly3,
      frames: this.scene.anims.generateFrameNumbers(AnimationTextureKey.AnimEnemy3, {
        start: 0,
        end: 7,
      }),
      frameRate: 6,
      repeat: -1,
    });
    // 敵人4飛行動畫
    this.scene.anims.create({
      key: AnimationType.EnemyFly4,
      frames: this.scene.anims.generateFrameNumbers(AnimationTextureKey.AnimEnemy4, {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });
    // 敵人5飛行動畫
    this.scene.anims.create({
      key: AnimationType.EnemyFly5,
      frames: this.scene.anims.generateFrameNumbers(AnimationTextureKey.AnimEnemy5, {
        start: 0,
        end: 9,
      }),
      frameRate: 6,
      repeat: -1,
    });
    // 敵人6飛行動畫
    this.scene.anims.create({
      key: AnimationType.EnemyFly6,
      frames: this.scene.anims.generateFrameNumbers(AnimationTextureKey.AnimEnemy6, {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }
}
