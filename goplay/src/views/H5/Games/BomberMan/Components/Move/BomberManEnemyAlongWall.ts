import { BomberManEnemyPathStrategy } from './BomberManEnemyPathStrategy';
import BomberManTilemap, { Vector2 } from '../BomberManTilemap';
import BomberManEnemy from '../BomberManEnemy';

/** 炸彈超人-敵人 沿著牆走(沿左邊) */
export default class BomberManEnemyAlongWall extends BomberManEnemyPathStrategy {
  /** 上次的牆壁位置 */
  private lastWallTileXY?: Vector2;

  constructor(newTilemap: BomberManTilemap) {
    super(newTilemap);
  }

  /** 取得目標格子座標
   * @param currentTileXY 目前格子座標
   */
  public getTargetTileXY(currentTileXY: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    // 找到4個鄰格座標(順時鐘)
    const neighborTileList = this.getNeighborTileXYArray(currentTileXY);

    // 找出可走的格子
    const walkableTileList = neighborTileList.filter((tileXY) => this.tilemap.isTileWalkableByEnemy(tileXY));

    // 若所有方向都不可走，就停止移動
    if (walkableTileList.length === 0) {
      return currentTileXY;
    }

    // 取得周圍格子的座標(順時鐘)
    const surroundTileList = this.getSurroundTileXYArray(currentTileXY);

    // 若 未記錄上次的牆壁位置
    if (this.lastWallTileXY == null) {
      // 從上方開始，順時鐘檢查8個方向，找到牆壁之後，記錄為開始方向
      this.lastWallTileXY = surroundTileList.find(
        (surroundTileXY) =>
          // 不是可走格子
          false === this.tilemap.isTileWalkableByEnemy(surroundTileXY)
      );

      // 找不到牆，random一個座標
      if (this.lastWallTileXY == null) {
        // 否則，隨機抽選可走方向
        const walkableIndex = Phaser.Math.Between(0, walkableTileList.length - 1);
        return walkableTileList[walkableIndex];
      }
    }

    // 找到上次的牆壁在週圍格子中的索引
    const wallIndex = surroundTileList.findIndex((surroundTileXY) => this.lastWallTileXY?.equals(surroundTileXY));

    // 從牆的索引開始，順時鐘檢查8個方向，找到第一個可走格子
    for (let index = 0; index < surroundTileList.length; index++) {
      // 重覆檢查一次方向
      const modIndex = (wallIndex + index + surroundTileList.length) % surroundTileList.length;
      const surroundTileXY = surroundTileList[modIndex];

      // 是可走格子
      if (-1 !== walkableTileList.findIndex((walkableXY) => surroundTileXY.equals(walkableXY))) {
        // 往前進
        return surroundTileXY;
      }
      // 不可走格子
      else {
        // 只有不可走記錄wall
        if (false === this.tilemap.isTileWalkableByEnemy(surroundTileXY)) {
          // 記錄最後一個牆的座標
          this.lastWallTileXY = surroundTileXY;
        }
      }
    }

    // 防呆，都不可走
    return currentTileXY;
  }

  /** 更新目標格子座標
   * @param currentTileXY 目前座標
   * @param enemyAvatar 敵人
   */
  public updateTargetTileXY(currentTileXY: Phaser.Math.Vector2, enemyAvatar: BomberManEnemy): void {
    return;
  }

  /** 當朝向爆風半徑移動
   * @param currentTileXY 目前座標
   * @param enemyAvatar 敵人
   */
  public onTowardBlastRadius(currentTileXY: Phaser.Math.Vector2, enemyAvatar: BomberManEnemy): void {
    return;
  }
}
