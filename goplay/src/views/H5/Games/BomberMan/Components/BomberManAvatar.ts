import { BomberManPathStrategy } from './Move/BomberManPathStrategy';
import { TileMapPathFinder } from '@/views/H5/Helper/TileMapPathFinder';
import BomberManTilemap, { Vector2 } from './BomberManTilemap';
import { clamp } from '@/views/H5/Helper/MathHelper';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { Scene } from 'phaser';

/** 角色移動狀態 */
export enum CharMoveState {
  /** 閒置，未移動 */
  Idle,
  /** 走動中 */
  Walk,
}

/** 炸彈超人-角色 */
export abstract class BomberManAvatar extends Object2D {
  //#region data
  /** 將原先body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody 強制定義型別
   * 讓object2d.body 也可以使用 Arcade.Body 的完整功能
   */
  public declare body: Phaser.Physics.Arcade.Body;

  /** 巡路工具 */
  private pathFinder!: TileMapPathFinder;
  /** 地圖 */
  protected tilemap!: BomberManTilemap;

  /** 角色動畫圖 */
  protected avatarSprite!: Phaser.GameObjects.Sprite;

  /** 移動速度 */
  public abstract get speed(): number;
  /** 取得碰撞區大小 */
  public abstract get boundingBoxSize(): number;
  /** 深度 */
  public abstract get avatarDepth(): number;
  /** 縮放 */
  public abstract get avatarScale(): number;
  /** 圖片偏移 */
  public abstract get avatarSpriteOffset(): Vector2;
  /** 當走下一格之前 */
  public abstract onBeforeNextMove(): void;

  /** 角色移動狀態變換 */
  public abstract onCharMoveStateChange(moveState: CharMoveState): void;

  /** 移動路徑格子座標陣列 */
  protected movePath: Vector2[] = [];

  /** 開始移動位置 */
  protected startTileXY: Vector2 = Phaser.Math.Vector2.ZERO;
  /** 目標移動位置 */
  public targetTileXY: Vector2 = Phaser.Math.Vector2.ZERO;

  /** 移動經過時間 */
  private movePassedTime: number = 0;
  //#endregion data

  constructor(newScene: Scene, x: number, y: number, textureKey: string) {
    super(newScene, x, y);
    // 加入動畫圖(無物理)
    this.avatarSprite = this.addSprite(textureKey, 0, 0);
    // 加入物理
    this.scene.physics.add.existing(this);
  }

  /** 初始化角色
   * @param strategy 尋路方式
   * @param newTilemap 地圖
   */
  protected initAvatar(strategy: BomberManPathStrategy, newTilemap: BomberManTilemap): void {
    // 建立巡路工具
    this.pathFinder = new TileMapPathFinder(strategy, newTilemap.terrainLayer);
    // 設定地圖
    this.tilemap = newTilemap;

    // 記錄開始座標
    this.startTileXY = this.tilemap.worldXYToTileXY(new Phaser.Math.Vector2(this.x, this.y));
    // 記錄目的座標
    this.targetTileXY = this.startTileXY;

    // 設定大小
    this.setSize(this.boundingBoxSize, this.boundingBoxSize);
    // 圖片偏移
    this.avatarSprite.setPosition(this.avatarSpriteOffset.x, this.avatarSpriteOffset.y);

    // 顯示圖片
    this.setActive(true);
    this.setVisible(true);
    // 不透明
    this.alpha = 1;
    // 深度
    this.setDepth(this.avatarDepth);

    // 設定物理參數
    // 設定碰撞區大小
    this.body.setSize(this.boundingBoxSize, this.boundingBoxSize);
    // 啟用物理性質
    this.body.enable = true;
    // 無重量
    this.body.mass = 0;
    // 不移動
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    // 縮放
    this.avatarSprite.scale = this.avatarScale;
  }

  /** 更新角色
   * @param time 時間
   * @param delta 差值(MS)
   */
  public update(time: number, delta: number): void {
    // 轉世界座標
    const currentWorldXY = new Phaser.Math.Vector2(this.x, this.y);
    let targetWorldXY = this.tilemap.tileXYToWorldXYByScale(this.targetTileXY);

    // 走一格需要的時間(MS) = 一格 / 速度
    const timePerTile = (1 / this.speed) * 1000;

    // 檢查角色到達目的座標
    if (targetWorldXY.equals(currentWorldXY)) {
      // 已走完路徑
      if (this.movePath.length === 0) {
        // 切換為idle
        this.onCharMoveStateChange(CharMoveState.Idle);
        return;
      }

      // 扣除上一格移動秒數
      this.movePassedTime -= timePerTile;
      // 最低為0毫秒
      this.movePassedTime = Math.max(0, this.movePassedTime);

      // 設定當前所在座標
      this.startTileXY = this.targetTileXY;

      // 當走下一格之前
      this.onBeforeNextMove();

      // 取出路徑中第一個節點，並移除
      // 若沒有路律了，就設定為目前座標
      this.targetTileXY = this.movePath.shift() ?? this.startTileXY;
      // 轉世界座標
      targetWorldXY = this.tilemap.tileXYToWorldXYByScale(this.targetTileXY);

      // 切換為走路
      this.onCharMoveStateChange(CharMoveState.Walk);
    }

    // 開始移動時記錄累計時間，update用delta累加時間
    this.movePassedTime += delta;

    // lerp的百分比值 = 累計時間(MS) / (一格)需要的時間
    let percent = this.movePassedTime / timePerTile;
    // 確保不會超出上限
    percent = clamp(percent, 1, 0);

    // 轉世界座標
    const startWorldXY = this.tilemap.tileXYToWorldXYByScale(this.startTileXY);
    // 從開始座標 移動到 目的座標時，用百分比計算顯示位置
    const movingPosition = startWorldXY.clone().lerp(targetWorldXY, percent);

    // 設定角色位置
    this.setPosition(movingPosition.x, movingPosition.y);
  }

  /** 外部控制角色移動 到 目的座標
   * @param newStartTileXY 起始格子座標
   * @param newTargetTileXY 目的格子座標
   */
  public async onAvatarMove(newStartTileXY: Vector2, newTargetTileXY: Vector2): Promise<void> {
    // 尋找到目前的路徑
    this.movePath = this.pathFinder.findPath(newStartTileXY, newTargetTileXY);
    // 當沒有移動路徑
    if (this.movePath.length === 0) {
      // 通知沒有路徑
      this.onNoPath(newStartTileXY);
    }
  }

  /** 強制英雄停止 */
  public onAvatarStop(): void {
    this.movePath = [];
  }

  /** 當沒有移動路徑
   * @param currentTileXY 目前座標
   */
  public abstract onNoPath(currentTileXY: Vector2): void;
}
