import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { BubbleDragonNumber, BubbleItemFunction } from '../Data/BubbleDragonConfig';
import BubbleDragonGameScene from '../Scenes/BubbleDragonGameScene';
import BaseBubble from './BaseBubble';
import BubbleItem from './BubbleItem';
import ShootBubbleFSM, { ShootBubbleEventId, ShootBubbleStateId } from './ShootBubbleFSM';

export default class ShootBubble extends BaseBubble {
  /** 填充位置偏移量 */
  private readonly chargeOffset: number = 100;
  /** 射擊泡泡狀態機 */
  private shootBubbleFSM: ShootBubbleFSM;
  /** 射擊角度 */
  private shootAngle: number = 0;
  /** 目標位置 */
  private targetPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  /** 裝彈中 */
  private isCharging: boolean = false;

  /** 是否可以執行碰撞
   * @returns boolean
   */
  public get canCollide(): boolean {
    return (
      this.shootBubbleFSM.isTransitioning === false && this.shootBubbleFSM.isCurrentState(ShootBubbleStateId.Shoot)
    );
  }

  /** 是否為閒置
   * @returns boolean
   */
  public get isIdle(): boolean {
    return this.shootBubbleFSM.isCurrentState(ShootBubbleStateId.Idle) && this.isCharging === false;
  }

  /** 是否為待發射
   * @returns boolean
   */
  public get isInCannon(): boolean {
    return this.shootBubbleFSM.isCurrentState(ShootBubbleStateId.InCannon);
  }

  constructor(scene: BubbleDragonGameScene) {
    super(scene);

    // 狀態機
    this.shootBubbleFSM = new ShootBubbleFSM(this);
    this.shootBubbleFSM.start();
  }

  update(time: number, delta: number) {
    this.shootBubbleFSM.update(time, delta);
  }

  /** 射擊泡泡初始化 */
  protected onInitial(): void {
    // 重複利用時清空道具資訊
    this.bubbleItem = undefined;
    // 設定狀態為閒置
    this.shootBubbleFSM.stateMachine.triggerEvent(ShootBubbleEventId.Idle);
    // 射擊泡泡圖片水平翻轉
    this.bubbleImage.setFlipX(true);
    // 開反彈
    this.body.setBounce(1, 1);
    this.body.setCollideWorldBounds(true);
  }

  /** 填充狀態
   * @param position 目標位置
   */
  public charge(position: Phaser.Math.Vector2): void {
    this.targetPosition = position;
    this.isCharging = true;
    this.shootBubbleFSM.stateMachine.triggerEvent(ShootBubbleEventId.Charge);
  }

  /** 待發射狀態 */
  public inCannon(): void {
    this.shootBubbleFSM.stateMachine.triggerEvent(ShootBubbleEventId.InCannon);
  }

  /** 射擊狀態
   * @param rotation 發射角度
   */
  public shoot(rotation: number): void {
    this.shootAngle = rotation;
    this.shootBubbleFSM.stateMachine.triggerEvent(ShootBubbleEventId.Shoot);
  }

  /** 死亡狀態 */
  public death(): void {
    this.shootBubbleFSM.stateMachine.triggerEvent(ShootBubbleEventId.Death);
  }

  /** 填充泡泡 */
  public async onChargeEnter(): Promise<void> {
    // 依照位置移動
    const move = this.scene.tweens.add({
      targets: this,
      x: this.targetPosition.x,
      y: this.targetPosition.y,
      duration: BubbleDragonNumber.CharegeSpeed,
    });

    await AsyncHelper.pendingUntil(() => move.totalProgress === 1);

    this.isCharging = false;
  }

  /** 泡泡射擊 */
  public onShootEnter(): void {
    const velocityX: number = BubbleDragonNumber.BubbleShootVelocity * Math.cos(this.shootAngle);
    const velocityY: number = BubbleDragonNumber.BubbleShootVelocity * Math.sin(this.shootAngle);
    this.body.setVelocity(velocityX, velocityY);
    this.shootAngle = 0;
  }

  /** 泡泡死亡 */
  public async onDeathEnter(): Promise<void> {
    // 先關閉顯示,下面停頓一偵會造成殘留
    this.visible = false;
    this.body.stop();
    // 等待一偵讓重力設為0,避免group重新get時殘留重力
    await AsyncHelper.pendingUntil(() => this.body.velocity.y === 0);
    this.body.enable = false;
    this.active = false;
  }

  /** 設置道具資料
   * @param itemData 道具泡泡
   */
  public setItemData(itemData: BubbleItem): void {
    this.bubbleItem = itemData;
    // 彩色泡泡走原本的變色
    if (this.bubbleItem.itemData.itemFunction === BubbleItemFunction.Rainbow) {
      this.changeColor(BubbleDragonNumber.RainbowBubble);
    } else {
      this.bubbleImage.setTexture(this.bubbleItem.itemData.bubbleImage);
    }
  }
}
