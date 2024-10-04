import { SnakeString } from '../Data/SnakeConfig';

export enum AnimationType {
  FoodGenerate = 'foodGenerate',
  Eat = 'eat',
}

export class SnakeAnimationFactory {
  constructor(private scene: Phaser.Scene) {
    this.init();
  }

  private init() {
    // 食物生成特效
    this.scene.anims.create({
      key: AnimationType.FoodGenerate,
      frames: this.scene.anims.generateFrameNumbers(SnakeString.FoodGenerateEffect, {
        start: 0,
        end: 6,
      }),
      frameRate: 24,
      repeat: 0,
      hideOnComplete: true,
    });
    // 吃食物特效
    this.scene.anims.create({
      key: AnimationType.Eat,
      frames: this.scene.anims.generateFrameNumbers(SnakeString.EatEffect, {
        start: 0,
        end: 8,
      }),
      frameRate: 24,
      repeat: 0,
      hideOnComplete: true,
    });
  }
}
