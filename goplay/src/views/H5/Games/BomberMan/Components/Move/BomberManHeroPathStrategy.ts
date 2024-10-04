import { BomberManPathStrategy } from './BomberManPathStrategy';

/** 炸彈超人-英雄巡路strategy */
export class BomberManHeroPathStrategy extends BomberManPathStrategy {
  /** 該點可否行走
   * @param tile 目前格子
   */
  public isWalkableTile(tile: Phaser.Tilemaps.Tile): boolean {
    // 檢查英雄是否可走到格子上
    return this.tilemap.isTileWalkableByHero(new Phaser.Math.Vector2(tile.x, tile.y));
  }
}
