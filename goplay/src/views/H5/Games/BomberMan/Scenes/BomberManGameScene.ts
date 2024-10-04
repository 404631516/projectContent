import {
  BomberManString,
  BomberManDepth,
  MapItemType,
  BomberManItemFunction,
  BomberManNumber,
} from '../Data/BomberManConfig';
import UIManager from '../../../Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import BomberManDialog from '../Dialogs/BomberManDialog';
import DebugConfig from '../Data/BomberManDebugConfig';
import BomberManTilemap, { Vector2 } from '../Components/BomberManTilemap';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import TableManager, { BomberManSettingData, BomberManItemData, HeroData } from '@/manager/TableManager';
import ItemDialog, { BindKeyMapEnum } from '../../UIHelper/ItemDialog';
import BomberItemBtn from '../Components/UI/BomberItemBtn';
import { bomberManImgUrl, bomberManJsonUrl } from '../Data/BomberManResource';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import InfoBox from '@/views/H5/Scripts/Components/InfoBox';
import { randomNumber, Align } from '@/views/H5/Helper/MathHelper';
import { BomberManGameData, TotalProps, BomberManGameLog, ContestPlayerData } from '@/helper/interface/Game';
import { PathDirectionType } from '@/views/H5/Helper/TileMapPathFinder';
import { PopUpNumberTween } from '@/views/H5/Scripts/Components/UI/BasePopUpNumberTween';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import WaveTimerDialog from '../Dialogs/WaveTimerDialog';
import { CharacterType, CharacterAnimType } from '@/helper/enum/PhaserGame';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import { GameType } from '@/helper/enum/Common';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import HeroManager from '@/manager/HeroManager';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** 炸彈超人-遊戲場景 */
export default class BomberManGameScene extends BaseGameScene implements IAnswerGame {
  /** 遊戲狀態機 */
  private gameFSM!: AnswerGameFSM;

