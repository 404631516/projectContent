import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { BubbleDragonDepth, BubbleDragonNumber, BubbleDragonString } from '../Data/BubbleDragonConfig';
import BubbleDragonGameScene from '../Scenes/BubbleDragonGameScene';
import BubbleItem from './BubbleItem';

export default abstract class BaseBubble extends Object2D {
  /** 物理碰撞身體 */
  public declare body: Phaser.Physics.Arcade.Body;
  /** 泡泡顏色池 */
  private colorPool: number[] = [];
  /** 道具資料 */
  public bubbleItem?: BubbleItem;
  /** 一般泡泡圖片 */
  protected bubbleImage: Phaser.GameObjects.Sprite = this.addSprite(BubbleDragonString.Bubble, 0, 0);

  /** 泡泡顏色 */
  private _bubbleColor: number = 0;
  /** 泡泡顏色 */
  public get bubbleColor(): number {
    return this._bubbleColor;
  }

  /** 泡泡標籤 */
  private _bubbleKey: string = '';
  /** 泡泡標籤 */
  public get bubbleKey(): string {
    return this._bubbleKey;
  }

  /** 取得隨機顏色 */
  private get randomColor(): number {
    return this.colorPool[Phaser.Math.Between(0, this.colorPool.length - 1)];
  }

  constructor(scene: BubbleDragonGameScene) {
    super(scene);
    // 取得顏色池
    this.colorPool = scene.bubbleTypePool;
    this.setSize(BubbleDragonNumber.BubbleWidth, BubbleDragonNumber.BubbleHeight);
  }

  /** 繼承物件初始化 */
  protected abstract onInitial(): void;

  /** 初始化泡泡
   * @param locationX 位置座標X
   * @param locationY 位置座標Y
   * @param bubbleKey 泡泡標籤
   */
  public initialBaseBubble(locationX: number, locationY: number, bubbleKey: string): void {
    this.initialColorBubble(locationX, locationY, bubbleKey, this.randomColor);
  }

  /** 初始化指定顏色泡泡
   * @param locationX 位置座標X
   * @param locationY 位置座標Y
   * @param bubbleKey 泡泡標籤
   * @param bubbleColor 泡泡顏色
   */
  public initialColorBubble(locationX: number, locationY: number, bubbleKey: string, bubbleColor: number): void {
    this.initialBubbleSetting(locationX, locationY, bubbleKey);
    // 換回泡泡圖片
    this.bubbleImage.setTexture(BubbleDragonString.Bubble);
    this.changeColor(bubbleColor);
  }

  /** 初始化指定圖片泡泡
   * @param locationX 位置座標X
   * @param locationY 位置座標Y
   * @param bubbleKey 泡泡標籤
   * @param bubbleItem 泡泡道具資料
   */
  public initialItemBubble(locationX: number, locationY: number, bubbleKey: string, bubbleItem: BubbleItem) {
    this.initialBubbleSetting(locationX, locationY, bubbleKey);
    this.bubbleItem = bubbleItem;
    this.bubbleImage.setTexture(this.bubbleItem.itemData.bubbleImage);
  }

  /** 初始化泡泡設定
   * @param locationX 位置座標X
   * @param locationY 位置座標Y
   * @param bubbleKey 泡泡標籤
   */
  private initialBubbleSetting(locationX: number, locationY: number, bubbleKey: string): void {
    this.x = locationX;
    this.y = locationY;
    this._bubbleKey = bubbleKey;
    this.setDepth(BubbleDragonDepth.Game);
    this.setVisible(true);
    this.setActive(true);
    this.body.enable = true;
    this.body.setCircle(BubbleDragonNumber.BubbleRadius);
    this.onInitial();
  }

  /** 替換泡泡標籤
   *  @param bubbleKey 泡泡標籤
   */
  public changeBubbleKey(bubbleKey: string): void {
    this._bubbleKey = bubbleKey;
  }

  /** 替換泡泡顏色
   * @param color 顏色
   */
  public changeColor(color: number): void {
    this._bubbleColor = color;
    this.bubbleImage = this.bubbleImage.setFrame(color);
  }
}
