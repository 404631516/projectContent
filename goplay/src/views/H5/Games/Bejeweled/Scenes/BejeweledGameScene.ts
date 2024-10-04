import UIManager from '@/views/H5/Scripts/Manager/UIManager';
import SoundPool from '../../Common/SoundPool';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import { BejeweledDepth, BejeweledNumber, BejeweledString } from '../Data/BejeweledConfig';
import TableManager, { BejeweledBombData } from '@/manager/TableManager';
import BejeweledGemsDialog from '../Dialogs/BejeweledGemsDialog';
import BejeweledInfoDialog from '../Dialogs/BejeweledInfoDialog';
import { GemsManager } from '../Components/GemsManager';
import BejeweledBaseDialog from '../Dialogs/BejeweledBaseDialog';
import { BejeweledGameLog, TotalProps, ContestPlayerData, BejeweledGameData } from '@/helper/interface/Game';
import { GameType } from '@/helper/enum/Common';
import bossImgPath from '@/config/imgPath/_boss';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import { Align, clamp } from '@/views/H5/Helper/MathHelper';
import ItemDialog from '../../UIHelper/ItemDialog';
import BejeweledItem from '../Components/BejeweledItem';
import { bejeweledImgUrl } from '../Data/BejeweledResourceData';

/** 遊戲場景 */
export default class BejeweledGameScene extends BaseGameScene implements IAnswerGame {
  /** singleton */
  private static _instance: BejeweledGameScene;
  public static get instance(): BejeweledGameScene {
    return this._instance;
  }

  /** 遊戲狀態機 */
  private gameFSM!: AnswerGameFSM;

  /** 當前選擇的炸彈 */
  public currentItem?: BejeweledItem;
  //#region 內部變數
  /** 遊戲剩餘能量值 */
  private currentEnergy: number = 0;
  /** 目前消除寶石數量 */
  private currentGems: number = 0;
  /** 消除寶石目標數量 */
  private targetGems: number = 0;
  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 每秒update計時 */
  private secondTimer: number = 0;
  /** 每秒扣除能量的因素 */
  private minusFactor: number = 0;
  /** 道具資料 */
  private itemDataList!: BejeweledBombData[];

  /** 音效 */
  private destroyGemsSoundPool?: SoundPool;

  /** 寶石manager */
  private gemsManager: GemsManager = new GemsManager(this);

