import { PathFindStrategy } from '@/views/H5/Helper/TileMapPathFinder';
import BomberManTilemap from '../BomberManTilemap';

type Vector2 = Phaser.Math.Vector2;

/** 炸彈超人巡路strategy */
export abstract class BomberManPathStrategy implements PathFindStrategy {
  protected tilemap!: BomberManTilemap;

  /** 建構子
   * @param newTilemap 地圖
   */
  constructor(newTilemap: BomberManTilemap) {
    // 防呆
    if (newTilemap == null) {
      console.error(`BomberManPathStrategy: newTilemap == null`);
      return;
    }

    this.tilemap = newTilemap;
  }

  /** 該點可否行走
   * @param tile 目前格子
   */
  public abstract isWalkableTile(tile: Phaser.Tilemaps.Tile): boolean;

  /** 檢查此格為牆壁
   * @param tilePosition 格子座標
   */
  public isWallTile(tilePosition: Vector2): boolean {
    return this.tilemap.isWallTile(tilePosition);
  }

  /** 取得鄰近格子的座標(順時鐘)
   * @param currentTileXY 目前格子座標
   */
  public getNeighborTileXYArray(currentTileXY: Phaser.Math.Vector2): Phaser.Math.Vector2[] {
    return this.tilemap.getNeighborTileXYArray(currentTileXY);
  }
}
