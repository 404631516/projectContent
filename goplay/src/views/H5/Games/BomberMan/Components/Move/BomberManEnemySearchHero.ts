import BomberManTilemap, { Vector2 } from '../BomberManTilemap';
import { BomberManEnemyPathStrategy } from './BomberManEnemyPathStrategy';
import BomberManEnemy from '../BomberManEnemy';
import { BomberManNumber } from '../../Data/BomberManConfig';

/** 炸彈超人-敵人 追蹤玩家 */
export default class BomberManEnemySearchHero extends BomberManEnemyPathStrategy {
  /** 移動格子計數 */
  private moveCount: number = 0;

  constructor(newTilemap: BomberManTilemap) {
    super(newTilemap);
  }

  /** 取得目標格子座標
   * @param currentTileXY 目前格子座標
   */
  public getTargetTileXY(currentTileXY: Vector2): Vector2 {
    // 以玩家為目標尋路
    return this.tilemap.heroTileXY;
  }

  /** 更新目標格子座標
   * @param currentTileXY 目前座標
   * @param enemyAvatar 敵人
   */
  public updateTargetTileXY(currentTileXY: Vector2, enemyAvatar: BomberManEnemy): void {
    this.moveCount++;
    // 敵人移動時，每走幾格，就強制尋找英雄進行移動
    if (this.moveCount === BomberManNumber.enemyForceSearchHeroIntervalTile) {
      this.moveCount = 0;
      enemyAvatar.onSetNewTarget(currentTileXY);
    }
  }

  /** 當朝向爆風半徑移動
   * @param currentTileXY 目前座標
   * @param enemyAvatar 敵人
   */
  public onTowardBlastRadius(currentTileXY: Vector2, enemyAvatar: BomberManEnemy): void {
    // 取得能避開炸彈爆風的格子
    const targetTileXY = this.getAvoidBlastTileXY(currentTileXY);
    // 移動角色
    enemyAvatar.onAvatarMove(currentTileXY, targetTileXY);
  }
}
