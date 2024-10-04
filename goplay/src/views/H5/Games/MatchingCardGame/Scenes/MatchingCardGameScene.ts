import {
  MatchingCardAudioType,
  MatchingCardDepth,
  MatchingCardDifficulty,
  MatchingCardItemFunction,
  MatchingCardNumber,
  MatchingCardObstructType,
  MatchingCardString,
} from '../Data/MatchingCardConfig';
import UIManager from '../../../Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import MatchingCardBackgroundDialog from '../Dialogs/MatchingCardBackgroundDialog';
import MatchingCardGuiDialog from '../Dialogs/MatchingCardGuiDialog';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import MatchingGameCard from '../Component/MatchingGameCard';
import TableManager, {
  BossItemData,
  MatchingCardItemData,
  MatchingCardObstructData,
  MatchingCardPatternData,
  MatchingCardSettingData,
} from '@/manager/TableManager';
import { MatchingCardGameData } from '../Data/MatchingCardInterface';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { Align } from '@/views/H5/Helper/MathHelper';
import ItemDialog from '../../UIHelper/ItemDialog';
import PhaserHelper, { Size } from '@/views/H5/Helper/PhaserHelper';
import MatchingCardItemBtn from '../Component/MatchingCardItemBtn';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import { matchingCardImgUrl } from '../Data/MatchingCardResource';
import { MatchingCardBuff } from '../Component/MatchingCardBuff';
import bossImgPath from '@/config/imgPath/_boss';
import SoundPool from '../../Common/SoundPool';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import { ContestPlayerData, MatchingCardGameLog, TotalProps } from '@/helper/interface/Game';
import { GameType } from '@/helper/enum/Common';
import { MatchingCardGainEnergyPopUpTween, MatchingCardPenaltyPopUpTween } from '../Component/MatchingCardPopUpTween';

type Vector2 = Phaser.Math.Vector2;
type Sprite = Phaser.GameObjects.Sprite;

/** 翻翻牌 小遊戲-主場景 */
export default class MatchingCardGameScene extends BaseGameScene implements IAnswerGame {
  /** 遊戲狀態機 */
  private gameFSM!: AnswerGameFSM;

  //#region readonly
  /** 道具ui位置 */
  private readonly itemDialogPosition: Vector2 = new Phaser.Math.Vector2(400, 560);
  /** 道具ui-縮放 */
  private readonly itemDialogScale: number = 0.85;

  /** 開局洗牌時，卡牌集中位置 */
  private readonly openingShuffleCenterPosition: Vector2 = new Phaser.Math.Vector2(512, 256);
  /** 上方提示文字 */
  private readonly openingShuffleTextKey: string = 'matchingCard_openingShuffle';

  /** 每一波次的難度資料 */
  private readonly waveDifficultyList: MatchingCardDifficulty[] = [
    MatchingCardDifficulty.Easy,
    MatchingCardDifficulty.Normal,
    MatchingCardDifficulty.Normal,
    MatchingCardDifficulty.Normal,
    MatchingCardDifficulty.Hard,
    MatchingCardDifficulty.Hard,
  ];

  /** 卡片排列方式資料 */
  private readonly cardLayoutDataList: Vector2[][] = [
    // 4張
    [
      new Phaser.Math.Vector2(512 - 150, 242),
      new Phaser.Math.Vector2(512 - 50, 242),
      new Phaser.Math.Vector2(512 + 50, 242),
      new Phaser.Math.Vector2(512 + 150, 242),
    ],
    // 8張
    [
      // line1
      new Phaser.Math.Vector2(512 - 186, 170),
      new Phaser.Math.Vector2(512 - 62, 170),
      new Phaser.Math.Vector2(512 + 62, 170),
      new Phaser.Math.Vector2(512 + 186, 170),
      // line2
      new Phaser.Math.Vector2(512 - 186, 300),
      new Phaser.Math.Vector2(512 - 62, 300),
      new Phaser.Math.Vector2(512 + 62, 300),
      new Phaser.Math.Vector2(512 + 186, 300),
    ],
    // 12張
    [
      // line1
      new Phaser.Math.Vector2(512 - 186, 88),
      new Phaser.Math.Vector2(512 - 62, 88),
      new Phaser.Math.Vector2(512 + 62, 88),
      new Phaser.Math.Vector2(512 + 186, 88),
      // line2
      new Phaser.Math.Vector2(512 - 186, 224),
      new Phaser.Math.Vector2(512 - 62, 224),
      new Phaser.Math.Vector2(512 + 62, 224),
      new Phaser.Math.Vector2(512 + 186, 224),
      // line3
      new Phaser.Math.Vector2(512 - 186, 362),
      new Phaser.Math.Vector2(512 - 62, 362),
      new Phaser.Math.Vector2(512 + 62, 362),
      new Phaser.Math.Vector2(512 + 186, 362),
    ],
    // 16張
    [
      // line1
      new Phaser.Math.Vector2(512 - 248, 88),
      new Phaser.Math.Vector2(512 - 124, 88),
      new Phaser.Math.Vector2(512, 88),
      new Phaser.Math.Vector2(512 + 124, 88),
      new Phaser.Math.Vector2(512 + 248, 88),
      // line2
      new Phaser.Math.Vector2(512 - 310, 220),
      new Phaser.Math.Vector2(512 - 186, 220),
      new Phaser.Math.Vector2(512 - 62, 220),
      new Phaser.Math.Vector2(512 + 62, 220),
      new Phaser.Math.Vector2(512 + 186, 220),
      new Phaser.Math.Vector2(512 + 310, 220),
      // line3
      new Phaser.Math.Vector2(512 - 248, 353),
      new Phaser.Math.Vector2(512 - 124, 353),
      new Phaser.Math.Vector2(512, 353),
      new Phaser.Math.Vector2(512 + 124, 353),
      new Phaser.Math.Vector2(512 + 248, 353),
    ],
  ];

