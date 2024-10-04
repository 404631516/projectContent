import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import PhaserHelper from '@/views/H5/Helper/PhaserHelper';
import { BubbleDragonNumber, BubbleDragonString } from '../Data/BubbleDragonConfig';
import BubbleDragonGameScene from '../Scenes/BubbleDragonGameScene';
import BaseBubble from './BaseBubble';
import MapBubbleFSM, { MapBubbleEventId, MapBubbleStateId } from './MapBubbleFSM';

export default class MapBubble extends BaseBubble {
  /** 消失特效縮放比例 */
  private readonly removeFXScale: number = 0.6;
  /** 狀態機 */
  private mapBubbleFSM: MapBubbleFSM;
  /** 移動的目標位置 */
  private targetPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  /** 消失特效 */
  private removeFX!: Phaser.GameObjects.Sprite;

  /** 判斷是否可處理
   * @returns boolean
   */
  public get canProcess(): boolean {
    return this.mapBubbleFSM.isTransitioning === false && this.mapBubbleFSM.isCurrentState(MapBubbleStateId.Idle);
  }

  constructor(scene: BubbleDragonGameScene) {
    super(scene);

    // 狀態機
    this.mapBubbleFSM = new MapBubbleFSM(this);
    this.mapBubbleFSM.start();

    // 增加消失特效
    this.removeFX = this.addSprite(BubbleDragonString.BubbleRemoveFX, 0, 0);
    this.removeFX.setScale(this.removeFXScale);
  }

  update(time: number, delta: number) {
    this.mapBubbleFSM.update(time, delta);
  }

  /** 關卡泡泡初始化 */
  protected onInitial(): void {
    this.body.setImmovable(true);
    // 隱藏消失特效
    this.removeFX.setVisible(false);
    this.mapBubbleFSM.stateMachine.triggerEvent(MapBubbleEventId.Idle);
  }

  /** 移動狀態 */
  public move(position: Phaser.Math.Vector2): void {
    this.targetPosition = position;
    this.mapBubbleFSM.stateMachine.triggerEvent(MapBubbleEventId.Move);
  }

  /** 掉落狀態 */
  public fall(): void {
    this.mapBubbleFSM.stateMachine.triggerEvent(MapBubbleEventId.Fall);
  }

  /** 死亡狀態 */
  public death(): void {
    // 關閉一般圖片,顯示被擊圖片
    if (this.bubbleItem !== undefined) {
      this.bubbleImage.setTexture(this.bubbleItem.itemData.bubbleImage);
    } else {
      this.bubbleImage.setTexture(BubbleDragonString.BubbleDamage, this.bubbleColor);
    }
    this.mapBubbleFSM.stateMachine.triggerEvent(MapBubbleEventId.Death);
  }

  /** 泡泡生成位移 */
  public async onMoveEnter(): Promise<void> {
    const move = this.scene.tweens.add({
      targets: this,
      x: this.targetPosition.x,
      y: this.targetPosition.y,
      duration: BubbleDragonNumber.GenerateMoveSpeed,
    });

    await AsyncHelper.pendingUntil(() => move.totalProgress === 1);
  }

  /** 泡泡掉落位移 */
  public async onFallEnter(): Promise<void> {
    this.body.setGravityY(PhaserHelper.gravity);
  }

  /** 泡泡死亡消除 */
  public async onDeathEnter(): Promise<void> {
    // 清空道具
    this.bubbleItem = undefined;
    // 開啟消失特效
    this.removeFX.setVisible(true);
    this.removeFX.anims.play(BubbleDragonString.AnimBubbleRemove);
    // 等待消失特效播放完畢
    await AsyncHelper.pendingUntil(() => this.removeFX.anims.isPlaying === false);
    // 關閉可見度
    this.visible = false;
    this.body.stop();
    this.body.setGravityY(0);
    // 等待一偵讓重力設為0,避免group重新get時殘留重力
    await AsyncHelper.pendingUntil(() => this.body.gravity.y === 0);
    this.body.enable = false;
    this.active = false;
  }
}
