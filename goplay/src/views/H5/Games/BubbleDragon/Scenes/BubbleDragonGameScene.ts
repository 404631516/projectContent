import {
  BubbleDragonDepth,
  BubbleDragonNumber,
  BubbleDragonString,
  BubbleItemFunction,
} from '../Data/BubbleDragonConfig';
import UIManager from '../../../Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import BubbleDragonBackgroundDialog from '../Dialogs/BubbleDragonBackgroundDialog';
import BubbleDragonGuiDialog from '../Dialogs/BubbleDragonGuiDialog';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import { BubbleDragonGameData, BubbleDragonGameLog, ContestPlayerData, TotalProps } from '@/helper/interface/Game';
import MapBubble from '../Component/MapBubble';
import BubbleDragonFortDialog from '../Dialogs/BubbleDragonFortDialog';
import ShootBubble from '../Component/ShootBubble';
import { GameObject } from '@/views/H5/Scripts/Components/Tilemap/BaseTilemap';
import ShootBubblePool from '../Component/ShootBubblePool';
import MapBubblePool from '../Component/MapBubblePool';
import ItemDialog from '../../UIHelper/ItemDialog';
import BubbleItem from '../Component/BubbleItem';
import { Align } from '@/views/H5/Helper/MathHelper';
import TableManager, { BubbleDragonItemData, HeroData } from '@/manager/TableManager';
import { bubbleDragonImgUrl } from '../Data/BubbleDragonResource';
import InfoBox from '@/views/H5/Scripts/Components/InfoBox';
import BubbleDragonHero from '../Component/BubbleDragonHero';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType, CharacterType } from '@/helper/enum/PhaserGame';
import HeroManager from '@/manager/HeroManager';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import { GameType } from '@/helper/enum/Common';
import BubbleDragonForegroundDialog from '../Dialogs/BubbleDragonForegroundDialog';
import SoundPool from '../../Common/SoundPool';
import TimerDialog from '../../UIHelper/TimerDialog';

type OverlapGameobject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

