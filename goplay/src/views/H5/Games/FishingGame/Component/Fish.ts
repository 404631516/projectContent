import { FishingFishData } from '@/manager/TableManager';
import PhaserHelper, { MinMax } from '@/views/H5/Helper/PhaserHelper';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { EnvironmentalAdditionType, FishingFishFx, FishingNumber, FishingString } from '../Data/FishingConfig';
import FishFSM, { FishEventId, FishStateId } from './FishFSM';

// Fish prefab
export default class Fish extends Object2D {
  /** 將原先body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody 強制定義型別 */
  public declare body: Phaser.Physics.Arcade.Body;

  /** 呼吸特效位置 */
  private readonly breathFXPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-135, -17.5);

  /** 當成禮物掉落時的衡向加速度 */
  private readonly minMaxDropSpeedX: MinMax = {
    min: -200,
    max: 200,
  };

  /** 判斷是否處於掉落狀態
   * @returns true = 掉落中
   */
  public get isFalling(): boolean {
    return this.visible === true && this.body.velocity.y > 0;
  }

  /** 判斷是否處於被抓捕
   * @returns true = 被抓捕
   */
  public get isCaught(): boolean {
    return this.fishFSM.isCurrentState(FishStateId.Caught);
  }

  /** 判斷是否為環保加成
   * @returns 環保加成類型
   */
  public get environmentalType(): EnvironmentalAdditionType {
    return this.fishData.environmentalAddition;
  }

  /** 狀態機 */
  private fishFSM: FishFSM;

  /** 儲存本身資料 */
  private fishData!: FishingFishData;

  /** 全域速度加乘 */
  private speedMultiply: number = 1;

  /** 暫存tween弦波動畫 */
  private tween?: Phaser.Tweens.Tween;

  /** 表演特效 */
  private fishFx!: Phaser.GameObjects.Sprite;

  /** 魚Sprite */
  private fishSprite!: Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number | undefined
  ) {
    super(scene, x, y);
    // 設置尺寸並加入物理body
    this.setSize(FishingNumber.FishFramePixel, FishingNumber.FishFramePixel);
    scene.physics.add.existing(this);

    // 狀態機
    this.fishFSM = new FishFSM(this);
    this.fishFSM.start();

    // 加入魚圖片物件
    this.fishSprite = this.addSprite('', 0, 0);

    // 加入魚特效物件
    this.fishFx = this.addSprite('', 0, 0);
  }

  /** 更新狀態機 */
  public update(time: number, delta: number): void {
    this.fishFSM.update(delta);
  }

  /** 獲取魚的分數值 */
  public getScore(): number {
    return this.fishData.score;
  }

  /** 獲取魚的魔力值 */
  public getEnergy(): number {
    return this.fishData.energy;
  }

  //#region 操控
  /** 閒置狀態 */
  public idle(): void {
    this.fishFSM.stateMachine.triggerEvent(FishEventId.Idle);
  }

  /** 出現在海中游動
   * @param fishingFishData 魚種靜態資料
   * @param speedMultiply 全域速度加乘
   */
  public swim(fishingFishData: FishingFishData, speedMultiply: number): void {
    // 設置魚種參數
    this.setFishData(fishingFishData);
    // 給予全域速度加乘
    this.speedMultiply = speedMultiply;

    this.setActive(true);
    this.fishFSM.stateMachine.triggerEvent(FishEventId.Swim);
  }

  /** 被魚鉤鉤中 */
  public caught(): void {
    this.fishFSM.stateMachine.triggerEvent(FishEventId.Caught);
  }

  /** 從海面上跳躍 */
  public jump(): void {
    this.fishFSM.stateMachine.triggerEvent(FishEventId.Jump);
  }

  /** 從天空掉落
   * @param fishingFishData 魚種靜態資料
   */
  public drop(fishingFishData: FishingFishData): void {
    // 設置魚種參數
    this.setFishData(fishingFishData);

    this.setActive(true);
    this.fishFSM.stateMachine.triggerEvent(FishEventId.Drop);
  }
  //#endregion

  //#region 狀態機
  /** 隱藏並deactive */
  public onIdleEnter(): void {
    this.setVisible(false);
    this.setActive(false);
  }

  /** 生成並游動 */
  public onSwimEnter(): void {
    // Active並顯示
    this.setVisible(true);
    // 關閉重力
    this.body.setGravityY(0).setVelocityY(0);

    // 判斷是否在左側
    const isLeftSide = this.x <= FishingNumber.SeaCenter;
    // 假如魚在螢幕左側，則翻轉往右邊游動(圖預設是往左)。環保物件不翻轉(因為綁數字)
    const isFlip = isLeftSide && this.fishData.environmentalAddition === EnvironmentalAdditionType.None;
    this.setFlip(isFlip, false);

    // 計算隨機游動速度
    const velocityX = Phaser.Math.Between(
      this.fishData.minSwimSpeed * this.speedMultiply,
      this.fishData.maxSwimSpeed * this.speedMultiply
    );
    // 給予相對游動速度
    this.body.setVelocityX(velocityX * (isLeftSide ? 1 : -1));

    // 以海水中心y位置來判斷要往上或往下做弦波，避免飛出海面
    const amplitudeDirection = this.y > FishingNumber.SeaLevel + FishingNumber.SeaHeight / 2 ? -1 : 1;
    // 設置弦波動畫
    this.tween = this.scene.tweens.add({
      targets: this,
      duration: this.fishData.sinePeriod * 1000,
      y: this.y + this.fishData.sineAmplitude * amplitudeDirection,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
    });

    this.playSwimAnim();
    this.playFx(this.fishData.fishFx);
  }

  /** 移除tween弦波動畫 */
  public onSwimLeave(): void {
    if (this.tween) {
      this.scene.tweens.remove(this.tween);
      this.tween = undefined;
    }
  }

  /** 被釣中時移除加速度，並播放死亡動畫 */
  public onCaughtEnter(): void {
    this.body.setVelocity(0, 0);
    this.playDeathAnim();
    this.playFx(FishingFishFx.None);
  }

  /** 往上方跳躍 */
  public onJumpEnter(): void {
    this.body.setGravityY(PhaserHelper.gravity);
    this.body.setVelocityY(-this.fishData.jumpForce);
    this.body.setVelocityX(Phaser.Math.Between(-this.fishData.maxJumpSpeed, this.fishData.maxJumpSpeed));
  }

  /** 生成並掉落 */
  public onDropEnter(): void {
    // Active並顯示
    this.setActive(true).setVisible(true);
    this.setFlip(false, false);
    // 開啟重力
    this.body.setGravityY(PhaserHelper.gravity).setVelocityY(0);
    this.body.setOffset(0, 0);
    // 給予橫向加速度
    this.body.setVelocityX(Phaser.Math.Between(this.minMaxDropSpeedX.min, this.minMaxDropSpeedX.max));

    this.playDeathAnim();
    this.playFx(FishingFishFx.None);
  }

  /** 設置魚種靜態資料
   * @param fishingFishData 魚種靜態資料
   */
  private setFishData(fishingFishData: FishingFishData): void {
    // 依照給予的fishId從靜態表對應的資料生成魚
    this.fishData = fishingFishData;
    this.scale = this.fishData.scale;
  }

  /** 播放死亡動畫 */
  private playDeathAnim(): void {
    this.fishSprite.play(this.fishData.nameKey + '_die');
  }

  /** 播放游泳動畫 */
  private playSwimAnim(): void {
    this.fishSprite.play(this.fishData.nameKey + '_swim');
  }

  /** 播放特效動畫
   * @param fishingFishFx 特效類別
   */
  private playFx(fishingFishFx: FishingFishFx): void {
    switch (fishingFishFx) {
      case FishingFishFx.None:
        // 無特效則關閉顯示
        this.fishFx.setVisible(false);
        this.fishFx.stop();
        break;
      case FishingFishFx.BreathFX:
        // 顯示並調整定位
        this.fishFx.setVisible(true);
        this.fishFx.setPosition(this.breathFXPosition.x, this.breathFXPosition.y);
        this.fishFx.play(FishingString.AnimFishBreath);
        break;
    }
  }
  //#endregion
}
