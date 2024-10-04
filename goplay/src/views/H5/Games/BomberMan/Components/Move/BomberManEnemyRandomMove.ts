import { Vector2 } from '../BomberManTilemap';
import { BomberManEnemyPathStrategy } from './BomberManEnemyPathStrategy';
import BomberManEnemy from '../BomberManEnemy';

/** 炸彈超人-敵人 隨機移動，排除不可走 */
export default class BomberManEnemyRandomMove extends BomberManEnemyPathStrategy {
  /** 取得目標格子座標
   * @param currentTileXY 目前格子座標
   */
  public getTargetTileXY(currentTileXY: Vector2): Vector2 {
    return this.getRandomTargetTileXY(currentTileXY);
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