  /** 遊戲是否已結束 */
  public get isGameEnd(): boolean {
    return this.currentEnergy <= 0 || this.isTimeOut;
  }
  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    return this.currentEnergy <= BejeweledNumber.ReviveEnergy || this.isReviveTime;
  }
  //#endregion

  //#region UIDialog
  /** 背景Dialog */
  private baseDialog!: BejeweledBaseDialog;
  /** 左側寶石顯示、表演Dialog */
  public gemsDialog!: BejeweledGemsDialog;
  /** infoDialog, 魔力、提示、英雄等資訊 */
  public infoDialog!: BejeweledInfoDialog;
  /** 道具介面 */
  private itemDialog!: ItemDialog<BejeweledItem>;
  //#endregion

  constructor(private gameData: BejeweledGameData, private gameWeb: IAnswerWeb) {
    super({ key: 'BejeweledGameScene' });
    BejeweledGameScene._instance = this;
    this.gameFSM = new AnswerGameFSM(this, gameWeb);
  }

  preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);

    // 載入魔王圖片資源
    const bossTableData = TableManager.boss.findOne(this.gameData.bossId);
    if (bossTableData) {
      this.load.image(bossTableData.bossNameKey, `${bossImgPath.bossBaseUrl}${bossTableData.imgUrl}.png?v=1`);
    }

    // 設定音效
    this.destroyGemsSoundPool = new SoundPool(this, BejeweledString.DestroyGemsSound);

    // 載入靜態表
    this.itemDataList = TableManager.bejeweledBomb.getAll();
    // 載入道具圖片
    this.itemDataList.forEach((data) => {
      this.load.image(data.nameKey, `${bejeweledImgUrl}/shop/${data.url}`);
    });
  }

  async create() {
    // open dialogs
    this.baseDialog = UIManager.instance.openDialog(BejeweledBaseDialog, this, false);
    this.baseDialog.setDepth(BejeweledDepth.Background);
    this.gemsDialog = UIManager.instance.openDialog(BejeweledGemsDialog, this, false);
    this.gemsDialog.setDepth(BejeweledDepth.UI);
    this.infoDialog = UIManager.instance.openDialog(BejeweledInfoDialog, this, false);
    this.infoDialog.setDepth(BejeweledDepth.UI);
    this.itemDialog = UIManager.instance.openDialog<ItemDialog<BejeweledItem>>(ItemDialog, this);
    this.itemDialog.setDepth(BejeweledDepth.UI);
    this.itemDialog.init(
      this.itemDataList,
      { width: BejeweledNumber.BombSize, height: BejeweledNumber.BombSize },
      new Phaser.Math.Vector2(this.game.canvas.width * 0.74, this.game.canvas.height * 0.86),
      Align.Center
    );
    await this.itemDialog.addItems(this.gameData.totalProps, BejeweledItem, this.selectItem.bind(this));
    // 設定timerDialog
    this.setTimerDialog(BejeweledNumber.GameSec, 0);
    if (this.timerDialog === undefined) {
      console.error('create() error, this.timerDialog is undefined!');
      return;
    }
    this.timerDialog.y -= 35;
    this.timerDialog.x += 25;
    // 進行遊戲倒數
    this.setTimerEvent(
      () => {
        this.isTimeOut = true;
      },
      new Map([
        // 剩餘30秒強制續命
        [
          30,
          () => {
            this.isReviveTime = true;
          },
        ],
      ])
    );

    // 生成寶石
    this.gemsManager.drawField();

    // 預設值
    this.onEnergyUpdate(BejeweledNumber.MaxEnergy);

    // 設定魔王圖片
    this.infoDialog.setBossData(this.gameData.bossId);

    // 依總題數換算消除寶石目標
    this.targetGems = this.gameData.targetGems;

    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  fixedUpdate(time: number, delta: number) {
    this.gameFSM.update(delta);
  }

  //#region 狀態機
  /** 遊戲開場，播放遊戲動畫 */
  public async onOpeningEnter(): Promise<void> {
    // 消消樂沒有開場表演
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 消消樂沒有啟動需要做的事
  }

  /** 遊戲進行中update
   * @param delta
   */
  public onGameUpdate(delta: number): void {
    // 計時
    this.secondTimer += delta;

    // 過了一秒
    if (this.secondTimer >= 1000) {
      while (this.secondTimer >= 1000) {
        // 扣除累計時間
        this.secondTimer = Math.max(0, this.secondTimer - 1000);

        // 能量值耗損率加乘
        const perSecEnergy = BejeweledNumber.PerSecEnergy + BejeweledNumber.MinusEnergy * this.minusFactor;
        // 更新能量值
        this.onEnergyUpdate(-perSecEnergy);
      }
    }
  }

  /** 當觸發續命 */
  public onReviveEnter(): void {
    // 暫停背景音樂
    this.bgm?.pause();
    this.pauseScene();
  }

  /** 續命完成
   * @param rewardProp
   */
  public async onReviveEnd(rewardProp: TotalProps[]): Promise<void> {
    // 獲得道具獎勵
    this.itemDialog.addItems(rewardProp, BejeweledItem, this.selectItem.bind(this));

    // 恢復背景音樂
    this.bgm?.resume();

    // 所有場景暫停繼續
    this.resumeScene();
  }

  /** 遊戲結束 */
  public onEndingEnter(): ContestPlayerData {
    // 紀錄遊戲結果
    const gameLog: BejeweledGameLog = {
      gameScore: this.currentGems * 100,
      gameMode: GameType.WebBejeweled,
      browser: navigator.userAgent,
      bejeweledCount: this.currentGems,
    };
    return {
      hid: this.gameData.hid,
      isSurvivor: this.currentGems >= this.targetGems,
      webGameLog: gameLog,
    };
  }
  //#endregion

  //#region 外部呼叫
  /** 能量變化
   * @param amount
   */
  private onEnergyUpdate(amount: number) {
    this.currentEnergy = clamp(this.currentEnergy + amount, BejeweledNumber.MaxEnergy, 0);
    this.infoDialog.setCurrentEnergy(this.currentEnergy);
  }

  /** 點擊寶石
   * @param row 寶石座標row
   * @param col 寶石座標column
   */
  public onGemSelect(row: number, col: number): void {
    this.gemsManager.onGemSelect(row, col);
  }

  /** 滑鼠進入某寶石的觸控區域
   * @param row 寶石座標row
   * @param col 寶石座標column
   */
  public onGemPointOver(row: number, col: number): void {
    this.gemsManager.onPointOver(row, col);
  }

  /** 滑鼠離開某寶石的觸控區域
   * @param row 寶石座標row
   * @param col 寶石座標column
   */
  public onGemPointOut(row: number, col: number): void {
    this.gemsManager.onPointOut(row, col);
  }

  /** 滑鼠結束滑動 */
  public onStopSwipe(): void {
    this.gemsManager.onStopSwipe();
  }

  /** 選擇道具
   *  @param item 消消樂道具
   */
  private selectItem(item: BejeweledItem): void {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false) {
      return;
    }
    // 寶石消除中, 不可使用道具
    if (this.gemsManager.isUserOperable === false) {
      return;
    }
    // 點擊相同道具取消使用
    if (this.currentItem === item) {
      item.setHighlight(false);
      this.currentItem = undefined;
      return;
    }

    this.itemDialog.setOnlyHighlight(item);

    this.currentItem = item;
  }

  /** 使用道具
   *  @param currentItem 消消樂道具
   */
  public useItem(currentItem: BejeweledItem): void {
    currentItem.useItem();
    currentItem.setHighlight(false);
    this.currentItem = undefined;
  }

  /** 當寶石被摧毀時 */
  public onGemDestroy(): void {
    this.currentGems++;
    this.infoDialog.updateCurrentGemCount(this.currentGems);
    this.onEnergyUpdate(BejeweledNumber.PlusEnergy);
    this.minusFactor = Math.floor(this.currentGems / BejeweledNumber.GemsNum);
  }

  /** 播放消寶石音效 */
  public playDestroyGemsSound(): void {
    this.destroyGemsSoundPool?.play();
  }
  //#endregion
}
