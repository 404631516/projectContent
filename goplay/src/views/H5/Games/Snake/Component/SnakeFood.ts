import { SnakeFoodData } from '@/manager/TableManager';
import SnakeGameScene from '../Scenes/SnakeGameScene';
import { SnakeNumber, SnakeString } from '../Data/SnakeConfig';
import { AnimationType } from './SnakeAnimationFactory';

export default class SnakeFood extends Phaser.GameObjects.Image {
  /** 遊戲場景 */
  private snakeScene: SnakeGameScene;
  /** 食物靜態表資料 */
  private foodData: SnakeFoodData;
  public getFoodData(): SnakeFoodData {
    return this.foodData;
  }
  /** 食物生成特效 */
  private foodGenerateEffect: Phaser.GameObjects.Sprite;
  /** 食物摧毀時間點 */
  private destroyTime: number;

  /** 建構子
   * @param snakeGameScene 遊戲場景
   * @param x 生成座標x
   * @param y 生成座標y
   * @param foodData 食物靜態表資料
   * @param currentTime 當前遊戲時間
   */
  constructor(snakeGameScene: SnakeGameScene, x: number, y: number, foodData: SnakeFoodData, currentTime: number) {
    super(snakeGameScene, x, y, foodData.nameKey);
    this.snakeScene = snakeGameScene;
    this.snakeScene.add.existing(this);
    this.snakeScene.physics.add.existing(this);
    this.setDisplaySize(SnakeNumber.GridSize, SnakeNumber.GridSize);
    // 設定食物資料
    this.foodData = foodData;
    // 設定食物消失時間
    this.destroyTime = currentTime + foodData.appearSeconds * 1000;
    // 食物生成特效
    this.foodGenerateEffect = this.snakeScene.add.sprite(x, y, SnakeString.FoodGenerateEffect);
    this.foodGenerateEffect.play(AnimationType.FoodGenerate);
    this.foodGenerateEffect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.foodGenerateEffect.destroy();
    });
  }

  /** update
   * @param time 遊戲開始所經過時間
   * @returns 是否需要刪除
   */
  public isDestroyTime(currentTime: number): boolean {
    return currentTime >= this.destroyTime;
  }
}
