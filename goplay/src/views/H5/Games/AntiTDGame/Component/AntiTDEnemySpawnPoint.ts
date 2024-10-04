export default class AntiTDEnemySpawnPoint extends Phaser.GameObjects.Sprite {
  /** 以生成且活躍的敵人隊伍數量 */
  public spawnedLivingEnemyCount!: number;

  /** 初始化 */
  public init(): void {
    this.spawnedLivingEnemyCount = 0;
  }
}
