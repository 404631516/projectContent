import { EnemyMoveType, BomberManNumber, BomberManDepth } from '../Data/BomberManConfig';
import BomberManEnemyRandomMove from './Move/BomberManEnemyRandomMove';
import BomberManEnemyAlongWall from './Move/BomberManEnemyAlongWall';
import BomberManEnemyHitTurn from './Move/BomberManEnemyHitTurn';
import BomberManEnemySearchHero from './Move/BomberManEnemySearchHero';
import { BomberManEnemyData } from '@/manager/TableManager';
import { BomberManAvatar, CharMoveState } from './BomberManAvatar';
import { BomberManEnemyPathStrategy } from './Move/BomberManEnemyPathStrategy';
import BomberManTilemap, { Vector2 } from './BomberManTilemap';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { randomRange } from '@/views/H5/Helper/MathHelper';

/** 炸彈超人-敵人 */
export default class BomberManEnemy extends BomberManAvatar {
  //#region data
  /** 移動速度 */
  private _speed: number = 0;
  public get speed(): number {
    return this._speed;
  }
  /** 取得碰撞區大小 */
  public get boundingBoxSize(): number {
    return BomberManNumber.enemyColliderSize;
  }
  /** 深度 */
  public get avatarDepth(): number {
    return BomberManDepth.enemy;
  }
  /** 縮放 */
  public get avatarScale(): number {
    return BomberManNumber.enemySpriteShowScale;
  }
  /** 圖片偏移 */
  public get avatarSpriteOffset(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(0, BomberManNumber.enemySpriteOffsetY);
  }

  /** 敵人靜態表 */
  private _enemyTableData!: BomberManEnemyData;
  public get enemyTableData(): BomberManEnemyData {
    return this._enemyTableData;
  }

  /** 移動模式 */
  private moveStrategy!: BomberManEnemyPathStrategy;

  /** 敵人死亡的效果 */
  private deadFx!: Phaser.GameObjects.Sprite;
  //#endregion data

  /** 初始化敵人
   * @param enemyData 敵人靜態表
   * @param newTilemap 地圖
   */
  public initEnemy(enemyData: BomberManEnemyData, newTilemap: BomberManTilemap): void {
    // 靜態表
    this._enemyTableData = enemyData;

    // 決定 移動速度
    this._speed = randomRange(this.enemyTableData.enemyMoveSpeedMin, this.enemyTableData.enemyMoveSpeedMax);

    // 移動方式
    let configMoveType = this.enemyTableData.enemyMoveType;
    if (configMoveType === EnemyMoveType.Random) {
      // 隨機決定移動方式
      configMoveType = Phaser.Math.Between(EnemyMoveType.Random + 1, EnemyMoveType.Max - 1);
    }

    // 取得移動模式
    this.moveStrategy = this.getMoveStrategy(configMoveType, newTilemap);

    // 初始化角色
    this.initAvatar(this.moveStrategy, newTilemap);

    // 建立動畫
    this.createAnimation();

    // console.log(`initEnemy: id=${enemyData.id} x=${this.x}, y=${this.y}`);

    // 出生時記錄開始/目的座標
    this.startTileXY = this.tilemap.worldXYToTileXY(new Phaser.Math.Vector2(this.x, this.y));
    this.targetTileXY = this.startTileXY;
  }

  /** 當敵人死亡 */
  public onDestroy(): void {
    // 停用物件
    this.active = false;
    // 透明
    this.alpha = 0;

    // 關掉物理性質
    this.body.enable = false;

    // 刪掉舊動作
    this.avatarSprite.anims.remove(AnimationHelper.getCharacterAnimKey(this.enemyTableData, CharacterAnimType.Walk));

    this.onAvatarStop();
    // 出生時記錄開始/目的座標
    this.startTileXY = this.tilemap.worldXYToTileXY(new Phaser.Math.Vector2(this.x, this.y));
    this.targetTileXY = this.startTileXY;
  }