  //#region readonly
  /** 倒數計時ui位置 */
  private readonly timerDialogPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, -10);

  /** 主動道具ui位置 */
  private readonly activeItemDialogPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(580 - 140, 550);
  /** 主動道具ui-頁籤圖位置 */
  private readonly activeItemTagPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(580 - 160, 550 - 12);
  /** 主動道具ui-頁籤字 */
  private readonly activeItemTextKey: string = 'bomber_active_item_text';

  /** 被動道具ui位置 */
  private readonly passiveItemDialogPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(870, 550);
  /** 被動道具ui-頁籤圖位置 */
  private readonly passiveItemTagPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(870 - 125, 550 - 12);
  /** 被動道具ui-頁籤字 */
  private readonly passiveItemTextKey: string = 'bomber_passive_item_text';

  /** 道具ui-頁籤字大風格 */
  private readonly itemDialogTagTextStyle: TextStyle = {
    fontSize: '16px',
  };
  /** 道具ui-縮放 */
  private readonly itemDialogScale: number = 0.85;

  /** 波次提示位置 */
  private readonly waveTimerPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(80, 20);
  /** 獲得分數提示字 */
  private readonly tweenScoreTextKey: string = 'bomber_tween_score_text';
  //#endregion readonly

  //#region 內部變數
  /** 目前tile map地圖 */
  public tilemap!: BomberManTilemap;

  /** 遊戲參數 */
  private gameSetting!: BomberManSettingData;

  /** 道具靜態表 */
  private itemTableData!: BomberManItemData[];

  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 英雄資料 */
  private heroData!: HeroData;

  /** 遊戲結束 (若能量為0) */
  public get isGameEnd(): boolean {
    // 沒有能量了 或
    return (
      this.currentEnergy <= 0 ||
      // 遊戲遊戲結束
      this.isTimeOut ||
      // 全部波次已清除完畢
      this.tilemap.isAllWaveCleared
    );
  }

  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    return this.currentEnergy <= this.gameSetting.reviveEnergy || this.isReviveTime;
  }

  /** 上浮文字動畫 */
  private tweenTextGroup!: Phaser.GameObjects.Group;

  /** 能量數 */
  private currentEnergy: number = 0;
  /** 能量流失比率 */
  private energyDropRatio: number = 0;

  /** 遊戲分數 */
  private scoreCount: number = 0;

  /** 殺敵數 */
  public killEnemyCount: number = 0;

  /** 關卡表索引 */
  private stageIndex: number = 0;
  /** 關卡限時 */
  private stageCountDownSec: number = 0;

  /** 主畫面Dialog */
  public mainDialog!: BomberManDialog;

  /** 主動道具介面 */
  private activeItemDialog!: ItemDialog<BomberItemBtn>;
  /** 被動道具介面 */
  public passiveItemDialog!: ItemDialog<BomberItemBtn>;
  /** 波次倒數計時 */
  private waveTimerDialog!: WaveTimerDialog;

  //#region input
  /** 方向鍵 */
  private leftArrow!: Phaser.Input.Keyboard.Key;
  private rightArrow!: Phaser.Input.Keyboard.Key;
  private upArrow!: Phaser.Input.Keyboard.Key;
  private downArrow!: Phaser.Input.Keyboard.Key;
  /** 放置炸彈 按鍵 */
  private putBombButton!: Phaser.Input.Keyboard.Key;

  /** 移動方向輸入清單 */
  private moveDirectionList: PathDirectionType[] = [];
  //#endregion input

  //#endregion 內部變數

  //#region 基本流程
  /** singleton */
  private static _instance: BomberManGameScene;
  public static get instance(): BomberManGameScene {
    return this._instance;
  }

  constructor(private gameData: BomberManGameData, private gameWeb: IAnswerWeb) {
    super({ key: 'BomberManGameScene' });
    BomberManGameScene._instance = this;
    this.gameFSM = new AnswerGameFSM(this, gameWeb);
  }

  async preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);

    const heroID = this.gameData.heroListData.heroId;
    // 獲取英雄資料
    const foundHeroData = HeroManager.getHeroData(heroID);
    // 檢查資料並顯示錯誤
    if (foundHeroData === undefined) {
      await InfoBox.defaultMessage([this], `英雄資料讀取失敗! 英雄ID: ${this.gameData.heroListData.heroId}`);
      this.scene.stop();
      return;
    }
    this.heroData = foundHeroData;

    // 載入英雄動畫圖
    AnimationHelper.loadCharacterSprite(this, this.heroData, CharacterType.Hero, CharacterAnimType.Walk);
    AnimationHelper.loadCharacterSprite(this, this.heroData, CharacterType.Hero, CharacterAnimType.Idle);

    // 抽選關卡
    const stageTable = TableManager.bomberManStage.getAll();
    this.stageIndex = randomNumber(stageTable.length);
    if (DebugConfig.isLog) {
      console.log(`random stageIndex=${this.stageIndex}`);
    }

    const stageData = stageTable[this.stageIndex];
    if (stageData == null) {
      console.error(`preload: stage not found, stageIndex=${this.stageIndex}`);
      return;
    }

    // 載入敵人動畫圖
    TableManager.bomberManEnemy
      .getAll()
      .filter((enemy) => stageData.waveEnemyIDList.includes(enemy.id))
      .forEach((enemyData) =>
        AnimationHelper.loadCharacterSprite(this, enemyData, CharacterType.Enemy, CharacterAnimType.Walk)
      );

    // 抓取道具靜態表
    this.itemTableData = TableManager.bomberManItem.getAll();
    // 載入道具圖片
    this.itemTableData.forEach((data) => {
      this.load.image(data.nameKey, `${bomberManImgUrl}/${data.url}`);
    });
  }

  create() {
    if (DebugConfig.isLog) {
      console.warn('load map start');
    }

    // 創建英雄動畫
    const heroWalkAnim = AnimationHelper.createCharacterAnim(this, this.heroData, CharacterAnimType.Walk);
    if (heroWalkAnim) {
      heroWalkAnim.frameRate = BomberManNumber.walkFrameRate;
    }
    AnimationHelper.createCharacterAnim(this, this.heroData, CharacterAnimType.Idle);

    // 載入遊戲參數
    const foundGameSetting = TableManager.bomberManSetting.findOne(1);
    if (foundGameSetting == null) {
      console.error('bomberManGameSetting 載入失敗');
      return;
    }
    this.gameSetting = foundGameSetting;

    // 設定能量最大值
    this.currentEnergy = this.gameSetting.maxEnergyAmount;

    // 開啟Dialog
    this.setDialog();

    // 取得關卡
    const stageData = TableManager.bomberManStage.getAll()[this.stageIndex];
    if (stageData == null) {
      console.error(`BomberManGameScene.create: stage not found, stageIndex=${this.stageIndex}`);
      return;
    }

    // 關卡限時
    this.stageCountDownSec = stageData.countDownSec;

    // 取得 地圖json編號
    const tileMapId = stageData.mapJsonId;
    const tileMapKey = `${BomberManString.TileMap}${tileMapId}`;

    // 建立地圖 及 地圖物件
    this.tilemap = new BomberManTilemap(this, 0, 0, tileMapKey);
    this.tilemap.create(this.heroData, stageData, this.gameSetting);

    // 設置表演文字群組
    this.tweenTextGroup = this.add.group({
      classType: PopUpNumberTween,
      maxSize: 10,
    });

    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  fixedUpdate(time: number, delta: number) {
    // 更新遊戲狀態機
    this.gameFSM.update(delta);
  }
  //#endregion 基本流程

  /** 設定Dialog */
  private async setDialog(): Promise<void> {
    // 開啟主ui
    this.mainDialog = UIManager.instance.openDialog(BomberManDialog, this);
    if (this.mainDialog == null) {
      console.error(`BomberManGameScene.openDialog: _mainDialog == null`);
      return;
    }

    // 初始能量
    this.mainDialog.energyBar.updateEnergy(this.gameSetting.maxEnergyAmount, this.gameSetting.maxEnergyAmount);
    // 初始分數
    this.mainDialog.updateScoreCount(this.scoreCount, this.gameSetting.targetScore);

    //#region 主動道具
    // 建立主動道具介面
    this.activeItemDialog = UIManager.instance.openDialog<ItemDialog<BomberItemBtn>>(ItemDialog, this);
    this.activeItemDialog.setDepth(BomberManDepth.itemDialog);
    this.activeItemDialog.setScale(this.itemDialogScale);
    // 初始道具ui
    this.activeItemDialog.init(
      this.itemTableData,
      { width: 60, height: 60 } as Size,
      this.activeItemDialogPosition,
      Align.LeftCenter
    );

    // 加入快閃店購買的道具
    await this.activeItemDialog.addItems(this.gameData.totalProps, BomberItemBtn, this.useItem.bind(this));

    // 頁籤
    const activeTag = this.activeItemDialog.addImage(
      BomberManString.ActiveSkillTag,
      this.activeItemTagPosition.x,
      this.activeItemTagPosition.y
    );
    // 頁籤文字
    this.activeItemDialog.addText(
      Localization.getText(LocalKeyType.Common, this.activeItemTextKey),
      this.activeItemTagPosition.x,
      this.activeItemTagPosition.y,
      this.itemDialogTagTextStyle
    );
    // 移到底層
    this.activeItemDialog.sendToBack(activeTag);
    //#endregion 主動道具

    //#region 被動道具
    // 建立被動道具介面
    this.passiveItemDialog = UIManager.instance.openDialog<ItemDialog<BomberItemBtn>>(ItemDialog, this);
    this.passiveItemDialog.setDepth(BomberManDepth.itemDialog);
    this.passiveItemDialog.setScale(this.itemDialogScale);
    // 初始道具ui
    this.passiveItemDialog.init(
      this.itemTableData,
      { width: 60, height: 60 } as Size,
      this.passiveItemDialogPosition,
      Align.Center,
      BindKeyMapEnum.None
    );

    // 加入被動道具(地圖專用)，預設數量0
    const passiveTotalProps: TotalProps[] = [];
    TableManager.bomberManItem.getAll().forEach((itemTableData) => {
      if (itemTableData.isMapItem === MapItemType.MapItem) {
        passiveTotalProps.push({
          id: itemTableData.id,
          count: 0,
        } as TotalProps);
      }
    });
    await this.passiveItemDialog.addItems(passiveTotalProps, BomberItemBtn, () => {
      return;
    });

    // 頁籤
    const passiveTag = this.passiveItemDialog.addImage(
      BomberManString.PassiveSkillTag,
      this.passiveItemTagPosition.x,
      this.passiveItemTagPosition.y
    );
    // 頁籤文字
    this.passiveItemDialog.addText(
      Localization.getText(LocalKeyType.Common, this.passiveItemTextKey),
      this.passiveItemTagPosition.x,
      this.passiveItemTagPosition.y,
      this.itemDialogTagTextStyle
    );
    // 移到底層
    this.passiveItemDialog.sendToBack(passiveTag);
    //#endregion 被動道具

    // 建立 下一波提示
    this.setWaveTimerDialog();
  }

  /** 增加遊戲分數
   * @param plus 分數
   * @param popupPosition 顯示位置
   */
  public gainScore(plus: number, popupPosition: Vector2): void {
    this.scoreCount += plus;

    if (plus !== 0) {
      // 表演分數變動文字
      const tweenText: PopUpNumberTween = this.tweenTextGroup.get(popupPosition.x, popupPosition.y);
      if (tweenText) {
        tweenText.setDepth(BomberManDepth.popupTextTween);
        tweenText.popUpNumberUnit(plus, Localization.getText(LocalKeyType.Common, this.tweenScoreTextKey));
      }
    }

    // 刷新ui
    this.mainDialog.updateScoreCount(this.scoreCount, this.gameSetting.targetScore);
  }

  //#region 狀態機
  /** 遊戲開場，播放遊戲動畫 */
  public async onOpeningEnter(): Promise<void> {
    // 播放開場動畫
    await this.mainDialog.showOpeningGameText();
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 能量開始隨時間流逝
    this.initReduceEnergyTimeEvent();

    // 開始刷新敵人
    this.tilemap.enemyPool.runChildUpdate = true;

    // 開啟Timer計時
    this.setTimerDialog(this.stageCountDownSec, BomberManDepth.timerDialog);
    this.setTimerEvent(
      () => {
        // 時間到
        this.isTimeOut = true;
      },

      // 剩餘30秒強制續命
      new Map([
        [
          30,
          () => {
            this.isReviveTime = true;
          },
        ],
      ])
    );
    this.timerDialog?.setPosition(this.timerDialogPosition.x, this.timerDialogPosition.y);

    // 綁定方向鍵
    this.bindArrows();
    // 註冊觸控事件
    this.registerTouchEvent();
    // 設置 放置炸彈鈕event
    this.mainDialog.putBombBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.tilemap.putBomb();
    });
  }

  /** 遊戲進行中，英雄跑動
   * @param delta 每一幀的間隔
   */
  public onGameUpdate(delta: number): void {
    // 刷新角色
    this.tilemap.hero.update(0, delta);
    // 檢查按下鍵盤
    this.checkPressKeyMoveHero();
  }

  /** 當觸發續命 */
  public async onReviveEnter(): Promise<void> {
    // 暫停背景音樂
    this.bgm?.pause();
    this.pauseScene();
  }

  /** 當續命完成時
   * @param rewardProp
   */
  public async onReviveEnd(rewardProp: TotalProps[]): Promise<void> {
    // 將道具加到itemDialog
    await this.activeItemDialog.addItems(rewardProp, BomberItemBtn, this.useItem.bind(this));
    // 播放開場動畫
    await this.mainDialog.showOpeningGameText();
    // 繼續背景音樂
    this.bgm?.resume();

    // 所有場景暫停繼續
    this.resumeScene();
  }

  /** 結束遊戲 */
  public onEndingEnter(): ContestPlayerData {
    // 停止刷新敵人
    this.tilemap.enemyPool.runChildUpdate = false;

    if (DebugConfig.isLog) {
      const messageTxt =
        `game end:\n` +
        `score=+${this.scoreCount}\n` +
        `剩餘能量=+${this.currentEnergy}` +
        `殺敵數(bomberKillCount)=${this.killEnemyCount}`;
      console.warn(messageTxt);
    }

    // 設定炸彈超人結算資料
    const gameLog: BomberManGameLog = {
      gameScore: this.scoreCount,
      gameMode: GameType.WebBomberMan,
      browser: navigator.userAgent,
      bomberKillCount: this.killEnemyCount,
    };
    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: this.scoreCount >= this.gameSetting.targetScore,
      webGameLog: gameLog,
    };
  }
  //#endregion

  //#region energy bar
  /** 設置能量流失事件，隨著時間越長，扣除的能量也越多 */
  private initReduceEnergyTimeEvent(): void {
    this.time.addEvent({
      /** 每隔數秒 */
      delay: this.gameSetting.energyDropIntervalSec * 1000,
      /** 能量流失 */
      callback: () => {
        // 能量流失比率 會逐漸加快
        this.energyDropRatio += this.gameSetting.energyDropIncresePerInterVal;
        // 扣除能量
        this.updateEnergy(-1 * this.energyDropRatio, false);
      },
      callbackScope: this,
      /** 不斷重複 */
      repeat: -1,
    });
  }

  /** 增加/減少能量
   * @param plus >0:增加量，<0:扣除量
   * @param isPopUp 顯示上浮提示
   * @param popupPosition 上浮提示座標
   */
  public updateEnergy(plus: number, isPopUp: boolean, popupPosition: Vector2 = Phaser.Math.Vector2.ZERO): void {
    this.currentEnergy += plus;
    this.currentEnergy = Phaser.Math.Clamp(this.currentEnergy, 0, this.gameSetting.maxEnergyAmount);

    // 表演能量變動文字
    if (isPopUp && plus !== 0) {
      const tweenText: PopUpNumberTween = this.tweenTextGroup.get(popupPosition.x, popupPosition.y);
      if (tweenText) {
        tweenText.setDepth(BomberManDepth.popupTextTween);
        tweenText.popUpNumberIcon(plus, BaseSceneString.EnergyIcon);
      }
    }

    // 更新能量顯示
    this.mainDialog.energyBar.updateEnergy(this.currentEnergy, this.gameSetting.maxEnergyAmount);
  }
  //#endregion energy bar

  /** 使用道具
   * @param item 道具
   */
  public async useItem(item: BomberItemBtn): Promise<void> {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false) {
      return;
    }

    // 地圖專用道具，不可使用
    if (item.itemData.isMapItem) {
      console.error(`useItem: can't use map item, id=${item.itemData.id}`);
      return;
    }

    // 已啟用BUFF，skip
    if (this.tilemap.hero.hasHeroBuff(item.itemData.itemFunction)) {
      return;
    }

    // 使用道具 (回傳true:使用成功)
    if (item.useItem() === false) {
      return;
    }

    // 播放item效果
    this.playUseItemEffect(item.itemData);

    // 顯示道具啟用中提示，直到倒數結束
    this.activeItemDialog.setCountDownPendingUntil(
      item,
      item.itemData.duration,
      // 啟用能力，直到倒數結束
      this.tilemap.hero.addHeroBuff(item.itemData.itemFunction, item.itemData.duration)
    );
  }

  //#region input
  /** 綁定方向鍵 */
  private bindArrows(): void {
    this.leftArrow = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT, true);
    this.rightArrow = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT, true);
    this.upArrow = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP, true);
    this.downArrow = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN, true);
    this.putBombButton = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, true);
  }

  /** 檢查按下鍵盤移動英雄 */
  private checkPressKeyMoveHero(): void {
    // 按下放炸彈按鈕
    if (this.putBombButton.isDown) {
      this.tilemap.putBomb();
    }

    // 按順序存入輸入清單
    // 按上
    this.onArrowKeyDown(this.upArrow, PathDirectionType.Up);
    // 按下
    this.onArrowKeyDown(this.downArrow, PathDirectionType.Down);
    // 按左
    this.onArrowKeyDown(this.leftArrow, PathDirectionType.Left);
    // 按右
    this.onArrowKeyDown(this.rightArrow, PathDirectionType.Right);

    // 若清單是空的，就返回
    if (this.moveDirectionList.length === 0) {
      return;
    }

    // 取得時間順序第一的方向
    const moveDirection = this.moveDirectionList[0];

    // 以 目的座標 為 開始座標
    const startTileXY = this.tilemap.hero.targetTileXY;

    // 取得目標格子座標
    const targetTileXY = this.tilemap.getNeighborTileXY(startTileXY, moveDirection);

    // 不可移動的格子，不可移動
    if (false === this.tilemap.isTileWalkableByHero(targetTileXY)) {
      return;
    }

    // 外部控制移動英雄 到 目的座標
    this.tilemap.hero.onAvatarMove(startTileXY, targetTileXY);
  }

  /** 按下方向鍵，記錄到清單 或 刪除
   * @param arrowObject 方向鍵
   * @param arrowDirection 方向
   */
  private onArrowKeyDown(arrowObject: Phaser.Input.Keyboard.Key, arrowDirection: PathDirectionType): void {
    // 若按下方向鍵
    if (arrowObject.isDown) {
      // 且未記錄在清單中
      if (this.moveDirectionList.includes(arrowDirection) === false) {
        // 記錄到清單
        this.moveDirectionList.push(arrowDirection);
      }
    }
    // 若未按下方向鍵
    else {
      // 刪除清單中的按鍵
      const index = this.moveDirectionList.findIndex((direction) => direction === arrowDirection);
      if (index !== -1) {
        Phaser.Utils.Array.RemoveAt(this.moveDirectionList, index);

        if (this.moveDirectionList.length === 0) {
          // 強制英雄停止
          this.tilemap.hero.onAvatarStop();
        }
      }
    }
  }

  /** 註冊觸控事件 */
  private registerTouchEvent(): void {
    // 結束點擊畫面-移到玩家到目的地磚
    this.input.on(Phaser.Input.Events.POINTER_UP, this.onTouch.bind(this));

    // 停用場景時，反註冊事件
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this.input.off(Phaser.Input.Events.POINTER_UP));
  }

  /** 結束點擊畫面-移到玩家到目的地磚
   * @param pointer 點擊資料
   */
  private onTouch(pointer: Phaser.Input.Pointer): void {
    // 遊戲中才可移動
    if (this.gameFSM.isGameState === false) {
      return;
    }

    // 點擊格子位置
    const touchTileXY = this.tilemap.worldXYToTileXY(new Phaser.Math.Vector2(pointer.x, pointer.y));

    // 限制在地圖範圍內進行
    if (this.tilemap.getTileObjectInMap(touchTileXY).length === 0) {
      return;
    }
    // 不可移動的格子，不可移動或放炸彈
    if (false === this.tilemap.isTileWalkableByHero(touchTileXY)) {
      return;
    }

    // 取得英雄的格子座標
    const heroTileXY = this.tilemap.heroTileXY;

    // 若結束點擊，是在玩家位置的地磚，就放置炸彈
    if (heroTileXY.equals(touchTileXY)) {
      // 放置炸彈
      this.tilemap.putBomb();
      return;
    }

    // 點擊位置與英雄目標一致，不執行任何動作，讓英雄繼續往前(避免顯示無法移動的訊息)
    if (this.tilemap.hero.targetTileXY.equals(touchTileXY)) {
      return;
    }

    // 外部控制移動英雄 到 目的座標
    this.tilemap.hero.onAvatarMove(this.tilemap.hero.targetTileXY, touchTileXY);
  }
  //#endregion input

  /** 建立 下一波提示 */
  private setWaveTimerDialog(): void {
    // 波次倒數計時
    this.waveTimerDialog = UIManager.instance.openDialog(WaveTimerDialog, this);
    this.waveTimerDialog.setDepth(BomberManDepth.timerDialog);
    this.waveTimerDialog.setScrollFactor(0);
    this.waveTimerDialog.setPosition(this.waveTimerPosition.x, this.waveTimerPosition.y);

    // 建立後先隱藏
    this.waveTimerDialog.hideWavePrompt();
  }

  /** 顯示 下一波提示
   * @param countDownSec 倒數秒數
   */
  public async showWavePrompt(countDownSec: number): Promise<void> {
    await this.waveTimerDialog.showWavePrompt(countDownSec);
  }

  /** 播放item視覺效果
   * @param itemData 道具靜態表
   */
  private async playUseItemEffect(itemData: BomberManItemData): Promise<void> {
    switch (itemData.itemFunction) {
      case BomberManItemFunction.ThroughWall:
        this.tilemap.hero.playThroughWallEffect(itemData.duration);
        break;
      case BomberManItemFunction.ThroughBomb:
        this.tilemap.hero.playThroughBombEffect(itemData.duration);
        break;
      case BomberManItemFunction.AntiBlast:
        this.tilemap.hero.playAntiBlastEffect(itemData.duration);
        break;
      case BomberManItemFunction.Invincible:
        this.tilemap.hero.playInvincibleEffect(itemData.duration);
        break;
      // 無視覺效果
      default:
        break;
    }
  }
}