  /** 自動解鎖手指動畫 位置 */
  private readonly unlockHandSpritePosition: Vector2 = new Phaser.Math.Vector2(30, 15);
  /** 自動解鎖手指動畫 秒數 */
  private readonly unlockHandSpriteSec: number = 0.5;
  /** 自動解鎖手指動畫 縮放比率 */
  private readonly unlockHandSpriteScaleRate: number = 0.5;

  //#endregion readonly

  //#region 主要變數、元件
  /** 遊戲參數 */
  public gameSetting!: MatchingCardSettingData;
  /** 魔王靜態表 */
  private bossTableData!: BossItemData[];
  /** 英雄圖片key清單 */
  private heroImageKeyList: string[] = [];

  /** 模式資料 */
  private patternDataList: MatchingCardPatternData[] = [];
  /** 干擾ID清單 */
  private obstructIDList: number[] = [];
  /** 出現干擾的機率 */
  private obstructRate: number = 0;
  //#endregion 主要變數、元件

  //#region 一般變數、元件
  /** 背景 */
  private bgDialog!: MatchingCardBackgroundDialog;
  /** Gui */
  private guiDialog!: MatchingCardGuiDialog;

  /** 道具介面 */
  private itemDialog!: ItemDialog<MatchingCardItemBtn>;

  /** 卡牌物件池 */
  private cardPool!: Phaser.GameObjects.Group;
  /** 上浮文字動畫-獲得能量 */
  private gainEnergyTweenTextGroup!: Phaser.GameObjects.Group;
  /** 上浮文字動畫-配對失敗能量處罰 */
  private penaltyEnergyTweenTextGroup!: Phaser.GameObjects.Group;
  /** 自動解鎖手指連續圖 物件池 */
  private unlockHandSpriteGroup!: Phaser.GameObjects.Group;

  /** 目前翻開卡牌 */
  private currentOpenCard?: MatchingGameCard;
  /** 目前波次索引 (0:第一波) */
  private currentWaveIndex = 0;
  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 允許玩家輸入 */
  private isAllowInput: boolean = false;

  /** 能量數 */
  private currentEnergy: number = 0;
  /** 玩家配對正確數 */
  private matchCount: number = 0;
  /** 每秒能量扣減量 */
  private energyConsumption: number = 0;
  /** 避免配對失敗處罰額度 */
  private avoidNotMatchPenaltyQuota: number = 0;

  /** 英雄道具能力清單 */
  private heroBuffMap: Map<MatchingCardItemFunction, MatchingCardBuff> = new Map<
    MatchingCardItemFunction,
    MatchingCardBuff
  >();

  /** 放飛敵人，略過攻擊 */
  private isExileEnemy: boolean = false;

  /** 翻牌秒數 */
  private flipCardSecond: number = 0;

  /** 音效池
   * key: 音效類型 MatchingCardAudioType */
  private audioMap: Map<string, SoundPool> = new Map();

