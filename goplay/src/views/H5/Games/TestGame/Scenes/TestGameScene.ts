import UIManager from '../../../Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import FishPool from '../Component/FishPool';
import TestHero from '../Component/TestHero';
import TestGuiDialog from '../Dialogs/TestGuiDialog';
import TestBackgroundDialog from '../Dialogs/TestBackgroundDialog';
import { TestDepth, TestString, TestItemFunction, TestNumber } from '../Data/TestConfig';
import Fish from '../Component/Fish';
import TableManager, {
  HeroData,
  TestFishData,
  TestItemData,
  TestSettingData,
  TestWaveData,
} from '@/manager/TableManager';
import TestItem from '../Component/TestItem';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import ItemDialog from '../../UIHelper/ItemDialog';
import { testImgUrl, testJsonUrl } from '../Data/TestResource';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { TestGameLog, TotalProps, ContestPlayerData, TestGameData } from '@/helper/interface/Game';
import InfoBox from '@/views/H5/Scripts/Components/InfoBox';
import { GameType } from '@/helper/enum/Common';
import SoundPool from '../../Common/SoundPool';
import { PopUpNumberTween } from '@/views/H5/Scripts/Components/UI/BasePopUpNumberTween';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { Align } from '@/views/H5/Helper/MathHelper';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType, CharacterType } from '@/helper/enum/PhaserGame';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import HeroManager from '@/manager/HeroManager';

type OverlapGameobject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

export default class TestGameScene extends BaseGameScene implements IAnswerGame {
  /** 遊戲狀態機 */
  private gameFSM!: AnswerGameFSM;

  /** 英雄起始位置 */
  private readonly heroStartPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(100, 200);

  /** 遊戲設定參數 */
  private testSettingData!: TestSettingData;
  /** 波數參數 */
  private testWaveData!: TestWaveData[];
  /** 魚種參數 */
  private fishDatas!: TestFishData[];
  /** 道具資料 */
  private itemDataList!: TestItemData[];

  /** 網頁端英雄資料 */
  private heroData!: HeroData;

  //#region variable
  /** 介面Dialog : 分數、生命、道具數量 */
  private guiDialog!: TestGuiDialog;
  /** 道具介面 */
  private itemDialog!: ItemDialog<TestItem>;

  /** 捕獲魚的音效 */
  private catchSoundPool?: SoundPool;

  /** 能量文字動畫 */
  private energyTweenTextGroup!: Phaser.GameObjects.Group;

  /** 英雄 Prefab */
  private hero!: TestHero;

  /** 魚群物件池 */
  private fishPool!: FishPool;

