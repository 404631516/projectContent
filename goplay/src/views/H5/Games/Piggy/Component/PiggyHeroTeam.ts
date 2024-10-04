import { BattleTeam } from '@/views/H5/Scripts/Components/Combat/Battle/BattleTeam';
import PiggyGameScene from '../Scenes/PiggyGameScene';
import PiggyHero from './PiggyHero';
import { PiggyHeroTeamFSM } from './PiggyHeroTeamFSM';
import { throttle } from 'throttle-debounce';
import { PiggyNumber, PiggyString } from '../Data/PiggyConfig';
import { CompassRad, clamp } from '@/views/H5/Helper/MathHelper';
import PiggyItem from './PiggyItem';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { Size } from '@/views/H5/Helper/PhaserHelper';

/** 英雄隊伍 */
export class PiggyHeroTeam extends BattleTeam<PiggyHero> {
  /** 逆塔防遊戲場景 */
  public declare scene: PiggyGameScene;

  /** 隊伍初始移動速度 */
  private readonly originalTeamMoveSpeed: number = 500;
  /** 攻擊延遲 */
  private readonly attackDelay: number = 400;

  /** 移動鈕透明度 */
  private readonly iconBgAlpha: number = 0.8;
  /** 移動鈕背景位置 */
  private readonly iconBgPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-75, -5);
  /** 移動鈕背景大小 */
  private readonly iconBgSize: Size = { width: 30, height: 55 };
  /** 方向鈕X */
  private readonly directionIconX: number = -60;
  /** 上方向鈕Y */
  private readonly upIconY: number = 10;
  /** 下方向鈕Y */
  private readonly downIconY: number = 35;
  /** 方向鈕大小 */
  private readonly iconSize: number = 26;
  /** 移動平台Y位置 */
  private readonly platformY: number = 22;
  /** 移動平台Y調整量 */
  private readonly platformAdjust: number = 5;
  /** 基礎高度scale */
  private readonly baseHeightScale: number = 0.6;

  /** 預設道具id */
  public readonly defaultItemId: number = 3130021;
  /** 上方按鈕遮罩 */
  private upIconMask!: Phaser.GameObjects.Graphics;
  /** 下方按鈕遮罩 */
  private downIconMask!: Phaser.GameObjects.Graphics;
  /** 方向按鈕 */
  private directionIcon!: Object2D;
  /** 是否在拖動 */
  private onDrag: boolean = false;

  protected fsm: PiggyHeroTeamFSM = new PiggyHeroTeamFSM(this);

  /** 當前使用道具id */
  private currentItemId: number = this.defaultItemId;
  /** 隊伍移動速度 */
  private teamMoveSpeed: number = this.originalTeamMoveSpeed;
  /** 鍵盤操控 */
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  /** 強制攻擊延遲 */
  public delayDetectAttack = throttle(this.attackDelay, this.useAttackItem, { noLeading: false, noTrailing: true });

  constructor(scene: PiggyGameScene, x: number, y: number) {
    super(scene, x, y);
    this.cursorKeys = this.scene.input.keyboard!.createCursorKeys();
  }

  /** 初始化隊伍 */
  public initTeam(): void {
    // 英雄搭乘平台
    this.leader.addImage(
      PiggyString.HeroPlatform,
      0,
      this.platformY + this.platformAdjust * (this.leader.heightScale - this.baseHeightScale)
    );

    // 方向按鈕
    this.directionIcon = new Object2D(this.scene, 0, 0);
    this.leader.add(this.directionIcon);

    // 移動icon背景
    const iconBg = this.directionIcon.addGraphics(0, 0);
    iconBg.fillStyle(PiggyNumber.IconBgColor, this.iconBgAlpha);
    iconBg.fillRect(this.iconBgPosition.x, this.iconBgPosition.y, this.iconBgSize.width, this.iconBgSize.height);

    // 移動icon
    this.directionIcon.addImage(PiggyString.UpKeyIcon, this.directionIconX, this.upIconY);
    this.directionIcon.addImage(PiggyString.DownKeyIcon, this.directionIconX, this.downIconY);

    // 上按鈕遮罩
    this.upIconMask = this.directionIcon.addGraphics(0, 0);
    this.upIconMask.fillStyle(PiggyNumber.IconBgColor, PiggyNumber.IconAlpha);
    this.upIconMask.fillRect(this.iconBgPosition.x, this.iconBgPosition.y, this.iconSize, this.iconSize);
    this.upIconMask.setVisible(false);

    // 下按鈕遮罩
    this.downIconMask = this.directionIcon.addGraphics(0, 0);
    this.downIconMask.fillStyle(PiggyNumber.IconBgColor, PiggyNumber.IconAlpha);
    this.downIconMask.fillRect(this.iconBgPosition.x, this.downIconY - this.iconSize / 2, this.iconSize, this.iconSize);
    this.downIconMask.setVisible(false);

    // 控制轉向
    this.leader.forwardRotation = CompassRad.Right;

    // 設定發射
    this.leader.on(Phaser.Input.Events.POINTER_UP, this.delayDetectAttack, this);

    // 設定滑鼠拖曳
    this.leader.on(Phaser.Input.Events.DRAG_START, () => (this.onDrag = true), this);
    this.leader.on(Phaser.Input.Events.DRAG, (pointer: Phaser.Input.Pointer) => this.onMove(pointer.y), this);
    this.leader.on(Phaser.Input.Events.DRAG_END, () => (this.onDrag = false), this);
  }

  /** 英雄使用攻擊道具 */
  private useAttackItem(): void {
    const item = this.scene.getItemData(this.currentItemId);
    if (item === undefined) {
      return;
    }
    // 使用道具
    this.leader.useItem(item);

    // 非普攻扣道具數量
    if (this.currentItemId !== this.defaultItemId) {
      // 取得道具按鈕
      const itemUI = this.scene.bulletItemDialog.getItem(this.currentItemId) as PiggyItem;
      if (itemUI === undefined) {
        console.log(`找不到道具UI,id=${this.currentItemId}`);
        return;
      }

      // 扣道具數量
      itemUI.useItem();

      // 剩一個用完自動取消
      if (itemUI.itemCount <= 0) {
        itemUI.unequipBullet();
        this.currentItemId = this.defaultItemId;
      }
    }
  }

  /** 移動角色
   * @param newPosY
   */
  private onMove(newPosY: number): void {
    this.leader.y = clamp(newPosY, this.scene.worldBottomEdgeY - 70, this.scene.worldTopEdgeY);
  }

  /** 當戰鬥單位死亡
   * @param unit
   */
  public onUnitDie(unit: PiggyHero): void {
    if (this.leader.isAlive === false) {
      this.dead();
    }
  }

  /** 替換綁定道具
   *  @param itemId 道具編號
   */
  public changeItem(itemId: number): void {
    this.currentItemId = itemId;
  }

  /** 進入閒置狀態 */
  public onIdleEnter(): void {
    this.stopTeam();
  }

  /** 進入移動狀態 */
  public onMoveEnter(): void {
    this.leader.setInteractive({ draggable: true, useHandCursor: true });
  }

  /** 更新隊伍
   * @param time 時間
   * @param delta 每幀間隔
   */
  public onMoveUpdate(time: number, delta: number): void {
    // 更新操作顯示
    this.downIconMask.setVisible(this.cursorKeys.down.isDown || this.onDrag);
    this.upIconMask.setVisible(this.cursorKeys.up.isDown || this.onDrag);

    // 按下按鍵下
    if (this.cursorKeys.down.isDown) {
      this.onMove(this.leader.y + this.teamMoveSpeed * (delta / 1000));
    }
    // 按下按鍵上
    else if (this.cursorKeys.up.isDown) {
      this.onMove(this.leader.y - this.teamMoveSpeed * (delta / 1000));
    }

    // 按下空白鍵or左半邊螢幕
    if (
      this.cursorKeys.space.isDown ||
      (this.scene.input.activePointer.isDown &&
        this.scene.input.activePointer.position.x > (this.scene.worldLeftEdgeX + this.scene.worldRightEdgeX) / 2 &&
        this.scene.input.activePointer.position.y < this.scene.worldBottomEdgeY)
    ) {
      this.delayDetectAttack();
    }
  }

  /** 離開移動狀態 */
  public onMoveLeave(): void {
    this.leader.disableInteractive();
  }

  /** 當隊伍死亡 */
  public onDeadEnter(): void {
    this.stopTeam();
  }

  /** 當隊伍重整 */
  public onSortTeamOrder(): void {
    return;
  }
}
