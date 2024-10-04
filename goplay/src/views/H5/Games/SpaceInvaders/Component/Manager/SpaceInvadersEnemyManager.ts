import {
  SpaceInvadersEnemyData,
  SpaceInvadersMovementPatternData,
  SpaceInvadersWaveData,
} from '@/manager/TableManager';
import SpaceInvadersGameScene from '../../Scenes/SpaceInvadersGameScene';
import { SpaceInvadersEnemy } from '../SpaceInvadersEnemy';
import { SpaceInvadersGroupManager } from './SpaceInvadersGroupManager';

/** 敵人管理器 */
export class SpaceInvadersEnemyManager {
  /** 敵人群 */
  public enemies: Phaser.Physics.Arcade.Group;

  /** 下一波次index */
  private nextWaveIndex: number;
  /** 下一波次時間 */
  private nextWaveTime: number;

  /** 是否所有波次都已生成完畢 */
  private isWaveEnd: boolean = false;

  /** constructor
   * @param gameScene
   * @param groupManager
   * @param waves 生成波次資料
   * @param movementPatternDataList 敵人移動模式設定資料
   */
  constructor(
    private gameScene: SpaceInvadersGameScene,
    private groupManager: SpaceInvadersGroupManager,
    private waves: SpaceInvadersWaveData[],
    private movementPatternDataList: SpaceInvadersMovementPatternData[],
    private enemyDataList: SpaceInvadersEnemyData[],
  ) {
    this.enemies = this.gameScene.physics.add.group({
      maxSize: 1000,
      classType: SpaceInvadersEnemy,
      runChildUpdate: true,
    });
    this.enemies.setOrigin(0, 0);
    // 設定下一波(第一波)時間
    this.nextWaveIndex = 0;
    this.nextWaveTime = waves[0].time * 1000;
  }

  /**
   * 更新
   * @param currentTime 當前時間
   */
  public update(currentTime: number): void {
    // 如果所有波次已生成完畢，則不再生成
    if (this.isWaveEnd) {
      return;
    }

    // 如果時間到，生成下一波
    if (currentTime >= this.nextWaveTime) {
      this.generateEnemies(this.nextWaveIndex);
      this.nextWaveIndex++;
      // 若所有波次已生成完畢，設定下一波次index為waveEndIndex
      if (this.nextWaveIndex >= this.waves.length) {
        this.isWaveEnd = true;
        return;
      }
      // 設定下一波次時間
      this.nextWaveTime = this.waves[this.nextWaveIndex].time * 1000;
    }
  }

  //#region 敵人生成
  /** 生成一波敵人 */
  public generateEnemies(waveIndex: number): void {
    // 取得波次資料
    const waveData = this.waves[waveIndex];
    // 取得敵人移動模式
    const movementPatternData = this.movementPatternDataList.find((data) => data.id === waveData.movementPattern);
    if (!movementPatternData) {
      console.error('movementPatternData is not found');
      return;
    }
    // 取得這波次的敵人資料
    const enemyData = this.enemyDataList.find((data) => data.id === waveData.enemyId);
    if (!enemyData) {
      console.error('enemyData is not found');
      return;
    }
    // 生成複數敵人
    for (let i = 0; i < waveData.enemyCount; i++) {
      this.generateEnemy(waveData, movementPatternData, enemyData);
    }
  }

  /** 創建一個敵人
   * @param spawnPosition 出生點
   * @param waveData 所屬波次資料
   * @param movementPatternData 移動模式資料
   * @returns
   */
  private generateEnemy(
    waveData: SpaceInvadersWaveData,
    movementPatternData: SpaceInvadersMovementPatternData,
    enemyData: SpaceInvadersEnemyData,
  ): void {
    // 如果敵人群已滿
    if (this.enemies.isFull()) {
      return;
    }
    // 生成敵人
    const enemy: SpaceInvadersEnemy = this.enemies.create();
    enemy.init(this.groupManager, waveData, movementPatternData, enemyData);
  }
  //#endregion

  /**
   * 清除範圍內的敵人
   * @param shouldKill 判斷敵人是否需要被摧毀的函式(定義摧毀範圍)
   * @param damage 傷害值
   * @param instantKill 是否即死攻擊
   * @returns 清除的敵人數量
   */
  public killRangeEnemies(
    shouldKill: (enemy: SpaceInvadersEnemy) => boolean,
    damage: number,
    instantKill: boolean = false,
  ): number {
    // 計算擊殺數
    let killedCount = 0;
    // for each敵人群
    this.enemies.children.each((gameObject) => {
      // 取得敵人
      const enemy: SpaceInvadersEnemy = gameObject as SpaceInvadersEnemy;
      // 如果判斷函式返回true，則摧毀敵人
      if (shouldKill(enemy)) {
        // 敵人受傷
        const isKill = enemy.onHit(damage, instantKill);
        // 如果敵人被擊殺
        if (isKill) {
          // 擊殺數+1
          killedCount++;
        }
      }
      return true;
    });
    // 回傳擊殺數
    return killedCount;
  }
}
