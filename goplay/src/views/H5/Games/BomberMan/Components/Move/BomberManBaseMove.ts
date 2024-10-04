import BomberManEnemy from '../BomberManEnemy';

/** 基本的角色移動流程 */
export interface BomberManMoveStrategy {
  /** 初始化
   * @param newCharID 角色ID
   * @param newChar 含物理的角色物件
   * @param newSprite 角色動畫圖
   * @param newSpeed 速度
   */
  init(newCharID: number, newSprite: Phaser.Physics.Arcade.Sprite, newSpeed: number): void;
  /** 角色刪除時要清除資料 */
  onDestroy(): void;

  /** 設定為玩家角色 */
  setIsHero(isHero: boolean): void;

  /** 每幀更新移動流程 */
  updateMove(): void;

  /** 設定速度
   * @param newSpeed 速度
   */
  setSpeed(newSpeed: number): void;
}

/** 玩家移動流程 */
export interface BomberManHeroMoveStrategy {
  /** 玩家要放置炸彈 */
  isHeroPutBomb(): boolean;

  /** 玩家已放置炸彈 */
  setHeroPutBomb(isPut: boolean): void;
}

/** 敵人移動流程 */
export interface BomberManEnemyMoveStrategy {
  /** 設定敵人移動目標 */
  setEnemyMoveTarget(): void;

  /** 設定敵人 */
  setEnemy(newEnemy: BomberManEnemy): void;
}
