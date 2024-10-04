import { SpaceInvadersDepth, SpaceInvadersString } from '../Data/SpaceInvadersConfig';

/** 道具子彈造成的爆炸範圍特效 */
export class SpaceInvadersObstacle extends Phaser.Physics.Arcade.Sprite {
  public declare body: Phaser.Physics.Arcade.Body;

  /** 障礙物的移動速度 */
  private speed = 0;
  /** 障礙物的最大y值 */
  private maxY = 0;

  /** 障礙物的初始位置範圍 */
  private readonly X_RANGE = { min: 0, max: 1024 };
  private readonly Y_RANGE = { min: -1000, max: -100 };
  /** 移動速度範圍 */
  private readonly SPEEDS = [120, 150, 100];

  /** 障礙物的索引, 根據索引決定外型及移動速度 */
  private index: number = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, SpaceInvadersString.Obstacle1);
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    // 設定障礙物的圖片深度
    this.setDepth(SpaceInvadersDepth.Background);
  }

  /**
   * 初始化障礙物
   * @param index
   */
  public init(index: number): void {
    this.index = index;
    // 選擇障礙物圖片
    const textureKey = [SpaceInvadersString.Obstacle1, SpaceInvadersString.Obstacle2, SpaceInvadersString.Obstacle3][
      index
    ];
    this.setTexture(textureKey);
    // 設定障礙物的碰撞範圍
    this.body.setSize(this.displayWidth, this.displayHeight);
    // 設定障礙物的最大y值
    this.maxY = this.scene.game.canvas.height + this.displayHeight / 2;
    // 重置障礙物位置
    this.resetPosition();
  }

  /** 重置障礙物位置 */
  private resetPosition(): void {
    // 隨機起始位置
    this.setPosition(
      Phaser.Math.Between(this.X_RANGE.min, this.X_RANGE.max),
      Phaser.Math.Between(this.Y_RANGE.min, this.Y_RANGE.max),
    );
    // 移動速度
    this.speed = this.SPEEDS[this.index];
  }

  /**
   * 更新障礙物位置
   * @param delta frame間隔時間
   */
  public update(delta: number): void {
    // 障礙物往下移動
    this.y += this.speed * (delta / 1000);
    // 障礙物超出畫面後重置位置
    if (this.y > this.maxY) {
      this.resetPosition();
    }
  }
}
