import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import SoundPool from '../../Common/SoundPool';
import { BubbleDragonNumber, BubbleDragonString } from '../Data/BubbleDragonConfig';
import BubbleDragonGameScene from '../Scenes/BubbleDragonGameScene';
import ShootBubble from './ShootBubble';

export default class ShootBubblePool {
  /** 預備泡泡數 */
  private readonly prepareBubbleCount: number = 3;
  /** 預備泡泡位置數 */
  private readonly prepareBubblePositionCount: number = this.prepareBubbleCount + 1;
  /** 當前場景 */
  private scene: BubbleDragonGameScene;
  /** 泡泡物件池 */
  private _group!: Phaser.Physics.Arcade.Group;
  /** 射擊泡泡位置 */
  private _shootBubblePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    BubbleDragonNumber.ShootedBasePositionX,
    BubbleDragonNumber.ShootedBasePositionY
  );
  /** 預備泡泡位置 */
  private prepareBubblePosition: Phaser.Math.Vector2[] = [];
  /** 預備泡泡 */
  private prepareBubbleList: ShootBubble[] = [];
  /** 裝填音效 */
  private chargeSound: SoundPool;

  /** 泡泡物件池 */
  public get group(): Phaser.Physics.Arcade.Group {
    return this._group;
  }
  /** 射擊泡泡位置 */
  public get shootBubblePosition(): Phaser.Math.Vector2 {
    return this._shootBubblePosition;
  }

  constructor(scene: BubbleDragonGameScene) {
    this.scene = scene;
    this._group = this.scene.physics.add.group({
      defaultKey: 'shootBubble',
      maxSize: 200,
      classType: ShootBubble,
      runChildUpdate: true,
    });

    // 加入音效
    this.chargeSound = new SoundPool(this.scene, BubbleDragonString.SoundCharge);
    // 儲存預備球位置
    for (let i = 0; i < this.prepareBubblePositionCount; i++) {
      this.prepareBubblePosition.push(
        new Phaser.Math.Vector2(
          BubbleDragonNumber.PrepareBubblePositionX - i * BubbleDragonNumber.BubbleWidth,
          BubbleDragonNumber.PrepareBubblePositionY
        )
      );
    }

    // 生成預備泡泡
    for (let i = 0; i < this.prepareBubbleCount; i++) {
      this.generatePrepareBubble(
        new Phaser.Math.Vector2(this.prepareBubblePosition[i].x, this.prepareBubblePosition[i].y)
      );
    }
  }

  /** 生成預備泡泡
   * @param position 位置
   */
  private generatePrepareBubble(position: Phaser.Math.Vector2): void {
    // 從物件池取出
    const shootBubble = this._group.get(position.x, position.y) as ShootBubble;
    // 初始化泡泡
    shootBubble.initialBaseBubble(position.x, position.y, BubbleDragonString.ShootBubble);
    // 塞進預備泡泡隊列
    this.prepareBubbleList.push(shootBubble);
  }

  /** 設定射擊泡泡位置
   * @param position 位置
   */
  public setShootBubblePosition(position: Phaser.Math.Vector2): void {
    this._shootBubblePosition = position;
  }

  /** 填充射擊泡泡 */
  public async chargeShootBubble(): Promise<ShootBubble | undefined> {
    // 新增一顆
    this.generatePrepareBubble(
      new Phaser.Math.Vector2(
        this.prepareBubblePosition[this.prepareBubblePosition.length - 1].x,
        this.prepareBubblePosition[this.prepareBubblePosition.length - 1].y
      )
    );

    // 等到新增完成
    await AsyncHelper.pendingUntil(() => this.prepareBubbleList.every((bubble) => bubble.isIdle));

    // 播動畫
    for (let i = 0; i < this.prepareBubbleList.length; i++) {
      this.prepareBubbleList[i].charge(
        i === 0
          ? this._shootBubblePosition
          : new Phaser.Math.Vector2(this.prepareBubblePosition[i - 1].x, this.prepareBubblePosition[i - 1].y)
      );
    }

    // 播放音效
    this.chargeSound.play();
    // 等到填充完畢
    await AsyncHelper.pendingUntil(() => this.prepareBubbleList.every((bubble) => bubble.isIdle));

    // 刪除第一顆
    const newShootBubble = this.prepareBubbleList.shift();
    newShootBubble?.inCannon();
    return newShootBubble;
  }

  //#region 保留功能
  /** 射擊泡泡替換預備泡泡
   * @param currentShootBubble 現在的射擊泡泡
   * @returns 返回預備泡泡
   */
  public changeShootBubble(currentShootBubble: ShootBubble): ShootBubble {
    // 取出第一顆
    const shootBubble = this.prepareBubbleList[0];
    const position = new Phaser.Math.Vector2(shootBubble.x, shootBubble.y);
    // 替換位置
    shootBubble.x = currentShootBubble.x;
    shootBubble.y = currentShootBubble.y;

    currentShootBubble.x = position.x;
    currentShootBubble.y = position.y;
    this.prepareBubbleList[0] = currentShootBubble;
    return shootBubble;
  }
  //#endregion
}
