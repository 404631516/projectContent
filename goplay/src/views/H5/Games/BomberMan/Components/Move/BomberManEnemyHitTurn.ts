import { PathDirectionType } from '@/views/H5/Helper/TileMapPathFinder';
import { BomberManEnemyPathStrategy } from './BomberManEnemyPathStrategy';
import BomberManTilemap from '../BomberManTilemap';
import BomberManEnemy from '../BomberManEnemy';

/** 炸彈超人-敵人 遇牆向右/左轉 */
export default class BomberManEnemyHitTurn extends BomberManEnemyPathStrategy {
  /** 移動方向 */
  private moveArrow: PathDirectionType = PathDirectionType.None;
  /** 移動方向索引值增加量 */
  private indexOffset: number = 1;

  constructor(newTilemap: BomberManTilemap, newPreferArrow: PathDirectionType) {
    super(newTilemap);
    // 目前移動方向，預設為移動時偏好方向
    this.moveArrow = newPreferArrow;
    // 用移動時偏好方向，決定檢查方向是用順時鐘或逆時鐘
    this.indexOffset = newPreferArrow === PathDirectionType.Right ? 1 : -1;
  }

  /** 取得目標格子座標
   * @param currentTileXY 目前格子座標
   */
  public getTargetTileXY(currentTileXY: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    // 方向清單 (從上方開始，順時鐘)
    const aroundArrow: PathDirectionType[] = [
      PathDirectionType.Up,
      PathDirectionType.Right,
      PathDirectionType.Down,
      PathDirectionType.Left,
    ];

    // 找出方向清單的索引
    const startArrowIndex = aroundArrow.findIndex((arrow) => arrow === this.moveArrow);
    if (startArrowIndex === -1) {
      console.error(`startArrowIndex === -1`);
      return currentTileXY;
    }

    // 從正在移動的方向開始，順時鐘/逆時鐘檢查方向，找到第一個可走格子
    for (let index = 0; index < aroundArrow.length; index++) {
      // 重覆檢查一次方向
      let modIndex = startArrowIndex + index * this.indexOffset + aroundArrow.length;
      modIndex %= aroundArrow.length;
      const forwardArrow = aroundArrow[modIndex];

      // 取得前進的格子座標
      const forwardTile = this.tilemap.getNeighborTileXY(currentTileXY, forwardArrow);

      // 是可走格子
      if (this.tilemap.isTileWalkableByEnemy(forwardTile)) {
        // 往前進
        this.moveArrow = forwardArrow;
        return forwardTile;
      }
    }

    // 防呆，沒有可走格子
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
