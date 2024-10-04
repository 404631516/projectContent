import UIManager from '../../../Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import ParkourHero from '../Component/ParkourHero';
import ParkourMagnet from '../Component/ParkourMagnet';
import ParkourTilemap from '../Component/ParkourTilemap';
import ParkourGuiDialog from '../Dialogs/ParkourGuiDialog';
import ParkourBackgroundDialog from '../Dialogs/ParkourBackgroundDialog';
import ParkourForegroundDialog from '../Dialogs/ParkourForegroundDialog';
import { ParkourDepth, ParkourItemFunction, ParkourNumber, ParkourString } from '../Data/ParkourConfig';
import HorizontalLoopTilemap from '../../../Scripts/Components/Tilemap/HorizontalLoopTilemap';
import TableManager, {
  ParkourItemData,
  ParkourSettingData,
  ParkourWaveData,
  HeroData,
  ParkourMapData,
} from '@/manager/TableManager';
import { parkourImgUrl, parkourJsonUrl } from '../Data/ParkourResource';
import ParkourItem from '../Component/ParkourItem';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import ItemDialog from '../../UIHelper/ItemDialog';
import ParkourMapObject from '../Component/MapObject/ParkourMapObject';
import InfoBox from '@/views/H5/Scripts/Components/InfoBox';
import { ParkourGameData, ParkourGameLog, TotalProps, ContestPlayerData } from '@/helper/interface/Game';
import { GameType } from '@/helper/enum/Common';
import SoundPool from '../../Common/SoundPool';
import { PopUpNumberTween } from '@/views/H5/Scripts/Components/UI/BasePopUpNumberTween';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { Align } from '@/views/H5/Helper/MathHelper';
import { CharacterAnimType, CharacterType } from '@/helper/enum/PhaserGame';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import HeroManager from '@/manager/HeroManager';

export default class ParkourGameScene extends BaseGameScene implements IAnswerGame {
  /** 遊戲狀態機 */
  private gameFSM!: AnswerGameFSM;

  //#region readonly
  /** 玩家起始位置 */
  private readonly heroStartPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(100, 75);
  /** 磁鐵元件位置 */
  private readonly magnetPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(512, 256);
  /** 前進得分間隔 */
  private readonly gainScoreInterval: number = 200;
  /** 能量跳動文字offset */
  private readonly popUpOffsetY: number = 20;
  //#endregion

  //#region 靜態表資料
  /** 遊戲設定參數 */
  private _settingData!: ParkourSettingData;
  public get settingData(): ParkourSettingData {
    return this._settingData;
  }

  /** 地圖資料 */
  private tileMapDataList!: ParkourMapData[];
  /** 道具資料 */
  private itemDataList!: ParkourItemData[];
  /** 地圖資料 */
  private waveDataList!: ParkourWaveData[];
  //#endregion

  //#region Dialog
  /** 背景Dialog */
  private backgroundDialog!: ParkourBackgroundDialog;
  /** 前景Dialog */
  private foregroundDialog!: ParkourForegroundDialog;
  /** 介面Dialog : 分數、生命、道具數量 */
  private guiDialog!: ParkourGuiDialog;
  /** 道具介面 */
  private itemDialog!: ItemDialog<ParkourItem>;
  //#endregion

  //#region variables and properties
  /** 英雄資料 */
  private heroData!: HeroData;

  /** 得分音效 */
  private gainDiamondSoundPool?: SoundPool;
  /** 撞飛物件音效 */
  private objectFlySoundPool?: SoundPool;

  /** 能量文字動畫 */
  private energyTweenTextGroup!: Phaser.GameObjects.Group;
  /** 無限滾動地圖 */
  private horizontalLoopTilemap!: HorizontalLoopTilemap<ParkourTilemap>;

  /** 魔力數 */
  private currentEnergy: number = 0;
  /** 分數累計 */
  private scoreCount: number = 0;
  /** 獲得鑽石累積 */
  private currentDiamondCount: number = 0;
  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 英雄物件 */
  private _hero!: ParkourHero;
  public get hero(): ParkourHero {
    return this._hero;
  }
  /** 磁鐵物件 */
  private _magnet!: ParkourMagnet;
  public get magnet(): ParkourMagnet {
    return this._magnet;
  }