  /** 魔力數 */
  private currentEnergy: number = 0;
  /** 分數累計 */
  private scoreCount: number = 0;
  /** 目前漁獲量 */
  private currentCatchAmount: number = 0;
  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 判斷遊戲是否該結束 */
  public get isGameEnd(): boolean {
    return this.currentEnergy <= 0 || this.isTimeOut;
  }
  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    return this.currentEnergy <= this.testSettingData.reviveEnergy || this.isReviveTime;
  }
  //#endregion

  constructor(private gameData: TestGameData, private gameWeb: IAnswerWeb) {
    super({ key: 'TestGameScene' });
    this.gameFSM = new AnswerGameFSM(this, gameWeb);
  }

  //#region Phaser function
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

    // 動態載入英雄閒置動畫
    AnimationHelper.loadCharacterSprite(this, this.heroData, CharacterType.Hero, CharacterAnimType.Idle);

    // 抓取道具靜態表
    this.itemDataList = TableManager.testItem.getAll();
    // 載入道具圖片
    this.itemDataList.forEach((data) => {
      this.load.image(data.nameKey, `${testImgUrl}/${data.url}`);
    });

    // 魚種資料
    this.fishDatas = TableManager.testFish.getAll();
    if (this.fishDatas === undefined) {
      console.error('TestFishTableData 載入失敗');
      return;
    }

    // 載入魚群圖案
    this.fishDatas.forEach((data) => {
      this.load.spritesheet(data.nameKey, `${testImgUrl}/${data.url}`, {
        frameWidth: TestNumber.FishFramePixel,
        frameHeight: TestNumber.FishFramePixel,
      });
    });

    // 載入魚群動畫
    this.load.animation(TestString.JsonAnims, `${testJsonUrl}/Anims.json`);

    // 載入spine動畫
    const folderPath = `${testImgUrl}/spine/`;
    this.load.spineBinary('spineboy-data', folderPath + 'spineboy-pro.skel');
    this.load.spineAtlas('spineboy-atlas', folderPath + 'spineboy-pma.atlas');
  }

  async create() {
    // 載入遊戲參數
    const testSettingData = TableManager.testSetting.findOne(1);
    if (testSettingData === undefined) {
      console.error('TestGameTableData 載入失敗');
      return;
    }
    // 設定遊戲參數
    this.testSettingData = testSettingData;
    // 設定能量最大值
    this.currentEnergy = this.testSettingData.maxEnergy;

    // 載入遊戲波數參數
    this.testWaveData = TableManager.testWave.getAll();
    if (this.testWaveData === undefined) {
      console.error('TestWaveTableData 載入失敗');
      return;
    }
    // 確保波數順序
    this.testWaveData = this.testWaveData.sort((a: Readonly<TestWaveData>, b: Readonly<TestWaveData>) => {
      return a.id - b.id;
    });

    // 創建英雄閒置動畫
    AnimationHelper.createCharacterAnim(this, this.heroData, CharacterAnimType.Idle);
    // 設置英雄
    this.hero = new TestHero(this, this.heroStartPosition, this.heroData, this.testSettingData);
    // 註冊英雄收竿事件
    this.hero.onPullUpLeaveEvent = () => {
      this.fishPool.fishesJump();
    };

    // 設置表演文字群組
    this.energyTweenTextGroup = this.add.group({ classType: PopUpNumberTween, maxSize: 10 });

    // 設置魚池
    this.fishPool = new FishPool(this, this.fishDatas);

    // 設置物理事件
    this.setOverlap();

    // 設置Dialog
    await this.setDialog();

    // 設置音效
    this.catchSoundPool = new SoundPool(this, TestString.AudioCatch);

    // 設置Spine動畫範例
    const spineboy = this.add.spine(350, 500, 'spineboy-data', 'spineboy-atlas');
    spineboy.scale = 0.2;
    spineboy.animationState.setAnimation(0, 'walk', true);
    const spineboyRun = this.add.spine(500, 500, 'spineboy-data', 'spineboy-atlas');
    spineboyRun.scaleX = -0.2;
    spineboyRun.scaleY = 0.2;
    spineboyRun.animationState.setAnimation(0, 'run', true);
  }

  fixedUpdate(time: number, delta: number) {
    // 更新英雄
    this.hero.update(delta);
    // 更新遊戲狀態機
    this.gameFSM.update(delta);
  }
  //#endregion

  //#region 初始化
  //#region 物理事件
  /** 設置物理互動 */
  private setOverlap(): void {
    // 設置釣魚線與魚群物理互動
    this.physics.add.overlap(
      this.hero.fishingLine,
      this.fishPool.group,
      this.onFishingLineOverlapFishes.bind(this),
      this.onFishingLineProcessFishes.bind(this)
    );

    // 設置釣魚網與魚群物理互動
    this.physics.add.overlap(
      this.hero.fishingNet,
      this.fishPool.group,
      this.onFishingNetOverlapFishes.bind(this),
      this.onFishingNetProcessFishes.bind(this)
    );

    // 設置魚船與魚群物理互動
    this.physics.add.overlap(
      this.hero.fishBoat,
      this.fishPool.group,
      this.onFishBoatOverlapFishes.bind(this),
      this.onFishBoatProcessFishes.bind(this)
    );
  }

  /** 釣魚線與魚重疊事件
   * @param fishingLine 釣魚線
   * @param fishObject 魚遊戲物件
   */
  private onFishingLineOverlapFishes(fishingLine: OverlapGameobject, fishObject: OverlapGameobject): void {
    // 英雄拉起釣魚線
    this.hero.pullUp();

    const fish = fishObject as Fish;
    // 魚隨著魚線移動
    fish.caught();
    fish.setPosition(this.hero.hookPositionX, this.hero.hookPositionY);
  }

  /** 判斷是否觸發釣魚線與魚重疊事件
   * @param fishingLine 釣魚線
   * @param fishObject 魚遊戲物件
   * @returns true = 執行
   */
  private onFishingLineProcessFishes(fishingLine: OverlapGameobject, fishObject: OverlapGameobject): boolean {
    const fish = fishObject as Fish;

    // 確認釣魚勾(釣魚線底部)有碰到魚
    if (Phaser.Math.Difference(fish.y, this.hero.hookPositionY) > fish.height / 2) {
      return false;
    }

    // 確認魚不是往下掉
    if (fish.isFalling) {
      return false;
    }

    // 確認目前為釣魚狀態
    return this.hero.isCast || this.hero.isPullUp;
  }

  /** 漁網與魚重疊事件
   * 當魚網與魚重疊，會一次性打撈大量的魚
   * @param fishingNet 漁網
   * @param fishObject 魚遊戲物件
   */
  private onFishingNetOverlapFishes(fishingNet: OverlapGameobject, fishObject: OverlapGameobject): void {
    const fish = fishObject as Fish;
    // 魚隨著魚線移動
    fish.caught();
    fish.setPosition(fish.x, this.hero.fishingNetPositionY);
  }

  /** 判斷是否觸發漁網與魚重疊事件
   * @param fishingNet 漁網
   * @param fishObject 魚遊戲物件
   * @returns true = 執行
   */
  private onFishingNetProcessFishes(fishingNet: OverlapGameobject, fishObject: OverlapGameobject): boolean {
    const fish = fishObject as Fish;

    /** 確認靠近漁網中心 */
    if (
      Math.abs(this.hero.fishingNetPositionX - fish.x) > fish.width / 2 ||
      Math.abs(this.hero.fishingNetPositionY - fish.y) > fish.height
    ) {
      return false;
    }

    // 確認魚不是往下掉
    if (fish.isFalling) {
      return false;
    }

    // 確認目前為釣魚網狀態
    return this.hero.isCastNet || this.hero.isPullUpNet;
  }

  /** 漁船與魚重疊事件
   * 當漁船接到魚的時候，可以獲得分數
   * @param fishBost 漁船
   * @param fishObject 魚遊戲物件
   */
  private onFishBoatOverlapFishes(fishBost: OverlapGameobject, fishObject: OverlapGameobject): void {
    const fish = fishObject as Fish;
    fish.idle();

    // 根據環保加類別給予對應的顯示
    this.guiDialog.playEnvironmentalAdditionHint(fish.environmentalType);

    // 處理分數
    const score = fish.getScore();
    // 如果玩家無敵，負分的魚都轉為加分
    this.updateScore(this.hero.isInvincible ? Math.abs(score) : score);

    // 處理魔力變化
    let energy = fish.getEnergy();
    energy = this.hero.isInvincible ? Math.abs(energy) : energy;
    // 如果玩家無敵，負魔力的魚都轉為加正
    this.updateEnergy(energy, true);

    if (energy >= 0) {
      // 紀錄漁獲量
      this.currentCatchAmount += 1;

      // 播放音效
      this.catchSoundPool?.play();
    }
    // 玩家受傷
    else {
      this.hero.onHurt();
    }
  }

  /** 判斷是否觸發漁船與魚重疊事件
   * @param fishBost 漁船
   * @param fishObject 魚遊戲物件
   * @returns true = 執行
   */
  private onFishBoatProcessFishes(fishBost: OverlapGameobject, fishObject: OverlapGameobject): boolean {
    const fish = fishObject as Fish;
    // 假如魚是往下掉(防止釣魚時魚往上拋誤觸)
    return fish.isFalling;
  }
  //#endregion

  /** 設定背景、Gui等Dialog */
  private async setDialog(): Promise<void> {
    // 開啟背景
    const bgDialog = UIManager.instance.openDialog(TestBackgroundDialog, this);
    bgDialog.setDepth(TestDepth.Background);

    // 開啟Gui
    this.guiDialog = UIManager.instance.openDialog(TestGuiDialog, this);
    this.guiDialog.setDepth(TestDepth.UI);
    this.guiDialog.updateEnergyBar(this.testSettingData.maxEnergy, this.testSettingData.maxEnergy);
    this.guiDialog.updateScoreCount(this.scoreCount, this.testSettingData.targetScore);

    // 開啟道具介面
    this.itemDialog = UIManager.instance.openDialog<ItemDialog<TestItem>>(ItemDialog, this);
    this.itemDialog.setDepth(TestDepth.UI);
    this.itemDialog.init(
      this.itemDataList,
      { width: 60, height: 60 },
      new Phaser.Math.Vector2(this.itemDialog.width - 150, this.itemDialog.height - 40),
      Align.RightCenter
    );
    await this.itemDialog.addItems(this.gameData.totalProps, TestItem, this.useItem.bind(this));

    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  /** 設置魔力流逝事件，隨著時間越長，扣除的魔力值也越多 */
  private setReduceEnergyTimeEvent(): void {
    this.time.addEvent({
      /** 每隔1秒 */
      delay: 1000,
      /** 魔力流逝 */
      callback: () => {
        // 魔力值耗損率加乘，假如 catchAmountGap = 15,baseConsumption = 10, progressiveConsumption = 5
        // 漁獲量<15時，每秒消耗10能量，漁獲量>15且<30時，每秒消耗15能量；依此類推，每多釣進15隻魚，每秒消耗魔力值就+5
        const multiply = Math.floor(this.currentCatchAmount / this.testSettingData.catchAmountGap);
        const multiplyConsumption = multiply * this.testSettingData.progressiveConsumption;
        const minusNum = this.testSettingData.baseConsumption + multiplyConsumption;

        // 更新能量值
        this.updateEnergy(-minusNum, false);
      },
      callbackScope: this,
      /** 不斷重複 */
      repeat: -1,
    });
  }
  //#endregion 初始化

  //#region 狀態機
  /** 遊戲開場，播放遊戲動畫 */
  public async onOpeningEnter(): Promise<void> {
    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 生命開始隨時間流逝
    this.setReduceEnergyTimeEvent();
    // 英雄可以開始移動
    this.hero.move();
    // 魚池開始運作
    this.fishPool.active(this.testSettingData, this.testWaveData);
    // 開啟Timer計時，以波數總時間為準
    this.setTimerDialog(this.fishPool.totalDuration, TestDepth.UI);
    // 設置Timer事件
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
  }

  /** 遊戲進行中
   * @param delta 每一幀的間隔
   */
  public onGameUpdate(delta: number): void {
    //
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
    // 將道具加到itemDialog
    await this.itemDialog.addItems(rewardProp, TestItem, this.useItem.bind(this));
    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();

    // 繼續背景音樂
    this.bgm?.resume();
    // 所有場景暫停繼續
    this.resumeScene();
  }

  /** 結束遊戲 */
  public onEndingEnter(): ContestPlayerData {
    // 更新魔力顯示
    this.guiDialog.updateEnergyBar(this.currentEnergy, this.testSettingData.maxEnergy);
    // 英雄死亡，停止操控
    this.hero.dead();

    // 設定結算資料
    const gameLog: TestGameLog = {
      gameScore: this.scoreCount,
      gameMode: -1 as GameType,
      browser: navigator.userAgent,
      catchAmount: this.currentCatchAmount,
    };
    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: this.scoreCount >= this.testSettingData.targetScore,
      webGameLog: gameLog,
    };
  }
  //#endregion 狀態機

  //#region 遊戲邏輯
  /** 改變魔力量
   * @param energy 要改變的量，<0為扣魔力
   * @param isPopUp 是否表演數字PopUp
   */
  public updateEnergy(energy: number, isPopUp: boolean): void {
    // 限制能量區間
    this.currentEnergy += energy;
    this.currentEnergy = Phaser.Math.Clamp(this.currentEnergy, 0, this.testSettingData.maxEnergy);

    // 表演能量變動文字
    if (isPopUp === true && energy !== 0) {
      const tweenText: PopUpNumberTween = this.energyTweenTextGroup.get(
        this.hero.x,
        this.hero.y - this.hero.displayHeight / 2
      );
      if (tweenText) {
        tweenText.setPosition(this.hero.x, this.hero.y - this.hero.height / 2);
        tweenText.popUpNumberIcon(energy, BaseSceneString.EnergyIcon);
      }
    }

    // 更新魔力顯示
    this.guiDialog.updateEnergyBar(this.currentEnergy, this.testSettingData.maxEnergy);
  }

  /** 改變分數
   * @param score 要改變的量
   */
  private updateScore(score: number): void {
    // 限制分數區間
    this.scoreCount += score;
    this.scoreCount = Math.max(this.scoreCount, 0);

    // 更新分數顯示
    this.guiDialog.updateScoreCount(this.scoreCount, this.testSettingData.targetScore);
  }
  //#endregion

  //#region 操控
  /** 使用道具
   * @param item 道具
   */
  public useItem(item: TestItem): void {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false) {
      return;
    }

    switch (item.itemData.itemFunction) {
      case TestItemFunction.DropFish:
        this.useDropFishItem(item);
        break;
      case TestItemFunction.SpeedUp:
        this.useSpeedUpItem(item);
        break;
      case TestItemFunction.Invincible:
        this.useInvincibleItem(item);
        break;
      case TestItemFunction.FishingNet:
        this.useFishingNetItem(item);
        break;
    }
  }

  /** 使用加速道具
   * @param item 道具
   */
  private useSpeedUpItem(item: TestItem): void {
    // 如果處於加速狀態則返回
    if (this.hero.isSpeedUp) {
      return;
    }
    // 使用道具
    item.useItem();
    // 英雄進入加速狀態
    this.itemDialog.setCountDownPendingUntil(item, item.itemData.duration, this.hero.onSpeedUp(item.itemData));
  }

  /** 使用身體強化道具
   * @param item 道具
   */
  private useInvincibleItem(item: TestItem): void {
    // 如果處於強化狀態則返回
    if (this.hero.isInvincible) {
      return;
    }
    // 使用道具
    item.useItem();
    // 英雄進入無敵狀態
    this.itemDialog.setCountDownPendingUntil(item, item.itemData.duration, this.hero.onInvincible(item.itemData));
  }

  /** 使用傾盆大魚道具
   * @param item 道具
   */
  private useDropFishItem(item: TestItem): void {
    // 如果處於傾盆大魚狀態則返回
    if (this.fishPool.isDropMode) {
      return;
    }
    // 使用道具
    item.useItem();
    // 進入下傾盆大魚狀態
    this.itemDialog.setCountDownPendingUntil(item, item.itemData.duration, this.fishPool.drop(item.itemData));
  }

  /** 使用漁網道具
   * @param item 道具
   */
  private async useFishingNetItem(item: TestItem): Promise<void> {
    // 如果未處於移動狀態則返回
    if (this.hero.isMove === false) {
      return;
    }
    // 使用道具
    item.useItem();
    // 英雄使用漁網
    this.hero.castNet(item);
    item.setBlock(true);
    await this.itemDialog.setHighlightPendingUntil(
      item,
      AsyncHelper.pendingUntil(() => this.hero.isMove === true)
    );
    item.setBlock(false);
  }

  /** 點擊玩家位置以下時可發射魚鉤 */
  public heroCast(): void {
    this.hero.cast();
  }
  //#endregion
}
