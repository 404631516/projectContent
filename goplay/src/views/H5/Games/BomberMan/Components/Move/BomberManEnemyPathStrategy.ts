import { BomberManPathStrategy } from './BomberManPathStrategy';
import { Vector2 } from '../BomberManTilemap';
import { PathDirectionType } from '@/views/H5/Helper/TileMapPathFinder';
import BomberManEnemy from '../BomberManEnemy';

/** 炸彈超人-敵人巡路strategy */
export abstract class BomberManEnemyPathStrategy extends BomberManPathStrategy {
  /** 該點可否行走
   * @param tile 目前格子
   */
  public isWalkableTile(tile: Phaser.Tilemaps.Tile): boolean {
    return this.tilemap.isTileWalkableByEnemy(new Phaser.Math.Vector2(tile.x, tile.y));
  }

  /** 取得目標格子座標
   * @param currentTileXY 目前座標
   */
  public abstract getTargetTileXY(currentTileXY: Vector2): Vector2;

  /** 更新目標格子座標
   * @param currentTileXY 目前座標
   * @param enemyAvatar 敵人
   */
  public abstract updateTargetTileXY(currentTileXY: Vector2, enemyAvatar: BomberManEnemy): void;

  /** 當朝向爆風半徑移動
   * @param currentTileXY 目前座標
   * @param enemyAvatar 敵人
   */
  public abstract onTowardBlastRadius(currentTileXY: Vector2, enemyAvatar: BomberManEnemy): void;

  /** 取得周圍格子的座標(順時鐘)
   * @param currentTileXY 目前格子座標
   */
  public getSurroundTileXYArray(currentTileXY: Phaser.Math.Vector2): Phaser.Math.Vector2[] {
    return [
      this.tilemap.getNeighborTileXY(currentTileXY, PathDirectionType.Up),
      this.tilemap.getNeighborTileXY(currentTileXY, PathDirectionType.UpRight),
      this.tilemap.getNeighborTileXY(currentTileXY, PathDirectionType.Right),
      this.tilemap.getNeighborTileXY(currentTileXY, PathDirectionType.DownRight),
      this.tilemap.getNeighborTileXY(currentTileXY, PathDirectionType.Down),
      this.tilemap.getNeighborTileXY(currentTileXY, PathDirectionType.DownLeft),
      this.tilemap.getNeighborTileXY(currentTileXY, PathDirectionType.Left),
      this.tilemap.getNeighborTileXY(currentTileXY, PathDirectionType.UpLeft),
    ];
  }

  /** 取得能避開炸彈爆風的格子
   * @param currentTileXY 目前格子座標
   */
  public getAvoidBlastTileXY(currentTileXY: Vector2): Vector2 {
    // 找到4個鄰格座標
    const neighborTileList = this.getNeighborTileXYArray(currentTileXY);

    // 找出可走的格子
    const walkableTileList = neighborTileList.filter((tilePosition) =>
      this.tilemap.isTileWalkableByEnemy(tilePosition)
    );

    // 都不可走，站在原地
    if (walkableTileList.length === 0) {
      return currentTileXY;
    }

    // 找出安全方向
    const safeTileList = walkableTileList.filter(
      (tilePosition) =>
        // 找出在爆風範圍外的移動方向
        false === this.tilemap.isInBlastRadius(tilePosition)
    );

    // 若有安全的路，就抽選一個
    if (safeTileList.length > 0) {
      // 隨機抽選安全方向
      const safeTileIndex = Phaser.Math.Between(0, safeTileList.length - 1);
      return safeTileList[safeTileIndex];
    }

    // 隨機抽選可走方向
    const walkableIndex = Phaser.Math.Between(0, walkableTileList.length - 1);
    return walkableTileList[walkableIndex];
  }

  /** 取得隨機目標
   * @param currentTileXY 目前位置
   */
  public getRandomTargetTileXY(currentTileXY: Vector2): Vector2 {
    // 找到4個鄰格座標
    const neighborTileList = this.getNeighborTileXYArray(currentTileXY);

    // 找出可走的格子
    const walkableTileList = neighborTileList.filter((tilePosition) =>
      this.tilemap.isTileWalkableByEnemy(tilePosition)
    );

    // 若所有方向都不可走，就停止移動
    if (walkableTileList.length === 0) {
      return currentTileXY;
    }

    // 否則，隨機抽選可走方向
    const walkableIndex = Phaser.Math.Between(0, walkableTileList.length - 1);
    return walkableTileList[walkableIndex];
  }
}