export default class BubbleDragonGameScene extends BaseGameScene implements IAnswerGame {
  /** 遊戲狀態機 */
  private gameFSM!: AnswerGameFSM;
  //#region readonly
  /** 目標分數 */
  private readonly targetScore: number = 60;
  /** 道具Icon大小 */
  private readonly itemIconSize: number = 52;
  /** 道具列表位置X */
  private readonly itemDialogPositonX: number = 180;
  /** 道具列表位置距離底部的高度 */
  private readonly itemDialogPositonY: number = 30;
  /** 上方隱形牆位置 */
  private readonly topInvisibleWallPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(580, 67);
  /** 上方隱形牆寬度 */
  private readonly topInvisibleWallWidth: number = 900;
  /** 上方隱形牆高度 */
  private readonly topInvisibleWallHeight: number = 45;
  /** 下方隱形牆位置 */
  private readonly bottomInvisibleWallPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(605, 440);
  /** 下方隱形牆寬度 */
  private readonly bottomInvisibleWallWidth: number = 850;
  /** 下方隱形牆高度 */
  private readonly bottomInvisibleWallHeight: number = 45;
  /** 右方隱形牆位置 */
  private readonly rightInvisibleWallPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1038, 250);
  /** 右方隱形牆寬度 */
  private readonly rightInvisibleWallWidth: number = 30;
  /** 右方隱形牆高度 */
  private readonly rightInvisibleWallHeight: number = 435;
  /** 提示計時時間 */
  private readonly hintSecond: number = 30;
  //#endregion readonly

  //#region 主要變數、元件
  /** 英雄資料 */
  private heroData!: HeroData;
  /** 英雄物件 */
  private hero!: BubbleDragonHero;
  /** 射擊泡泡*/
  public shootBubble?: ShootBubble;
  /** 射擊泡泡物件池 */
  private shootBubblePool!: ShootBubblePool;
  /** 關卡泡泡物件池 */
  public mapBubblePool!: MapBubblePool;
  /** 道具資料 */
  private itemDataList!: BubbleDragonItemData[];
  /** 顯示輔助線 */
  public isShowSupportLine: boolean = false;
  /** 分數累計 */
  private scoreCount: number = 0;
  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;
  /** 是否動畫表演完畢 */
  private isFinishAnimation: boolean = true;
  /** 泡泡種類池 */
  public bubbleTypePool: number[] = [];
  /** 反彈音效 */
  private reflectionSound?: SoundPool;
  /** 射擊音效 */
  private shootSound?: SoundPool;
  /** 使用道具音效 */
  private useItemSound?: SoundPool;
  //#endregion

  //#region 一般變數、元件
  /** 背景 */
  private bgDialog!: BubbleDragonBackgroundDialog;
  /** 砲台 */
  private fortDialog!: BubbleDragonFortDialog;
  /** 前景 */
  private foregroundDialog!: BubbleDragonForegroundDialog;
  /** Gui */
  private guiDialog!: BubbleDragonGuiDialog;
  /** 道具介面 */
  private itemDialog!: ItemDialog<BubbleItem>;
  /** 提示的計時器 */
  private hintTimer!: TimerDialog;
  //#endregion

  //#region getter
  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    return this.mapBubblePool.isOverReviveLine || this.isReviveTime;
  }
  /** 判斷遊戲是否該結束 */
  public get isGameEnd(): boolean {
    return (this.mapBubblePool.isOverDeadLine || this.isTimeOut) && this.isFinishAnimation;
  }
  /** 判斷射擊泡泡是否準備好 */
  public get isPreparedShootBubble(): boolean {
    return this.shootBubble?.isInCannon ?? false;
  }
  /** 遊戲畫面寬度 */
  public get canvasWidth(): number {
    return this.game.canvas.width;
  }
  /** 遊戲畫面高度 */
  public get canvasHeight(): number {
    return this.game.canvas.height;
  }
  //#endregion getter

  //#region constructor、Phaser hook(不用加回傳值、屬性)
  constructor(private gameData: BubbleDragonGameData, private gameWeb: IAnswerWeb) {
    super({ key: 'BubbleDragonGameScene' });
    this.gameFSM = new AnswerGameFSM(this, gameWeb);
  }

  async preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);

    // 獲取英雄資料
    const heroData = HeroManager.getHeroData(this.gameData.heroListData.heroId);
    // 檢查資料並顯示錯誤
    if (heroData === undefined) {
      await InfoBox.defaultMessage([this], `英雄資料讀取失敗! 英雄ID: ${this.gameData.heroListData.heroId}`);
      this.scene.stop();
      return;
    }
    this.heroData = heroData;

    // 載入英雄閒置動畫圖
    AnimationHelper.loadCharacterSprite(this, heroData, CharacterType.Hero, CharacterAnimType.Idle);

    // 載入音效
    this.reflectionSound = new SoundPool(this, BubbleDragonString.SoundReflectionBubble);
    this.shootSound = new SoundPool(this, BubbleDragonString.SoundShootBubble);
    this.useItemSound = new SoundPool(this, BubbleDragonString.SoundSwitchItem);
    // 載入道具列表
    this.itemDataList = TableManager.bubbleDragonItem.getAll();
    // 載入道具圖片
    this.itemDataList.forEach((data) => {
      this.load.image(data.nameKey, `${bubbleDragonImgUrl}/${data.url}`);
    });
  }

  async create() {
    // 隨機選取泡泡種類
    const bubbleTotalTypePool: number[] = [];
    for (let i = 0; i < BubbleDragonNumber.BubbleTotalTypeCount; i++) {
      bubbleTotalTypePool.push(i);
    }
    this.bubbleTypePool = Phaser.Math.RND.shuffle(bubbleTotalTypePool);
    this.bubbleTypePool.splice(BubbleDragonNumber.BubbleUseTypeCount);

    // 生成關卡泡泡物件池
    this.mapBubblePool = new MapBubblePool(this);
    // 生成射擊泡泡物件池
    this.shootBubblePool = new ShootBubblePool(this);

    // 創建英雄閒置動畫
    AnimationHelper.createCharacterAnim(this, this.heroData, CharacterAnimType.Idle);
    // 生成英雄
    this.hero = new BubbleDragonHero(
      this,
      new Phaser.Math.Vector2(BubbleDragonNumber.HeroPositionX, BubbleDragonNumber.HeroPositionY),
      this.heroData
    );

    // 設置隱形牆
    this.setInvisibleWall();

    // 初始化Dialog
    await this.setDialog();

    // 關閉載入場景
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  /** 設置隱形牆 */
  private setInvisibleWall(): void {
    // 產生上下隱形牆壁
    const topInvisibleWall = this.add.rectangle(
      this.topInvisibleWallPosition.x,
      this.topInvisibleWallPosition.y,
      this.topInvisibleWallWidth,
      this.topInvisibleWallHeight,
      undefined,
      0
    );
    const bottomInvisibleWall = this.add.rectangle(
      this.bottomInvisibleWallPosition.x,
      this.bottomInvisibleWallPosition.y,
      this.bottomInvisibleWallWidth,
      this.bottomInvisibleWallHeight,
      undefined,
      0
    );
    const reboundWall = this.physics.add.staticGroup();
    reboundWall.add(topInvisibleWall);
    reboundWall.add(bottomInvisibleWall);

    // 產生右方隱形牆
    const rightInvisibleWall = this.add.rectangle(
      this.rightInvisibleWallPosition.x,
      this.rightInvisibleWallPosition.y,
      this.rightInvisibleWallWidth,
      this.rightInvisibleWallHeight,
      undefined,
      0
    );
    const borderWall = this.physics.add.staticGroup();
    borderWall.add(rightInvisibleWall);

    // 射擊物件池與牆壁產生碰撞
    this.physics.add.collider(this.shootBubblePool.group, reboundWall, this.onBubbleCollideWall.bind(this));

    // 射擊物件池與隱形牆產生碰撞
    this.physics.add.collider(
      this.shootBubblePool.group,
      borderWall,
      this.onBubbleCollideInvisibleWall.bind(this),
      this.onBubbleProcessInvisibleWall.bind(this)
    );

    // 射擊物件池與關卡物件池產生碰撞
    this.physics.add.overlap(
      this.shootBubblePool.group,
      this.mapBubblePool.group,
      this.onBubbleCollideMapBubble.bind(this),
      this.onBubbleProcessMapBubble.bind(this)
    );
  }

  /** 設置Dialog */
  private async setDialog(): Promise<void> {
    // 開啟背景
    this.bgDialog = UIManager.instance.openDialog(BubbleDragonBackgroundDialog, this);
    this.bgDialog.setDepth(BubbleDragonDepth.Bg);
    // 開啟Gui
    this.fortDialog = UIManager.instance.openDialog(BubbleDragonFortDialog, this);
    this.fortDialog.setDepth(BubbleDragonDepth.Gui);
    // 開啟Gui
    this.foregroundDialog = UIManager.instance.openDialog(BubbleDragonForegroundDialog, this);
    this.foregroundDialog.setDepth(BubbleDragonDepth.Foreground);
    // 開啟Gui
    this.guiDialog = UIManager.instance.openDialog(BubbleDragonGuiDialog, this);
    this.guiDialog.setDepth(BubbleDragonDepth.Gui);
    this.guiDialog.updateScoreCount(0, this.targetScore);
    // 開啟Gui
    this.hintTimer = UIManager.instance.openDialog(TimerDialog, this);
    this.hintTimer.setDepth(BubbleDragonDepth.Gui);
    this.hintTimer.setVisible(false);

    // 開啟道具介面
    this.itemDialog = UIManager.instance.openDialog<ItemDialog<BubbleItem>>(ItemDialog, this);
    this.itemDialog.setDepth(BubbleDragonDepth.Gui);
    this.itemDialog.init(
      this.itemDataList,
      { width: this.itemIconSize, height: this.itemIconSize },
      new Phaser.Math.Vector2(this.itemDialogPositonX, this.itemDialog.height - this.itemDialogPositonY),
      Align.LeftCenter
    );
    await this.itemDialog.addItems(this.gameData.totalProps, BubbleItem, this.useItem.bind(this));
  }

  fixedUpdate(time: number, delta: number) {
    this.gameFSM.update(delta);
    this.hero.update(time, delta);
  }
  //#endregion constructor、Phaser hook

  //#region 狀態機
  /** 遊戲開場 */
  public async onOpeningEnter(): Promise<void> {
    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();
    // 填充射擊泡泡
    this.shootBubble = await this.shootBubblePool.chargeShootBubble();
    // 顯示瞄準線
    this.fortDialog.drawBaseSupportLine();
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 初始化提示計時器
    this.initHintTimer();
    // 開啟Timer計時
    this.setTimerDialog(180, BubbleDragonDepth.Gui);
    // 設置Timer事件
    this.setTimerEvent(
      // 時間到，遊戲結束
      () => {
        this.isTimeOut = true;
      },

      // 剩餘30秒強制續命
      new Map([[30, () => (this.isReviveTime = true)]])
    );
  }

  /**
   * @param delta 每一幀的間隔
   */
  public onGameUpdate(delta: number): void {
    //
  }

  /** 當觸發續命 */
  public async onReviveEnter(): Promise<void> {
    // 暫停背景音樂
    this.bgm?.pause();
    // 所有場景暫停
    this.pauseScene();
  }

  /** 續命完成
   * @param rewardProp
   */
  public async onReviveEnd(rewardProp: TotalProps[]): Promise<void> {
    // 將道具加到itemDialog
    await this.itemDialog.addItems(rewardProp, BubbleItem, this.useItem.bind(this));
    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();
    // 繼續背景音樂
    this.bgm?.resume();
    // 所有場景繼續
    this.resumeScene();
  }

  /** 結束遊戲 */
  public onEndingEnter(): ContestPlayerData {
    // 設定泡泡龍結算資料
    const gameLog: BubbleDragonGameLog = {
      gameScore: this.scoreCount,
      gameMode: GameType.WebBubbleDragon,
      browser: navigator.userAgent,
      bubbleCount: this.mapBubblePool.removeTotalBubbleCount,
    };
    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: this.mapBubblePool.removeTotalBubbleCount >= this.targetScore,
      webGameLog: gameLog,
    };
  }
  //#endregion 狀態機

  //#region 遊戲相關(邏輯、表演等)
  /** 射擊泡泡和上下隱形牆碰撞
   *  @param shootBubbleObject 射擊泡泡
   *  @param wallObject 隱形牆物件
   */
  private onBubbleCollideWall(shootBubbleObject: OverlapGameobject, wallObject: OverlapGameobject): void {
    this.reflectionSound?.play();
  }

  /** 射擊泡泡和隱形牆碰撞前檢查
   *  @param shootBubbleObject 射擊泡泡
   *  @param invisibleWallObject 隱形牆物件
   */
  private onBubbleProcessInvisibleWall(
    shootBubbleObject: OverlapGameobject,
    invisibleWallObject: OverlapGameobject
  ): boolean {
    // 轉換型態
    const shootBubble = shootBubbleObject as ShootBubble;
    return shootBubble.canCollide;
  }

  /** 射擊泡泡和隱形牆碰撞後流程
   *  @param shootBubbleObject 射擊泡泡
   *  @param invisibleWallObject 隱形牆物件
   */
  private async onBubbleCollideInvisibleWall(
    shootBubbleObject: OverlapGameobject,
    invisibleWallObject: OverlapGameobject
  ): Promise<void> {
    // 轉換型態
    const shootBubble = shootBubbleObject as ShootBubble;

    // 播放音效
    this.reflectionSound?.play();
    // 移除射擊泡泡
    shootBubble.death();

    // 穿甲泡泡碰到隱形牆
    if (shootBubble.bubbleItem?.itemData.itemFunction === BubbleItemFunction.Penetrate) {
      // 處理穿甲泡泡
      this.mapBubblePool.processPenetrateBubble();
    }
    // 一般泡泡
    else {
      // 把射擊泡泡加入關卡池
      this.mapBubblePool.processBubbleWithWall(shootBubble);
    }

    // 生成射擊泡泡
    this.shootBubble = await this.shootBubblePool.chargeShootBubble();

    // 射擊泡泡碰撞後處理
    this.onAfterShootBubbleCollide();
  }

  /** 射擊泡泡和關卡泡泡碰撞前檢查
   * @param shootBubbleObject 射擊泡泡
   * @param mapBubbleObject 關卡泡泡
   */
  private onBubbleProcessMapBubble(shootBubbleObject: OverlapGameobject, mapBubbleObject: OverlapGameobject): boolean {
    // 轉換型態
    const shootBubble = shootBubbleObject as ShootBubble;
    const mapBubble = mapBubbleObject as MapBubble;
    return shootBubble.canCollide && mapBubble.canProcess;
  }

  /** 射擊泡泡和關卡泡泡碰撞後流程
   * @param shootBubbleObject 射擊泡泡
   * @param mapBubbleObject 關卡泡泡
   */
  private async onBubbleCollideMapBubble(
    shootBubbleObject: OverlapGameobject,
    mapBubbleObject: OverlapGameobject
  ): Promise<void> {
    // 替換型態
    const shootBubble = shootBubbleObject as ShootBubble;
    const mapBubble = mapBubbleObject as MapBubble;

    // 穿甲泡泡
    if (shootBubble.bubbleItem?.itemData.itemFunction === BubbleItemFunction.Penetrate) {
      mapBubble.death();
      // 抓到撞到的關卡泡泡位置
      this.mapBubblePool.onRemoveBubble();
    }
    // 一般泡泡
    else {
      // 播放音效
      this.reflectionSound?.play();
      // 移除射擊泡泡
      shootBubble.death();

      // 抓到撞到的關卡泡泡位置
      await this.mapBubblePool.processBubbleWithBubble(shootBubble, mapBubble);
      // 生成射擊泡泡
      this.shootBubble = await this.shootBubblePool.chargeShootBubble();
      // 射擊泡泡碰撞後處理
      this.onAfterShootBubbleCollide();
    }
  }

  /** 射擊泡泡碰撞後處理 */
  private onAfterShootBubbleCollide(): void {
    // 更新分數
    this.updateGameScore(this.mapBubblePool.removeTotalBubbleCount);
    // 畫輔助線
    this.fortDialog.drawBaseSupportLine();
    // 整個動畫跑完
    this.isFinishAnimation = true;
  }

  /** 發射泡泡
   *  @param radians 弧度
   */
  public shoot(radians: number): void {
    // 防呆
    if (this.shootBubble === undefined) {
      return;
    }

    // 提示計時器重置時間
    this.hintTimer.startCountdown(this.hintSecond);
    this.isFinishAnimation = false;

    // 播放音效
    this.shootSound?.play();
    // 射擊
    this.shootBubble.shoot(radians);
    // 關閉道具藍框
    this.itemDialog.setAllHighlight(false);
    // 關閉瞄準鏡
    this.fortDialog.showScope(false);
    // 關閉輔助線
    this.isShowSupportLine = false;
  }

  /** 使用道具
   * @param item 道具
   */
  private useItem(item: BubbleItem): void {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false) {
      return;
    }

    // 不在待發射狀態不能使用道具
    if (this.shootBubble == null || this.shootBubble.isInCannon === false) {
      return;
    }

    switch (item.itemData.itemFunction) {
      case BubbleItemFunction.Track:
        this.useItemTrack(item);
        break;
      case BubbleItemFunction.Rainbow:
      case BubbleItemFunction.BombLv1:
      case BubbleItemFunction.BombLv2:
      case BubbleItemFunction.Penetrate:
        // 已使用道具泡泡
        if (this.shootBubble.bubbleItem) {
          return;
        }
        this.useItemBubble(this.shootBubble, item);
        break;
    }
  }

  /** 使用道具
   * @param item 道具
   */
  private useItemTrack(item: BubbleItem): void {
    // 正在使用中
    if (this.isShowSupportLine) {
      return;
    }
    // 播放音效
    this.useItemSound?.play();
    // 打開highlight
    item.setHighlight(true);
    // 道具數量-1
    item.useItem();
    // 顯示瞄準鏡
    this.fortDialog.showScope(true);
    // 按的瞬間要顯示軌跡
    this.isShowSupportLine = true;
    // 顯示輔助線
    this.fortDialog.drawSupportLine();
  }

  /** 使用道具
   * @param shootBubble 射擊泡泡
   * @param item 道具
   */
  private useItemBubble(shootBubble: ShootBubble, item: BubbleItem): void {
    // 播放音效
    this.useItemSound?.play();
    // 設定道具到射擊泡泡
    shootBubble.setItemData(item);
    // 打開highlight
    item.setHighlight(true);
    // 道具數量-1
    item.useItem();
  }

  /** 更新分數
   * @param score 分數
   */
  private updateGameScore(score: number): void {
    this.scoreCount = Math.max(score, 0);

    // 更新分數顯示
    this.guiDialog.updateScoreCount(this.scoreCount, this.targetScore);
  }

  /** 初始化提示計時器 */
  private initHintTimer(): void {
    this.hintTimer.setEvent(() => {
      if (this.mapBubblePool.isOverHintLine === false) {
        this.fortDialog.hintGroup.setVisible(true);
      }
    }, new Map());
    this.hintTimer.startCountdown(this.hintSecond);
  }
  //#endregion
}