  /** 判斷遊戲是否該結束 */
  public get isGameEnd(): boolean {
    // 沒有能量了 或 遊戲遊戲結束
    return this.currentEnergy <= 0 || this.isTimeOut;
  }

  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    return this.currentEnergy <= this.gameSetting.reviveEnergy || this.isReviveTime;
  }

  /** 取得使用中的牌組 */
  private get activeDeck(): MatchingGameCard[] {
    return this.cardPool.getMatching('active', true);
  }
  //#endregion 一般變數、元件

  //#region constructor、Phaser hook(不用加回傳值、屬性)
  constructor(private gameData: MatchingCardGameData, private gameWeb: IAnswerWeb) {
    super({ key: 'MatchingCardGameScene' });
    this.gameFSM = new AnswerGameFSM(this, gameWeb);
  }

  preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);

    // 卡牌圖片: 用英雄靜態表載入英雄卡片圖
    TableManager.hero
      .getAll()
      .slice(0, 18)
      .forEach((heroData) => {
        // 把全部英雄的圖片key存起來
        const imageKey = `${MatchingCardString.CardHeroImageKey}${heroData.nameKey}`;
        this.heroImageKeyList.push(imageKey);

        // 載入翻翻牌專用的英雄卡牌圖
        this.load.image(imageKey, `${HeroManager.getHeroImgUrlByHeroId(heroData.id, HeroImgType.MatchingCard)}`);
      });

    // 目前選擇英雄
    const heroID = this.gameData.heroListData.heroId;

    // 用戶選擇的英雄: 載入英雄圖片
    this.load.image(
      MatchingCardString.HeroImageKey,
      `${HeroManager.getHeroImgUrlByHeroId(heroID, HeroImgType.Default)}`,
    );

    // 魔王靜態表
    this.bossTableData = TableManager.boss.getAll();

    // 載入魔王全身圖
    this.bossTableData.forEach((bossData) => {
      this.load.image(
        bossData.bossNameKey,
        PhaserHelper.ensureVersionedResourceUrl(`${bossImgPath.bossBaseUrl}${bossData.imgUrl}.png`),
      );
    });

    // 載入道具圖片
    TableManager.matchingCardItem.getAll().forEach((data) => {
      this.load.image(data.nameKey, `${matchingCardImgUrl}/${data.url}`);
    });

    // 靜態表: 模式資料
    this.patternDataList = TableManager.matchingCardPattern.getAll();
  }

  create() {
    // 載入遊戲參數
    const foundGameSetting = TableManager.matchingCardSetting.findOne(1);
    if (foundGameSetting == null) {
      console.error('matchingCardSetting 載入失敗');
      return;
    }
    this.gameSetting = foundGameSetting;

    // 設定能量最大值
    this.currentEnergy = this.gameSetting.maxEnergyAmount;
    // 能量值基礎消耗
    this.energyConsumption = this.gameSetting.baseConsumption;
    // 翻卡牌秒數 = 基本秒數
    this.flipCardSecond = MatchingCardNumber.FlipCardSecond;

    // 補滿 避免配對失敗處罰 額度
    this.avoidNotMatchPenaltyQuota = this.gameSetting.avoidNotMatchPenaltyQuota;

    // 開啟Dialog
    this.setDialog();

    // 建立卡牌物件池
    this.cardPool = this.add.group({
      classType: MatchingGameCard,
      runChildUpdate: true,
    });

    // 設置表演文字群組
    this.gainEnergyTweenTextGroup = this.add.group({
      classType: MatchingCardGainEnergyPopUpTween,
      maxSize: 10,
    });
    this.penaltyEnergyTweenTextGroup = this.add.group({
      classType: MatchingCardPenaltyPopUpTween,
      maxSize: 10,
    });
    // 自動解鎖手指連續圖 物件池
    this.unlockHandSpriteGroup = this.add.group({
      classType: Phaser.GameObjects.Sprite,
      maxSize: 10,
    });

    // 設置音效池
    this.setSoundPools();

    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  /** 不論是否進遊戲，一定會執行 */
  fixedUpdate(time: number, delta: number) {
    // 更新遊戲狀態機
    this.gameFSM.update(delta);
  }

  onGameUpdate(delta: number): void {
    // 更新buff秒數
    this.heroBuffMap.forEach((buff) => {
      buff.update(delta);
    });
  }

  /** 設定Dialog */
  private async setDialog(): Promise<void> {
    // 開啟背景
    this.bgDialog = UIManager.instance.openDialog(MatchingCardBackgroundDialog, this);
    this.bgDialog.setDepth(MatchingCardDepth.Bg);

    // 開啟主ui
    this.guiDialog = UIManager.instance.openDialog(MatchingCardGuiDialog, this);
    this.guiDialog.setDepth(MatchingCardDepth.Gui);

    // 取得目前選擇英雄的靜態表
    const heroTableData = TableManager.hero.findOne(this.gameData.heroListData.heroId);
    if (heroTableData == null) {
      console.error(`setDialog: heroTableData == null. heroId=${this.gameData.heroListData.heroId}`);
      return;
    }
    // 記錄用戶選擇的英雄的位置
    const heroPosition = new Phaser.Math.Vector2(
      heroTableData.matchingCardHeroImageLeft + MatchingCardNumber.HeroSpriteOffsetPosition,
      heroTableData.matchingCardHeroImageTop + MatchingCardNumber.HeroSpriteOffsetPosition,
    );

    // 初始化ui
    this.guiDialog.init(this.gameSetting, heroPosition);
    this.guiDialog.depth = MatchingCardDepth.GuiDialog;

    // 建立道具介面
    this.itemDialog = UIManager.instance.openDialog<ItemDialog<MatchingCardItemBtn>>(ItemDialog, this);
    this.itemDialog.setDepth(MatchingCardDepth.ItemDialog);
    this.itemDialog.setScale(this.itemDialogScale);
    // 初始道具ui
    this.itemDialog.init(
      TableManager.matchingCardItem.getAll(),
      { width: 60, height: 60 } as Size,
      this.itemDialogPosition,
      Align.LeftCenter,
    );

    // 加入快閃店購買的道具
    await this.itemDialog.addItems(this.gameData.totalProps, MatchingCardItemBtn, this.useItem.bind(this));
    // 設定全部道具按鍵圖
    this.itemDialog.setAllKeyImage();
  }

  /** 設置音效池 */
  private setSoundPools(): void {
    // 取得ENUM名稱清單 (不是number的元素)
    const enumNameList = Object.keys(MatchingCardAudioType).filter((v) => isNaN(Number(v)));

    // 建立每一個音效的物件池
    enumNameList.forEach((audioType) => {
      // 將音效enum轉字串後，建立音效池，存入map
      this.audioMap.set(audioType, new SoundPool(this, audioType));
    });
  }
  //#endregion constructor

  //#region 狀態機
  /** 遊戲開場 */
  public async onOpeningEnter(): Promise<void> {
    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();

    // 設置能量流逝事件
    this.time.addEvent({
      /** 每隔1秒 */
      delay: 1000,
      /** 能量流逝 */
      callback: () => {
        // 更新能量值
        this.updateEnergy(-1 * this.energyConsumption, false, Phaser.Math.Vector2.ZERO);
      },
      callbackScope: this,
      /** 不斷重複 */
      repeat: -1,
    });

    // 下一波次
    this.nextWave();
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 開啟Timer計時
    this.setTimerDialog(this.gameSetting.totalGameTimeSec, MatchingCardDepth.Gui);
    // 設置Timer事件
    this.setTimerEvent(
      // 時間到，遊戲結束
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
      ]),
    );
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
    await this.itemDialog.addItems(rewardProp, MatchingCardItemBtn, this.useItem.bind(this));
    // 繼續背景音樂
    this.bgm?.resume();
    // 所有場景暫停繼續
    this.resumeScene();
  }

  /** 結束遊戲 */
  public onEndingEnter(): ContestPlayerData {
    // 設定結算資料
    const gameLog: MatchingCardGameLog = {
      // 總分 = 配對成功對數 * 配對成功獲得分數
      gameScore: this.matchCount * this.gameSetting.cardMatchScore,
      gameMode: GameType.WebMatchingCard,
      browser: navigator.userAgent,
      killCount: this.matchCount,
    };

    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: this.matchCount >= this.gameSetting.targetMatchCount,
      webGameLog: gameLog,
    };
  }
  //#endregion 狀態機

  //#region 遊戲相關(邏輯、表演等)

  /** 下一波次 */
  private async nextWave(): Promise<void> {
    // 抽選模式資料
    const patternData = this.drawOutPatternData();

    // 依卡片數量，取得對應的 卡片排列方式資料
    const cardPositionList = this.cardLayoutDataList.find(
      (positionList) => positionList.length === patternData.cardCount,
    );
    // 防呆
    if (cardPositionList == null) {
      console.error(`nextWave: cardPositionList == null. cardCount=${patternData.cardCount}`);
      return;
    }

    // 設定干擾
    this.obstructIDList = patternData.obstructIDList;
    this.obstructRate = patternData.obstructRate;

    // 設定敵人
    this.setEnemy();
    // 取消放飛敵人
    this.isExileEnemy = false;

    // 生成全部卡牌
    const cardDeck = this.initAllCard(patternData, cardPositionList);

    // 顯示波次提示
    await this.guiDialog.showWavePrompt(this.currentWaveIndex);

    // 開始作答，覆蓋全部卡牌
    await this.coverAllCard(cardDeck);

    // 開局洗牌
    await this.openingShuffleCard(cardPositionList, cardDeck);

    // 允許玩家輸入
    this.isAllowInput = true;
  }

  /** 抽選模式資料 */
  private drawOutPatternData(): MatchingCardPatternData {
    let difficultyType: MatchingCardDifficulty = MatchingCardDifficulty.None;
    // 波次索引 超過 難度資料時，取最後一筆
    if (this.currentWaveIndex >= this.waveDifficultyList.length) {
      difficultyType = this.waveDifficultyList[this.waveDifficultyList.length - 1];
    }
    // 否則，取目前波次 的 難度資料
    else {
      difficultyType = this.waveDifficultyList[this.currentWaveIndex];
    }

    // 過濾出指定難度的模式資料
    const filterPatternList = this.patternDataList.filter((pattern) => pattern.difficulty === difficultyType);
    // 抽選一筆模式資料
    return Phaser.Math.RND.pick(filterPatternList);
  }

  /** 設定敵人 */
  private setEnemy(): void {
    // 抽選魔王
    const bossData = Phaser.Math.RND.pick(this.bossTableData);
    // 防呆
    if (bossData == null) {
      console.error(`setEnemy: bossData == null`);
      return;
    }

    // 設定敵人資料
    this.guiDialog.setEnemy(bossData);

    // 敵人凍結中
    const frozenBuff = this.heroBuffMap.get(MatchingCardItemFunction.FrozenEnemy);
    if (frozenBuff && frozenBuff.isActive) {
      // 提前結束凍結敵人buff (扣光剩餘時間)
      frozenBuff.clearBuff();
    }
  }

  /** 生成全部卡牌
   * @param patternData 模式資料
   * @param cardPositionList 卡牌位置清單
   */
  private initAllCard(patternData: MatchingCardPatternData, cardPositionList: Vector2[]): MatchingGameCard[] {
    // 將hero圖片key打亂
    Phaser.Math.RND.shuffle(this.heroImageKeyList);

    // 防呆
    if (patternData.cardCount % 2 !== 0) {
      console.error(`initAllCard: cardCount can't be odd. patternData.id=${patternData.id}`);
      return [];
    }

    // 需要的花色清單
    const cardTypeList = this.heroImageKeyList.slice(0, patternData.cardTypeCount);
    // 內容物圖片的清單
    const contentImageKeyList: string[] = [];
    let cardTypeIndex = 0;
    for (let i = 0; i < patternData.cardCount; i += 2) {
      // 放入2張牌
      const cardType = cardTypeList[cardTypeIndex];
      contentImageKeyList.push(...[cardType, cardType]);
      // 下一個花色, 循環
      cardTypeIndex = (cardTypeIndex + 1) % patternData.cardTypeCount;
    }
    // 排序花色
    contentImageKeyList.sort();

    // 生成card (全部照順序生成 ex:1111222233334444)
    const cardList: MatchingGameCard[] = [];
    for (let cardIndex = 0; cardIndex < contentImageKeyList.length; cardIndex++) {
      const card = this.spawnCard(
        cardPositionList[cardIndex].x,
        cardPositionList[cardIndex].y,
        contentImageKeyList[cardIndex],
      );
      if (card == null) {
        console.error(`initAllCard: card==null`);
        continue;
      }
      cardList.push(card);
    }

    return cardList;
  }

  /** 生成卡牌
   * @param x 位置x
   * @param y 位置y
   * @param contentImageKey 內容物圖片key
   */
  private spawnCard(x: number, y: number, contentImageKey: string): MatchingGameCard | undefined {
    // 從卡牌物件池取出物件
    const card: MatchingGameCard = this.cardPool.get(x, y);
    if (card == null) {
      console.error(`spawnCard: card == null`);
      return;
    }

    // 設定卡牌資料
    card.setInfo(contentImageKey);
    return card;
  }

  /** 覆蓋全部卡牌
   * @param cardDeck 全部卡牌
   */
  private async coverAllCard(cardDeck: MatchingGameCard[]): Promise<void> {
    // 蓋牌音效
    this.playAudio(MatchingCardAudioType.CoverCardSound);

    // 取得使用中的牌, 播放覆蓋卡牌動畫, 等待全部動畫結束
    await Promise.all(
      cardDeck.map<Promise<void>>((card: MatchingGameCard) => card.playFlipAnimation(false, this.flipCardSecond)),
    );
  }

  /** 開局洗牌
   * @param cardPositionList 卡牌位置清單
   * @param cardDeck 全部卡牌
   */
  private async openingShuffleCard(cardPositionList: Vector2[], cardDeck: MatchingGameCard[]): Promise<void> {
    // 播放上方提示-開局洗牌
    this.guiDialog.playTopTextPopUpHintLayout(this.openingShuffleTextKey);

    // 集中卡牌音效
    this.playAudio(MatchingCardAudioType.MoveCardSound);

    // 先把全部card移到中間, 等待全部動畫結束
    await Promise.all(
      cardDeck.map<Promise<void>>((card: MatchingGameCard) =>
        card.playMoveAnimation(this.openingShuffleCenterPosition),
      ),
    );

    // 排列卡牌音效
    this.playAudio(MatchingCardAudioType.MoveCardSound);

    // 打亂卡牌位置
    const shufflePositionList = Phaser.Math.RND.shuffle([...cardPositionList]);

    // 再把card移到每一個卡片配置位置
    const promiseList: Array<Promise<void>> = [];
    cardDeck.forEach((card: MatchingGameCard) => {
      // 取得卡牌位置，並刪除
      const cardPosition = shufflePositionList.pop();
      if (cardPosition == null) {
        console.error(`openingShuffleCard: cardPosition is null.`);
        return;
      }

      // 將卡牌移到正確位置
      promiseList.push(card.playMoveAnimation(cardPosition));
    });

    // 等待全部動畫結束
    await Promise.all(promiseList);
  }

  /** 玩家點擊卡牌的卡背，進行翻牌
   * @param card 卡牌
   */
  public async onClickCardBack(card: MatchingGameCard): Promise<void> {
    // 允許玩家輸入，才能翻牌
    if (this.isAllowInput === false) {
      return;
    }

    // 嘗試翻開卡片
    if (card.tryOpenCard() === false) {
      return;
    }

    // 不允許玩家輸入
    this.isAllowInput = false;

    // 翻開牌音效
    this.playAudio(MatchingCardAudioType.ClickOpenCardSound);

    // 播放翻開卡牌動畫
    await card.playFlipAnimation(true, this.flipCardSecond);

    // 若 未記錄牌，就是翻第一張
    if (this.currentOpenCard == null) {
      // 記錄第一張卡
      this.currentOpenCard = card;
    }
    // 若 有記錄牌，就是翻第二張
    else {
      // 比對2張卡牌內容物
      // 配對成功
      if (this.currentOpenCard.contentImageKey === card.contentImageKey) {
        // 表演成功
        await this.onContentMatch(this.currentOpenCard, card);

        // 若沒有有效牌了，到下一波次
        if (this.cardPool.getTotalUsed() === 0) {
          // 累加波次
          this.currentWaveIndex++;
          // 下一波次
          await this.nextWave();
        }
      }
      // 配對失敗
      else {
        // 表演失敗
        await this.onContentNotMatch(this.currentOpenCard, card);

        // 配對失敗，有 避免配對失敗處罰 額度時
        if (this.avoidNotMatchPenaltyQuota > 0) {
          // 不扣能量，扣額度
          this.avoidNotMatchPenaltyQuota--;
          // 顯示 避免配對失敗處罰 額度
          this.guiDialog.showAvoidNotMatchPenaltyQuota(this.avoidNotMatchPenaltyQuota);
        }
        // 沒有 避免配對失敗處罰 額度時
        else {
          // 扣能量
          this.updateEnergy(this.gameSetting.cardNotMatchLossEnergy, true, card.cardPosition);
          // 換敵人回合
          await this.onEnemyTurn();
        }
      }

      // 清除已翻牌記綠
      this.currentOpenCard = undefined;
    }

    // 允許玩家輸入
    this.isAllowInput = true;
  }

  /** 當開啟的內容物類型相同
   * @param firstCard 第一張卡牌
   * @param secondCard 第二張卡牌
   */
  private async onContentMatch(firstCard: MatchingGameCard, secondCard: MatchingGameCard): Promise<void> {
    // 配對成功音效
    this.playAudio(MatchingCardAudioType.CardMatchSound);

    // 玩家配對成功, 獲得能量 (在第二張卡播放)
    this.updateEnergy(this.gameSetting.cardMatchGainEnergy, true, secondCard.cardPosition);

    // 卡牌配對成功動畫, 等待全部動畫結束
    await Promise.all([firstCard.playMatchAnimation(), secondCard.playMatchAnimation()]);

    // 回收牌: 返回物件池
    this.cardPool.killAndHide(firstCard);
    this.cardPool.killAndHide(secondCard);

    // 累加 配對正確數
    this.matchCount++;
    // 更新目標顯示
    this.guiDialog.updateTargetCount(this.matchCount, this.gameSetting.targetMatchCount);

    // 配對正確數<5組時，每秒消耗10魔力。配對正確數>5且<10時，每秒消耗15能量。依此類推，每多配對5組，每秒消耗能量值就+5。
    // 先算能量耗損加乘的區段
    const multiply = Math.floor(this.matchCount / this.gameSetting.matchCountGap);
    // 加乘的能量耗損量
    const multiplyConsumption = multiply * this.gameSetting.progressiveConsumption;
    // 加總最終能量耗損量
    this.energyConsumption = this.gameSetting.baseConsumption + multiplyConsumption;
  }

  /** 當開啟的內容物類型不同
   * @param firstCard 第一張卡牌
   * @param secondCard 第二張卡牌
   */
  private async onContentNotMatch(firstCard: MatchingGameCard, secondCard: MatchingGameCard): Promise<void> {
    // 配對失敗音效
    this.playAudio(MatchingCardAudioType.CardNotMatchSound);

    // 配對失敗後等待時間
    await AsyncHelper.sleep(this.gameSetting.notMatchWaitSecond);

    // 蓋牌音效
    this.playAudio(MatchingCardAudioType.CoverCardSound);

    // 播放覆蓋卡牌動畫, 等待全部動畫結束
    await Promise.all([
      firstCard.playFlipAnimation(false, this.flipCardSecond),
      secondCard.playFlipAnimation(false, this.flipCardSecond),
    ]);
  }

  /** 切換敵人回合 */
  private async onEnemyTurn(): Promise<void> {
    // 放飛敵人/凍結敵人，略過攻擊
    if (this.isExileEnemy || this.isHeroBuffActive(MatchingCardItemFunction.FrozenEnemy)) {
      return;
    }

    // 未觸發干擾，跳過
    if (Math.random() > this.obstructRate) {
      return;
    }

    // 由模式資料的干擾清單，抽選出干擾ID
    const obstructID = Phaser.Math.RND.pick(this.obstructIDList);

    // 找出干擾資料
    const obstructData = TableManager.matchingCardObstruct.findOne(obstructID);
    // 防呆
    if (obstructData == null) {
      console.error(`toEnemyTurn: obstructData is null.`);
      return;
    }

    // 佇列播放敵人攻擊動畫
    this.guiDialog.enqueueEnemyAttackAnimation(obstructData.obstructType);

    // 判掉干擾方式
    switch (obstructData.obstructType) {
      // 洗牌
      case MatchingCardObstructType.Shuffle:
        await this.enemyShuffleCard(obstructData);
        break;
      // 上鎖
      case MatchingCardObstructType.Lock:
        // 敵人放置卡片干擾物
        this.enemyPlaceObstacle(obstructData);
        break;
      // 未定義的干擾
      default:
        console.error(`toEnemyTurn: undefine. obstructType=${obstructData.obstructType}`);
        break;
    }
  }

  /** 敵人洗牌
   * @param obstructData 干擾資料
   */
  private async enemyShuffleCard(obstructData: MatchingCardObstructData): Promise<void> {
    // 對使用中牌堆清除干擾物
    this.activeDeck.forEach((card) => {
      card.removeObstacle();
    });

    // 移動卡牌音效
    this.playAudio(MatchingCardAudioType.MoveCardSound);

    // 將使用中的牌堆洗牌
    const shuffleDeck = Phaser.Math.RND.shuffle(this.activeDeck);

    // 保留第0張的位置
    const firstCardPos = shuffleDeck[0].cardPosition;

    // 先取min為total count
    const totalCount = Math.min(obstructData.obstructCardCount, shuffleDeck.length);

    // 以 干擾資料定義的洗牌張數 為執行次數，把來源卡片移動到目標卡片位置
    const promiseList: Array<Promise<void>> = [];
    for (let index = 0; index < totalCount; index++) {
      // 取得來源卡片
      const sourceCard = shuffleDeck[index];
      // 最後一張的目標是第一張
      if (index + 1 === totalCount) {
        promiseList.push(sourceCard.playMoveAnimation(firstCardPos));
      }
      // 其他牌目標是下一張
      else {
        const targetCard = shuffleDeck[index + 1];
        // 播放交換卡牌位置動畫
        promiseList.push(sourceCard.playMoveAnimation(targetCard.cardPosition));
      }
    }

    // 等待全部動畫結束
    await Promise.all(promiseList);
  }

  /** 敵人放置卡片干擾物
   * @param obstructData 干擾資料
   */
  private enemyPlaceObstacle(obstructData: MatchingCardObstructData): void {
    // 敵人上鎖卡牌音效
    this.playAudio(MatchingCardAudioType.LockCardSound);

    // 將使用中牌堆，打亂順序
    const shuffleDeck = Phaser.Math.RND.shuffle(this.activeDeck);

    // 先取min為total count
    const totalCount = Math.min(obstructData.obstructCardCount, shuffleDeck.length);

    // 在卡片設置負面狀態
    for (let index = 0; index < totalCount; index++) {
      shuffleDeck[index].setObstacle(obstructData);
    }
  }

  /** 使用道具
   * @param item 道具
   */
  private async useItem(item: MatchingCardItemBtn): Promise<void> {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false) {
      return;
    }

    // 允許玩家輸入, 才能使用
    if (this.isAllowInput === false) {
      return;
    }

    // 同類型item效果持續時間未結束，不能再使用同類型item
    if (this.isHeroBuffActive(item.itemData.itemFunction)) {
      return;
    }

    // 檢查物品功能
    if (this.checkItemFunction(item.itemData) === false) {
      return;
    }

    // 使用道具 (回傳true:使用成功)
    if (item.useItem() === false) {
      return;
    }

    // 點擊icon使用道具音效
    this.playAudio(MatchingCardAudioType.ClickItemIconSound);

    // 使用物品立即型功能
    this.useItemFunction(item.itemData);

    // 使用道具後加入buff，以進行倒數
    const heroBuff = this.addItemBuff(item);

    // 持續時間結束時
    await AsyncHelper.pendingUntil(() => heroBuff.isActive === false);

    // buff結束，清除附加能力
    // 解除翻牌加速效果
    if (item.itemData.itemFunction === MatchingCardItemFunction.FlipSpeedUp) {
      // 翻卡牌秒數 = 基本秒數
      this.flipCardSecond = MatchingCardNumber.FlipCardSecond;
    }
  }

  /** 檢查英雄buff啟用中
   * @param itemFunction 物品功能類型
   */
  private isHeroBuffActive(itemFunction: MatchingCardItemFunction): boolean {
    return this.heroBuffMap.get(itemFunction)?.isActive ?? false;
  }

  /** 檢查物品功能
   * @param itemData 物品資料
   * @returns false:中止執行功能
   */
  private checkItemFunction(itemData: MatchingCardItemData): boolean {
    switch (itemData.itemFunction) {
      // 自動解鎖
      case MatchingCardItemFunction.Unlock: {
        // 取得使用中的牌, 再找出被鎖的牌
        const lockCardList = this.activeDeck.filter((card) => card.obstructType !== MatchingCardObstructType.None);

        // 沒有鎖牌時，中止
        if (lockCardList.length === 0) {
          return false;
        }
        return true;
      }

      // 偷偷瞄牌
      case MatchingCardItemFunction.SeeThrough:
        return true;

      // 凍結敵人
      case MatchingCardItemFunction.FrozenEnemy:
        // 已放飛，中止
        if (this.isExileEnemy) {
          return false;
        }
        return true;

      // 放飛太空
      case MatchingCardItemFunction.ExileEnemy:
        // 已放飛，中止
        if (this.isExileEnemy) {
          return false;
        }

        // 已凍結敵人，中止
        if (this.isHeroBuffActive(MatchingCardItemFunction.FrozenEnemy)) {
          return false;
        }
        // 凍結冷卻中，可以使用放飛
        return true;

      // 速戰速決
      case MatchingCardItemFunction.FlipSpeedUp:
        return true;

      default:
        console.error(`checkItemFunction: undefine. itemFunction=${itemData.itemFunction}`);
        return false;
    }
  }

  /** 使用物品立即型功能
   * @param itemData 物品資料
   */
  private useItemFunction(itemData: MatchingCardItemData): void {
    switch (itemData.itemFunction) {
      // 自動解鎖
      case MatchingCardItemFunction.Unlock:
        // 只要清除卡牌buff，不用hero buff
        this.removeObstacleByItem(itemData.value);
        break;

      // 偷偷瞄牌
      case MatchingCardItemFunction.SeeThrough:
        // card播半透明動畫，用hero buff擋cd時間
        this.playSeeThroughAnimation(itemData);
        break;

      // 凍結敵人
      case MatchingCardItemFunction.FrozenEnemy:
        // 已加入hero buff，擋cd時間
        // 播放敵人凍結動畫
        this.guiDialog.playFrozenEnemyAnimation(itemData.duration);
        break;

      // 放飛太空
      case MatchingCardItemFunction.ExileEnemy: {
        // 放飛敵人
        this.isExileEnemy = true;
        // 播放放飛敵人動畫
        this.guiDialog.playExileEnemyAnimation();
        break;
      }

      // 速戰速決
      case MatchingCardItemFunction.FlipSpeedUp:
        // 播放上方提示-使用道具
        this.guiDialog.playTopIconPopUpHintLayout(itemData.nameKey);

        // 翻卡牌秒數 = 基本秒數+道具加速 (用hero buff擋cd時間)
        this.flipCardSecond = MatchingCardNumber.FlipCardSecond + itemData.value;
        // 播放翻牌加速動畫
        this.guiDialog.showFlipSpeedUp(itemData.duration);
        break;

      default:
        console.error(`useItemFunction: undefine. itemFunction=${itemData.itemFunction}`);
        break;
    }
  }

  /** 使用物品清除卡片干擾物
   * @param removeCount 清除數量
   */
  private async removeObstacleByItem(removeCount: number): Promise<void> {
    // 從使用中牌堆中，過濾出被干擾的牌
    const filterDeck = this.activeDeck.filter((card) => card.obstructType === MatchingCardObstructType.Lock);
    // 打亂順序
    const shuffleDeck = Phaser.Math.RND.shuffle(filterDeck);

    // 先取min為total count
    const totalCount = Math.min(removeCount, shuffleDeck.length);

    // 取得目標卡牌
    const targetDeck = shuffleDeck.slice(0, totalCount);

    // 對目標卡牌 播放自動解鎖手指動畫, 等待全部動畫結束
    await Promise.all(
      targetDeck.map<Promise<void>>((card: MatchingGameCard) => this.playUnlockHandAnimation(card.cardPosition)),
    );

    // 對目標卡牌 播放自動解鎖動畫, 等待全部動畫結束
    await Promise.all(targetDeck.map<Promise<void>>((card: MatchingGameCard) => card.playUnlockAnimation()));

    // 對目標卡牌 清除干擾物
    for (let index = 0; index < totalCount; index++) {
      shuffleDeck[index].removeObstacle();
    }
  }

  /** 使用道具後，隨機抽牌變半透明，持續幾秒
   * @param itemData 物品資料
   */
  private playSeeThroughAnimation(itemData: MatchingCardItemData): void {
    // 從使用中牌堆中，過濾出未開啟的牌
    const filterDeck = this.activeDeck.filter((card) => card.isOpen === false);
    // 打亂順序
    const shuffleDeck = Phaser.Math.RND.shuffle(filterDeck);

    // 先取min為total count
    const totalCount = Math.min(itemData.value, shuffleDeck.length);

    // 對前幾張卡片播放偷偷瞄牌動畫
    for (let index = 0; index < totalCount; index++) {
      shuffleDeck[index].playSeeThroughAnimation(itemData.duration);
    }
  }

  /** 使用道具後加入buff，以進行倒數
   * @param item 使用的道具
   */
  private addItemBuff(item: MatchingCardItemBtn): MatchingCardBuff {
    // 有持續時間時
    let heroBuff = this.heroBuffMap.get(item.itemData.itemFunction);
    // 未擁有，新增buff
    if (heroBuff == null) {
      // 新增buff
      heroBuff = new MatchingCardBuff();
      // 存入map
      this.heroBuffMap.set(item.itemData.itemFunction, heroBuff);
    }

    // 啟用buff，並倒數持續時間，結束時停用能力
    heroBuff.enableBuff(item.itemData.duration, item.itemData.cooldownSec);

    // 總倒數秒數 = 持續秒數 + 冷卻秒數
    const totalCountDownSec = item.itemData.duration + item.itemData.cooldownSec;
    // 顯示道具啟用中提示，直到倒數結束
    this.itemDialog.setCountDownPendingUntil(
      item,
      // ui顯示倒數秒數 為 總倒數秒數
      totalCountDownSec,
      // 等待總倒數秒數
      AsyncHelper.sleep(totalCountDownSec),
    );

    return heroBuff;
  }

  /** 增加/減少能量
   * @param plus >0:增加量，<0:扣除量
   * @param isPopUp 顯示上浮提示
   * @param popupPosition 上浮提示座標
   */
  private updateEnergy(plus: number, isPopUp: boolean, popupPosition: Vector2): void {
    this.currentEnergy += plus;
    this.currentEnergy = Phaser.Math.Clamp(this.currentEnergy, 0, this.gameSetting.maxEnergyAmount);

    // 表演能量變動文字
    if (isPopUp) {
      // 上浮文字動畫-獲得能量
      if (plus > 0) {
        const tweenText: MatchingCardGainEnergyPopUpTween = this.gainEnergyTweenTextGroup.get(
          popupPosition.x,
          popupPosition.y,
        );
        if (tweenText) {
          // 播放
          tweenText.popUpNumberIcon(plus, BaseSceneString.EnergyIcon);
        }
      }
      // 上浮文字動畫-配對失敗能量處罰
      else if (plus < 0) {
        const tweenText: MatchingCardPenaltyPopUpTween = this.penaltyEnergyTweenTextGroup.get(
          popupPosition.x,
          popupPosition.y,
        );
        if (tweenText) {
          // 播放
          tweenText.playMatchingCardTween(plus, BaseSceneString.EnergyIcon);
        }
      }
    }

    // 更新能量顯示
    this.guiDialog.updateEnergyBar(this.currentEnergy, this.gameSetting.maxEnergyAmount);
  }

  /** 播放音效
   * @param audioType 音效類型
   */
  public playAudio(audioType: MatchingCardAudioType): void {
    // 取得音效
    const audioPool = this.audioMap.get(audioType);
    if (audioPool == null) {
      console.error(`playAudio: audioPool == null. audioType=${audioType}`);
      return;
    }
    // 播放音效
    audioPool.play();
  }

  /** 播放 自動解鎖手指動畫
   * @param cardPosition 卡牌位置
   */
  private async playUnlockHandAnimation(cardPosition: Vector2): Promise<void> {
    // 取得 自動解鎖手指動畫，設定位置
    const handPosition = cardPosition.add(this.unlockHandSpritePosition);
    const sprite: Phaser.GameObjects.Sprite = this.unlockHandSpriteGroup.get(handPosition.x, handPosition.y);

    // 縮放
    sprite.scale = this.unlockHandSpriteScaleRate;
    // 顯示自動解鎖手指動畫
    sprite.visible = true;

    // 播放自動解鎖手指動畫
    sprite.anims.play(MatchingCardString.UnlockHandClick);

    // 倒數幾秒後刪除
    await AsyncHelper.sleep(this.unlockHandSpriteSec);

    // 隱藏自動解鎖手指動畫
    sprite.visible = false;
  }
  //#endregion 遊戲相關
}
