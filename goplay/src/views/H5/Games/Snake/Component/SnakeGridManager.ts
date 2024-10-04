import { SnakeNumber } from '../Data/SnakeConfig';
import SnakeGameScene from '../Scenes/SnakeGameScene';

export class SnakeGridManager {
  /** 全地圖格子上的偵測區域 */
  detectionZones: Phaser.GameObjects.Rectangle[];
  /** 遊戲場景 */
  scene: SnakeGameScene;

  /** 建構子
   * @param scene 遊戲場景
   * @param mapWidth 場景寬度格子數
   * @param mapHeight 場景高度格子數
   */
  constructor(scene: SnakeGameScene, mapWidth: number, mapHeight: number) {
    this.scene = scene;

    // 生成跟地圖格數一樣多的detectionZone
    this.detectionZones = [];
    for (let i = 0; i < mapWidth; i++) {
      for (let j = 0; j < mapHeight; j++) {
        const posX = SnakeNumber.GameRangeLeftTopX + i * SnakeNumber.GridSize + SnakeNumber.GridSize / 2;
        const posY = SnakeNumber.GameRangeLeftTopY + j * SnakeNumber.GridSize + SnakeNumber.GridSize / 2;

        const detectionZone = scene.add.rectangle(posX, posY, 20, 20, 0xffffff, 0);
        scene.physics.add.existing(detectionZone);
        detectionZone.setVisible(false);

        // 將detectionZone加入到detectionZones
        this.detectionZones.push(detectionZone);
      }
    }
  }

  /** 取得隨機空位
   * @returns 隨機空位, 如果沒有空位就回傳undefined
   */
  public getRandomEmptyPosition(): Phaser.Math.Vector2 | undefined {
    // 找出所有空位
    const emptyZones = this.detectionZones.filter((zone) => {
      return (
        this.scene.physics.overlap(zone, this.scene.snake.body) === false &&
        this.scene.physics.overlap(zone, this.scene.foods) === false
      );
    });
    // 如果真的一個空位都沒有, 回傳undefined
    if (emptyZones.length === 0) {
      return undefined;
    }
    // 隨機取一個空位
    const randomZone = emptyZones[Math.floor(Math.random() * emptyZones.length)];
    return new Phaser.Math.Vector2(randomZone.x, randomZone.y);
  }
}