  /** 建立動畫 */
  public createAnimation(): void {
    // 動作key
    const animationKey = AnimationHelper.getCharacterAnimKey(this.enemyTableData, CharacterAnimType.Walk);
    // 建立walk動作
    this.avatarSprite.anims.create({
      key: animationKey,
      frames: animationKey,
      frameRate: 5,
      repeat: -1,
    });

    // 播動畫
    this.avatarSprite.anims.play(animationKey);
  }

  /** 取得移動模式
   * @param moveType 移動模式
   * @param newTilemap 地圖
   */
  public getMoveStrategy(moveType: EnemyMoveType, newTilemap: BomberManTilemap): BomberManEnemyPathStrategy {
    // 敵人移動時偏好方向
    const movePreferArrow = this.enemyTableData.enemyMovePreferArrow;

    switch (moveType) {
      // 隨機移動，排除不可走
      case EnemyMoveType.RandomForWalkable:
        return new BomberManEnemyRandomMove(newTilemap);
      // 沿著牆走(沿左邊)
      case EnemyMoveType.AlongWall:
        return new BomberManEnemyAlongWall(newTilemap);
      // 遇牆向右/左轉
      case EnemyMoveType.TurnWhenHitWall:
        return new BomberManEnemyHitTurn(newTilemap, movePreferArrow);
      // 追蹤玩家
      case EnemyMoveType.SearchHero:
        return new BomberManEnemySearchHero(newTilemap);
      default:
        console.error(`initMoveComponent: undefine, moveType=${moveType}`);
        return new BomberManEnemyRandomMove(newTilemap);
    }
  }

  /** 角色移動狀態變換
   * @param moveState 移動狀態
   */
  public onCharMoveStateChange(moveState: CharMoveState): void {
    // idle時，代表到達目標，要決定新的目標
    if (moveState === CharMoveState.Idle) {
      this.onSetNewTarget(this.targetTileXY);
      return;
    }

    // 面向右時，翻轉動畫 (上下移動時不處理)
    if (this.targetTileXY.x !== this.startTileXY.x) {
      this.setFlip(this.targetTileXY.x > this.startTileXY.x, false);
    }

    // 目前只播放walk的動作
    const animationKey = AnimationHelper.getCharacterAnimKey(this._enemyTableData, CharacterAnimType.Walk);

    // 若動作相同，就不播放
    if (this.avatarSprite.anims.currentAnim && animationKey === this.avatarSprite.anims.currentAnim.key) {
      return;
    }

    // 播動畫
    this.avatarSprite.anims.play(animationKey);
  }

  /** 當走下一格之前 */
  public onBeforeNextMove(): void {
    // 更新目標格子座標
    this.moveStrategy.updateTargetTileXY(this.startTileXY, this);

    // 防呆
    if (this.movePath.length === 0) {
      return;
    }

    // 取得下一個格子
    const nextTileXY = this.movePath[0];
    // 偵測移動路徑是否有炸彈，有就隨機找路
    if (this.tilemap.isInBlastRadius(nextTileXY)) {
      // 朝向爆風半徑
      this.moveStrategy.onTowardBlastRadius(this.startTileXY, this);
    }
  }

  /** 當沒有移動路徑
   * @param currentTileXY 目前座標
   */
  public onNoPath(currentTileXY: Vector2): void {
    // 取得隨機目標
    const randomTileXY = this.moveStrategy.getRandomTargetTileXY(currentTileXY);
    // 若沒有可走，就停止移動
    if (currentTileXY.equals(randomTileXY)) {
      return;
    }

    // 移動角色
    this.onAvatarMove(currentTileXY, randomTileXY);
  }

  /** 設定新的目標
   * @param startTileXY 開始位置
   */
  public onSetNewTarget(startTileXY: Vector2): void {
    // 取得目標格子座標
    const targetTileXY = this.moveStrategy.getTargetTileXY(startTileXY);
    // 移動角色
    this.onAvatarMove(startTileXY, targetTileXY);
  }
}