  /** 檢查遊戲是否結束
   * @returns true = 結束
   */
  public get isGameEnd(): boolean {
    return this.horizontalLoopTilemap.isReachEdgeOfRightmostMap || this.currentEnergy <= 0 || this.isTimeOut;
  }
  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    // 魔力值小於續命標準 或 已抵達過地圖正中間點 或 到續命時間
    return this.isHeroCritical || this.horizontalLoopTilemap.hasReachedCenterMap || this.isReviveTime;
  }
  /** 英雄進入危急狀態 */
  private get isHeroCritical(): boolean {
    return this.currentEnergy <= this.settingData.reviveEnergy;
  }
  //#endregion variables and properties

  //#region constructor、Phaser function
  constructor(private gameData: ParkourGameData, private gameWeb: IAnswerWeb) {
    super({ key: 'ParkourGameScene' });
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

    // 動態載入英雄閒置動畫圖
    AnimationHelper.loadCharacterSprite(this, this.heroData, CharacterType.Hero, CharacterAnimType.Idle);
    // 動態載入英雄跑步動畫圖
    AnimationHelper.loadCharacterSprite(this, this.heroData, CharacterType.Hero, CharacterAnimType.Run);
    // 動態載入英雄跳躍動畫圖
    AnimationHelper.loadCharacterSprite(this, this.heroData, CharacterType.Hero, CharacterAnimType.Jump);

    // 抓取道具靜態表
    this.itemDataList = TableManager.parkourItem.getAll();
    // 載入道具圖片
    this.itemDataList.forEach((data) => {
      this.load.image(data.nameKey, `${parkourImgUrl}/${data.url}`);
    });
    // 載入地圖物件靜態表
    const mapObjectDataList = TableManager.parkourMapObject.getAll();
    // 載入地圖物件圖片
    mapObjectDataList.forEach((data) => {
      this.load.image(data.nameKey, `${parkourImgUrl}/${data.url}`);
    });

    // 載入Tilemap
    this.tileMapDataList = TableManager.parkourMap.getAll();
    for (const tileMap of this.tileMapDataList) {
      this.load.tilemapTiledJSON(tileMap.leftHalfNameKey, `${parkourJsonUrl}/${tileMap.leftHalfNameKey}.json`);
      this.load.tilemapTiledJSON(tileMap.rightHalfNameKey, `${parkourJsonUrl}/${tileMap.rightHalfNameKey}.json`);
    }
  }

  async create() {
    // 載入遊戲參數
    const parkourSettingData = TableManager.parkourSetting.findOne(1);
    if (parkourSettingData === undefined) {
      console.error('ParkourGameTableData 載入失敗');
      return;
    }
    // 設置遊戲參數
    this._settingData = parkourSettingData;
    // 初始化生命數量
    this.currentEnergy = this.settingData.maxEnergy;

    // 載入波數
    this.waveDataList = TableManager.parkourWave.getAll();
    if (this.waveDataList === undefined) {
      console.error('ParkourWaveTableData 載入失敗');
      return;
    }
    // 確保波數順序
    this.waveDataList = this.waveDataList.sort((a: Readonly<ParkourWaveData>, b: Readonly<ParkourWaveData>) => {
      return a.id - b.id;
    });

    // 創建英雄閒置動畫
    AnimationHelper.createCharacterAnim(this, this.heroData, CharacterAnimType.Idle);
    // 創建英雄跑步動畫
    AnimationHelper.createCharacterAnim(this, this.heroData, CharacterAnimType.Run);
    // 創建英雄跳躍動畫
    AnimationHelper.createCharacterAnim(this, this.heroData, CharacterAnimType.Jump);
    // 用英雄跳躍圖創建飛行動畫
    this.anims.create({
      key: ParkourString.AnimHeroFly,
      frames: [
        {
          key: AnimationHelper.getCharacterAnimKey(this.heroData, CharacterAnimType.Jump),
          frame: 4,
        },
      ],
      frameRate: 1,
    });

    // 設置英雄
    this._hero = new ParkourHero(this, this.heroStartPosition, this.settingData, this.heroData);
    this.setHeroBoundsCollision();

    /** 設置表演文字群組 */
    this.energyTweenTextGroup = this.add.group({
      classType: PopUpNumberTween,
      maxSize: 10,
    });

    // 設置磁鐵元件
    this._magnet = new ParkourMagnet(this, this.magnetPosition, this.itemDataList[0].nameKey);

    // 轉換波數靜態表資料
    const mapKeys: string[] = [];
    for (const waveData of this.waveDataList) {
      for (let index = 0; index < waveData.mapAmount; index++) {
        // 隨機抽取地圖
        const mapId = Phaser.Math.RND.pick(waveData.mapList);
        const mapData = this.tileMapDataList.find((value: ParkourMapData) => value.id === mapId);
        if (mapData) {
          mapKeys.push(mapData.leftHalfNameKey);
          mapKeys.push(mapData.rightHalfNameKey);
        } else {
          console.error('波數地圖清單含有不存在的地圖');
        }
      }
    }

    // 載入所有Tilemap資料，並交由HorizontalLoopTilemap元件控制
    this.horizontalLoopTilemap = new HorizontalLoopTilemap<ParkourTilemap>(
      this,
      ParkourTilemap,
      ParkourNumber.MapWidth
    );
    this.horizontalLoopTilemap.resetList(mapKeys);

    // 設置Dialog
    await this.setDialog();
    // 設置得分TimeEvent
    this.setGainScoreTimeEvent();
    // 設置能量流逝TimeEvent
    this.setReduceEnergyTimeEvent();

    // 設置音效
    this.gainDiamondSoundPool = new SoundPool(this, ParkourString.AudioDiamond);
    this.objectFlySoundPool = new SoundPool(this, ParkourString.AudioObjectFly);
  }

  fixedUpdate(time: number, delta: number) {
    // 更新英雄
    this.hero.update(delta);
    // 更新遊戲狀態機
    this.gameFSM.update(delta);
  }
  //#endregion

  //#region 初始化 function
  /** 設置玩家與螢幕邊框碰撞事件 */
  private setHeroBoundsCollision(): void {
    // 防呆
    if (this.hero === undefined) {
      console.error('setHeroBoundsCollision fail! this.hero === undefined');
      return;
    }

    // 開啟玩家與螢幕邊框碰撞事件監聽
    this.physics.world.setBoundsCollision(true, false, false, true);
    this.hero.body.collideWorldBounds = true;
    this.hero.body.onWorldBounds = true;

    // 螢幕邊框碰撞事件
    this.physics.world.on('worldbounds', () => {
      this.heroFall();
    });
  }

  /** 英雄受到掉落傷害 */
  private heroFall(): void {
    // 防止重生過程再度觸發
    if (this.hero.isRespawn) {
      return;
    }

    this.hero.onHurt();
    this.updateEnergy(-this.settingData.fallDamage, true);

    if (this.currentEnergy > 0) {
      // 玩家重生
      this.hero.respawn();
      this.hero.setPosition(this.heroStartPosition.x, this.heroStartPosition.y);
    }
  }

  /** 隨著時間流逝會不斷獲得分數 */
  private setGainScoreTimeEvent(): void {
    this.time.addEvent({
      delay: this.gainScoreInterval,
      callback: () => {
        const scoreAmount = Math.floor(
          (this.settingData.gainScorePerSecond / (1000 / this.gainScoreInterval)) * this._hero.speedMultiplier
        );
        this.updateScore(scoreAmount);
      },
      repeat: -1,
    });
  }

  /** 設置生命流逝事件，隨著時間越長，扣除的生命值也越多 */
  private setReduceEnergyTimeEvent(): void {
    this.time.addEvent({
      /** 每隔1秒 */
      delay: 1000,
      /** 生命流逝 */
      callback: () => {
        // 能量值耗損率加乘，假如 catchAmountGap = 15,baseConsumption = 10, progressiveConsumption = 5
        // 鑽石量<15時，每秒消耗10能量，鑽石量>15且<30時，每秒消耗15能量；依此類推，每多15鑽石，每秒消耗能量值就+5
        const multiply = Math.floor(this.currentDiamondCount / this.settingData.diamondAmountGap);
        const multiplyConsumption = multiply * this.settingData.progressiveConsumption;
        const minusNum = this.settingData.baseConsumption + multiplyConsumption;

        // 更新能量值
        this.updateEnergy(-minusNum, false);
      },
      callbackScope: this,
      /** 不斷重複 */
      repeat: -1,
    });
  }

  /** 初始化所有Dialog顯示 */
  private async setDialog(): Promise<void> {
    // 開啟背景
    this.backgroundDialog = UIManager.instance.openDialog(ParkourBackgroundDialog, this);
    this.backgroundDialog.setDepth(ParkourDepth.Background);
    // 開啟前景
    this.foregroundDialog = UIManager.instance.openDialog(ParkourForegroundDialog, this);
    this.foregroundDialog.setDepth(ParkourDepth.Foreground);
    // 開啟Gui Dialog
    this.guiDialog = UIManager.instance.openDialog(ParkourGuiDialog, this);

    this.guiDialog.setDepth(ParkourDepth.UI);
    this.guiDialog.updateEnergyBar(this.currentEnergy, this.settingData.maxEnergy);
    this.guiDialog.updateScoreCount(this.scoreCount, this.settingData.targetScore);

    // 開啟道具介面
    this.itemDialog = UIManager.instance.openDialog<ItemDialog<ParkourItem>>(ItemDialog, this);
    this.itemDialog.setDepth(ParkourDepth.UI);
    this.itemDialog.init(
      this.itemDataList,
      { width: 60, height: 60 },
      new Phaser.Math.Vector2(this.itemDialog.width - 150, this.itemDialog.height - 40),
      Align.RightCenter
    );
    await this.itemDialog.addItems(this.gameData.totalProps, ParkourItem, this.useItem.bind(this));

    // 關閉載入場景
    UIManager.instance.closeDialog(LoadingDialog, this);
  }
  //#endregion 初始化 function

  //#region 狀態機
  /** 遊戲開場，播放遊戲動畫 */
  public async onOpeningEnter(): Promise<void> {
    // 暫停時間事件
    this.time.paused = true;
    // 暫停動畫事件
    this.tweens.pauseAll();

    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 暫停時間事件
    this.time.paused = false;
    // 暫停動畫事件
    this.tweens.resumeAll();

    // 設置Timer計時
    this.setTimerDialog(this.settingData.countDown, ParkourDepth.UI);
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
    // 英雄開始跑動
    this.hero.run();
  }

  /** 遊戲進行中，英雄跑動
   * @param delta 每一幀的間隔
   */
  public onGameUpdate(delta: number): void {
    // 英雄跑動
    this.horizontalLoopTilemap.scroll(this.hero.movingSpeed, delta);
  }

  /** 當觸發續命 */
  public onReviveEnter(): void {
    // 假如血量小於續命標準(強制觸發)
    if (this.isHeroCritical) {
      // 重置英雄位置
      this.hero.respawn();
      this.hero.setPosition(this.heroStartPosition.x, this.heroStartPosition.y);
    }

    // 暫停背景音樂
    this.bgm?.pause();
    this.pauseScene();
  }

  /** 續命完成
   * @param rewardProp
   */
  public async onReviveEnd(rewardProp: TotalProps[]): Promise<void> {
    // 將道具加到itemDialog
    await this.itemDialog.addItems(rewardProp, ParkourItem, this.useItem.bind(this));
    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();

    // 繼續背景音樂
    this.bgm?.resume();
    // 所有場景暫停繼續
    this.resumeScene();
  }

  /** 遊戲結束 */
  public onEndingEnter(): ContestPlayerData {
    // 更新魔力顯示
    this.guiDialog.updateEnergyBar(this.currentEnergy, this.settingData.maxEnergy);

    // 設定跑酷結算資料
    const gameLog: ParkourGameLog = {
      gameScore: this.scoreCount,
      gameMode: GameType.WebParkour,
      browser: navigator.userAgent,
      diamondCount: this.currentDiamondCount,
    };
    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: this.scoreCount >= this.settingData.targetScore,
      webGameLog: gameLog,
    };
  }
  //#endregion 狀態機

  //#region 遊戲邏輯
  /** 改變魔力量
   * @param energy 要改變的量，<0為扣魔力
   * @param isPopUp 是否表演數字PopUp
   */
  public async updateEnergy(energy: number, isPopUp: boolean): Promise<void> {
    // 限制能量區間
    this.currentEnergy += energy;
    this.currentEnergy = Phaser.Math.Clamp(this.currentEnergy, 0, this.settingData.maxEnergy);

    // 表演能量變動文字
    if (isPopUp === true && energy !== 0) {
      const tweenText: PopUpNumberTween = this.energyTweenTextGroup.get(
        this.hero.x,
        this.hero.y - this.hero.displayHeight / 2
      );
      if (tweenText) {
        tweenText.setPosition(this.hero.x, this.hero.y - this.hero.height / 2 - this.popUpOffsetY);
        tweenText.popUpNumberIcon(energy, BaseSceneString.EnergyIcon);
      }
    }

    // 更新魔力顯示
    this.guiDialog.updateEnergyBar(this.currentEnergy, this.settingData.maxEnergy);
  }

  /** 獲得分數並更新Gui顯示
   * @param score 獲得的分數
   */
  public updateScore(score: number): void {
    // 限制分數區間
    this.scoreCount += score;
    this.scoreCount = Math.max(this.scoreCount, 0);

    // 更新分數顯示
    this.guiDialog.updateScoreCount(this.scoreCount, this.settingData.targetScore);
  }

  /** 累計獲得的鑽石量 */
  public gainDiamondCount(): void {
    this.gainDiamondSoundPool?.play();
    this.currentDiamondCount += 1;
  }
  //#endregion

  //#region 操控
  /** 英雄跳躍指令 */
  public heroJump(): void {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false) {
      return;
    }
    this.hero.jump();
  }

  /** 使用道具
   * @param item 道具
   */
  public useItem(item: ParkourItem): void {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false) {
      return;
    }

    switch (item.itemData.itemFunction) {
      case ParkourItemFunction.Magnet:
        this.useMagnetItem(item);
        break;
      case ParkourItemFunction.Fly:
        this.useFlyItem(item);
        break;
      case ParkourItemFunction.Giant:
        this.useGiantItem(item);
        break;
      case ParkourItemFunction.SpeedUp:
        this.useSpeedUpItem(item);
        break;
    }
  }

  /** 使用磁鐵道具
   * @param item 道具
   */
  private useMagnetItem(item: ParkourItem): void {
    // 如果處於使用磁鐵狀態則返回
    if (this._magnet.visible) {
      return;
    }
    // 使用道具
    item.useItem();
    // 開啟磁鐵道具
    this.itemDialog.setCountDownPendingUntil(item, item.itemData.duration, this._magnet.activate(item.itemData));
  }

  /** 使用飛行道具
   * @param item 道具
   */
  private useFlyItem(item: ParkourItem): void {
    // 如果處於飛行狀態則返回
    if (this.hero.isFly) {
      return;
    }
    // 使用道具
    item.useItem();
    // 英雄飛行
    this.hero.fly(item.itemData);
    this.itemDialog.setCountDownPendingUntil(
      item,
      item.itemData.duration,
      AsyncHelper.pendingUntil(() => this.hero.isFly === false)
    );
  }

  /** 使用巨大化道具
   * @param item 道具
   */
  private useGiantItem(item: ParkourItem): void {
    // 如果處於巨大化則返回
    if (this.hero.isGiant) {
      return;
    }
    // 使用道具
    item.useItem();
    // 英雄巨大化
    this.itemDialog.setCountDownPendingUntil(item, item.itemData.duration, this.hero.onGiant(item.itemData));
  }

  /** 使用加速道具
   * @param item 道具
   */
  private useSpeedUpItem(item: ParkourItem): void {
    // 如果處於加速狀態則返回
    if (this.hero.isSpeedUp) {
      return;
    }
    // 使用道具
    item.useItem();
    // 英雄進入加速狀態
    this.itemDialog.setCountDownPendingUntil(item, item.itemData.duration, this.hero.onSpeedUp(item.itemData));
  }
  //#endregion

  //#region 遊戲表現
  /** 當英雄被障礙物撞到時
   * @param mapObject 地圖物件本身
   * @param mapObjectGroup 地圖物件所屬群組
   * @returns
   */
  public onHeroHitByMapObject(mapObject: ParkourMapObject, mapObjectGroup: Phaser.Physics.Arcade.Group): void {
    // 飛行時忽略，穿越所有物件
    if (this.hero.isFly) {
      return;
    }
    // 巨大時無敵，撞飛所有物件
    if (this.hero.isGiant) {
      this.mapObjectFly(mapObject, mapObjectGroup);
    }
    // 一般狀態時，玩家受傷
    else if (this.hero.isRespawn === false) {
      // 觸發受傷特效
      this.hero.onHurt();

      // 更新分數、魔力
      this.updateScore(mapObject.score);
      this.updateEnergy(mapObject.energy, true);

      // 地圖物件與玩家相撞事件
      mapObject.onHit(mapObjectGroup);
    }
  }

  /** 讓地圖物件被撞飛(用動畫模擬物理表現)
   * @param mapObject 地圖物件
   */
  private mapObjectFly(parkourMapObject: Phaser.Physics.Arcade.Sprite, objectGroup: Phaser.Physics.Arcade.Group) {
    // 撞飛音效
    this.objectFlySoundPool?.play();
    // 從群組中移除(不再隨地圖往左移)
    objectGroup.remove(parkourMapObject);

    const tween = this.tweens.add({
      targets: parkourMapObject,
      y: Phaser.Math.Between(0, this.game.canvas.height),
      x: this.game.canvas.width,
      duration: 1000,
      onComplete: () => {
        this.tweens.remove(tween);
        parkourMapObject.destroy(true);
      },
    });
  }
  //#endregion
}
