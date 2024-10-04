import DefenseEnemy from '../Components/DefenseEnemy';
import { DefenseNumber, DefenseString, DefenseDepth } from '../Data/DefenseConfig';
import WeaponBomb from '../Components/WeaponBomb';
import UIManager from '@/views/H5/Scripts/Manager/UIManager';
import DefenseWeaponPlaceDialog from '../Dialogs/DefenseWeaponPlaceDialog';
import DefenseStateDialog from '../Dialogs/DefenseStateDialog';
import TableManager, { DefenseWeaponData, HeroData } from '@/manager/TableManager';
import { defenseImgUrl, defenseJsonUrl } from '../Data/DefenseResource';
import DefensePatchDialog from '../Dialogs/DefensePatchDialog';
import InfoBox from '../../../Scripts/Components/InfoBox';
import DefenseMapDialog from '../Dialogs/DefenseMapDialog';
import Slider from '../../../Scripts/Components/Slider';
import DefenseBaseDialog from '../Dialogs/DefenseBaseDialog';
import { clamp, imagePathToScenePath } from '@/views/H5/Helper/MathHelper';
import HeroManager from '@/manager/HeroManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import SoundPool from '../../Common/SoundPool';
import TimeEventManager, { GameSpeed } from '@/views/H5/Scripts/Manager/TimeEventManager';
import { WebGameMode, GameType } from '@/helper/enum/Common';
import { EndType } from '@/helper/enum/WebGame';
import {
  TowerDefenseGameLog,
  TowerDefenseGameData,
  TotalProps,
  ContestPlayerData,
  PlanetWarResult,
  EnemyResultData,
  PlanetGameData,
} from '@/helper/interface/Game';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType, CharacterColorType, CharacterType } from '@/helper/enum/PhaserGame';
import PlanetWarHelper from '@/views/H5/Helper/PlanetWarHelper';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import { TimeEvent } from '@/views/H5/Scripts/Manager/TimeEvent';
import { IAnswerGame } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import { IPlanetGame } from '@/views/H5/Scripts/Components/StateMachine/PlanetGameFSM';
import { BossGame } from '../../Common/PhaserGameStrategy';

/** 地圖資料 TODO 日後改用tableMaanger */
interface MapData {
  tileMap: number[][];
  paths: Phaser.Math.Vector2[][];
  heroTilePos: Phaser.Math.Vector2;
}

/** 每波敵人出現的資料 */
interface EnemyStateData {
  enemies: number[];
  spawTime: number;
  speed: number; // TODO 改成加成的速度
  time: number;
}

/** 塔防狀態機 */
export interface IDefenseGameFSM {
  /** update */
  update(delta: number): void;
}

export default class DefenseGameScene extends BaseGameScene implements IAnswerGame, IPlanetGame {
  /** singleton */
  private static _instance: DefenseGameScene;
  public static get instance(): DefenseGameScene {
    return this._instance;
  }

  /** 遊戲狀態機 */
  private gameFSM!: IDefenseGameFSM;

  //#region UIDialog
  private baseDialog!: DefenseBaseDialog;
  /** 補丁顯示 */
  private patchDialog!: DefensePatchDialog;
  /** 狀態顯示 */
  private stateDialog!: DefenseStateDialog;
  /** 砲台選單 */
  private weaponDialog!: DefenseWeaponPlaceDialog;
  /** 地圖砲塔設置區域 */
  private mapDialog!: DefenseMapDialog;
  //#endregion

  /** 物件池 */
  public bombPool?: Phaser.GameObjects.Group;
  public enemyPool?: Phaser.GameObjects.Group;

  /** 音效 */
  private onShootSoundPool?: SoundPool;

  /** 地圖資料 */
  private mapData!: MapData;

  /** 目前敵人速度 */
  private currentStateSpeed = 0;
  /** 處理階段狀態改變 */
  private finishedWaveCount = -1;
  /** 紀錄殺掉敵人的數量 */
  private destoryCount: number = 0;
  /** 紀錄已出現的敵人數量 */
  private enemyCount: number = 0;
  /** 敵人資料 */
  private enemyData: EnemyStateData[] = [];
  /** 敵人血條物件池 */
  private hpBarPool?: Phaser.GameObjects.Group;
  /** 英雄血量 */
  private heroHp: number = 1;
  /** 英雄資料 */
  private heroData!: HeroData;
  /** 英雄砲塔資料 */
  private heroWeaponData!: DefenseWeaponData;

  /** 現階段敵人出現的數量 */
  private spawEnemyCount: number = 0;
  /** 敵人生成波數的時間 */
  private stateCountdownTimeEvent?: TimeEvent;
  /** 被打倒敵人數 key為DefenseEnemy.Id, value為打倒數量 */
  private dieEnemyMap: Map<number, number> = new Map<number, number>();
  /** 暫存資料, 當前這波敵人, 每一隻對應的path, 此array的index表示enemiesIndex, value表示pathIndex */
  private enemiesPath: number[] = [];
  /** 觸發續命題的距離, 距離終點x格時會觸發續命題 */
  private reviveTileNumberToEndPoint: number = 5;

  /** 清除全部敵人波次 */
  private isClearAllWave: boolean = false;
  /** 敵人是否抵達續命點 */
  private isRevivePoint: boolean = false;
  /** 遊戲開始時間點, UnixTime */
  public startTime: number = 0;
  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 檢查遊戲是否結束
   * @returns true = 結束
   */
  public get isGameEnd(): boolean {
    return this.heroHp <= 0 || this.isTimeOut || this.isClearAllWave;
  }
  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    return this.isRevivePoint || this.isReviveTime;
  }

  /** 遊戲類型 */
  public get gameMode(): WebGameMode {
    return this.gameData.gameMode;
  }

  /** 魔力數 */
  private _currentEnergy: number = 0;
  public get currentEnergy(): number {
    return this._currentEnergy;
  }

  /** TimeEventManager, 管理timeEvent */
  private timeEventManager: TimeEventManager = new TimeEventManager();

  constructor(
    private gameData: TowerDefenseGameData,
    private bossGame?: BossGame,
    private planetGameData?: PlanetGameData
  ) {
    super({ key: 'DefenseGameScene' });
    DefenseGameScene._instance = this;
  }

  async preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);

    // 設定魔力
    this._currentEnergy = DefenseNumber.BaseMagic;

    // 取得在線英雄資料
    const heroListData = this.gameData.heroListData;

    // 取得英雄ID
    const heroId = heroListData.heroId;

    // 取得英雄靜態資料
    const foundHeroData = TableManager.hero.findOne(heroId);
    if (foundHeroData == null) {
      console.error('heroData ' + heroListData.heroId + ' is null!');
      await InfoBox.defaultMessage([this], `英雄資料讀取失敗! 英雄ID: ${heroListData.heroId}`);
      this.scene.stop();
      return;
    }
    this.heroData = foundHeroData;

    const heroLevel = heroListData.level;
    // 初始化英雄血量(英雄血量使用星球大戰等級計算)
    const planetWarLevel = PlanetWarHelper.getHeroPlanetWarLevel(heroListData.level);
    this.heroHp = PlanetWarHelper.getHpByPlanetWarLevel(this.heroData.hp, planetWarLevel);

    // 載入英雄所使用之砲管&砲彈圖片
    const heroWeaponData = HeroManager.getHeroWeaponData(this.heroData, heroLevel);
    if (heroWeaponData === undefined) {
      console.error(`heroWeaponData is null! heroId = ${heroId}, heroLevel = ${heroLevel}`);
      await InfoBox.defaultMessage([this], `英雄砲塔讀取失敗! 英雄ID: ${heroId}, 等級: ${heroLevel}`);
      this.scene.stop();
      return;
    }
    this.loadWeaponResources(heroWeaponData);
    // 儲存英雄砲塔資料, DefenseWeaponPlaceDialog設定英雄砲塔用
    // 因為要竄改nameKey資料, 避免改到靜態表資料, 所以使用Object.assign複製一份
    this.heroWeaponData = Object.assign({}, heroWeaponData);
    // 將英雄砲塔外型指定成英雄原始外型nameKey
    this.heroWeaponData.nameKey = this.heroData.nameKey;

    // 根據使用者選擇的砲塔儲存Data, load相關resources
    const weaponList: Map<number, number> = new Map();
    for (const weaponInfo of this.gameData.totalProps) {
      // 檢查生物兵器資料
      const weaponData = TableManager.defenseWeapon.findOne(weaponInfo.id);
      if (weaponData === undefined) {
        console.error(`無法取得id = ${weaponInfo.id} 的砲台資料`);
        await InfoBox.defaultMessage([this], `生物兵器資料有誤, 無法取得id = ${weaponInfo.id} 的砲台資料`);
        this.scene.stop();
        return;
      }
      // 防呆, 確定count為整數
      const weaponCount = Math.floor(weaponInfo.count);
      // 記錄數量
      weaponList.set(weaponInfo.id, weaponCount);
      // 載入砲塔圖片資源
      this.loadWeaponResources(weaponData);
    }

    // 因為只有在preload能load圖片資源,
    // 而續命題獎勵有可能是剛進遊戲時沒選中的砲塔,
    // 所以若是世界大賽則需要load全部世界大賽類型的砲塔資源
    if (this.gameMode === WebGameMode.WorldContest) {
      const allWeaponTableData = TableManager.defenseWeapon.getAll();
      allWeaponTableData.forEach((weaponData) => {
        if (weaponData.isPlanetWar === 0 && weaponList.get(weaponData.id) === undefined) {
          // 載入砲塔圖片資源
          this.loadWeaponResources(weaponData);
        }
      });
    }

    // 取得敵人資料
    this.enemyData = this.gameData.enemies;
    if (this.enemyData.length < 1) {
      // 一般答題模式, 使用預設敵人
      if (this.gameMode === WebGameMode.WorldContest) {
        this.enemyData = this.cache.json.get(DefenseString.DefaultEnemyData);
      }
      // 沒有設定敵人報錯
      else {
        console.error(`無法取得gameData.enemies is null`);
        this.scene.stop();
        return;
      }
    }

    // 載入敵人動圖
    TableManager.defenseEnemy
      .getAll()
      .forEach((enemyData) =>
        AnimationHelper.loadCharacterSprite(this, enemyData, CharacterType.Enemy, CharacterAnimType.Walk)
      );

    // 載入地圖資料
    this.load.json('mapData_' + this.gameData.mapId, `${defenseJsonUrl}/MapData_${this.gameData.mapId}.json`);
    // 載入地圖背景圖片
    this.load.image('bg_' + this.gameData.mapId, `${defenseImgUrl}/bg_${this.gameData.mapId}.png?v=1`);
    // 載入地圖補丁圖片
    this.load.image('patch_' + this.gameData.mapId, `${defenseImgUrl}/patch_${this.gameData.mapId}.png?v=1`);

    // 設定音效
    this.onShootSoundPool = new SoundPool(this, DefenseString.OnShootSound);
  }

  create() {
    // 取得地圖資料, 由於json檔是在preload才讀取的, 所以只能在create()才set mapData
    const mapData = this.cache.json.get('mapData_' + this.gameData.mapId) as MapData;
    // mapData防呆
    if (mapData == null) {
      console.error('mapData not found! gameData.mapId: ' + this.gameData.mapId);
      return;
    }
    this.mapData = mapData;
    // 地圖路徑座標轉換
    for (let i = 0; i < this.mapData.paths.length; ++i) {
      this.mapData.paths[i] = imagePathToScenePath(this.mapData.paths[i]);
    }

    // 背景UI
    this.baseDialog = UIManager.instance.openDialog(DefenseBaseDialog, this);
    this.baseDialog.setDepth(DefenseDepth.Background);
    this.baseDialog.setBG(this.gameData.mapId);
    // 設定砲塔設置區域
    this.mapDialog = UIManager.instance.openDialog(DefenseMapDialog, this);
    this.mapDialog.setDepth(DefenseDepth.MapDialog);
    this.mapDialog.setMap(this.mapData.tileMap);
    // 補丁UI
    this.patchDialog = UIManager.instance.openDialog(DefensePatchDialog, this);
    this.patchDialog.setDepth(DefenseDepth.PatchDialog);
    this.patchDialog.setBG(this.gameData.mapId);
    // 砲塔UI
    this.weaponDialog = UIManager.instance.openDialog(DefenseWeaponPlaceDialog, this);
    this.weaponDialog.setDepth(DefenseDepth.Weapon);
    this.weaponDialog.addWeaponItems(this.gameData.totalProps);
    this.weaponDialog.setHeroDefenseTower(this.heroWeaponData, this.getHeroTowerPos(), this.heroHp);
    // 波數顯示UI
    this.stateDialog = UIManager.instance.openDialog(DefenseStateDialog, this);
    this.stateDialog.setDepth(DefenseDepth.StateDialog);

    // 建立炮彈物件池
    this.bombPool = this.physics.add.group({
      classType: WeaponBomb,
      allowGravity: false,
      accelerationY: DefenseNumber.Gravity,
    });
    // 建立敵人物件池
    this.enemyPool = this.add.group({
      classType: DefenseEnemy,
      runChildUpdate: true,
    });
    // 建立血條物件池
    this.hpBarPool = this.add.group({
      classType: Slider,
    });

    // 開啟倒數
    if (this.gameMode === WebGameMode.WorldContest) {
      this.setTimerDialog(this.gameData.countdownTime, DefenseDepth.Timer);
      this.setTimerEvent(
        () => {
          this.isTimeOut = true;
        },
        new Map([
          // 剩餘秒數剩一半強制續命
          [
            Math.floor(this.gameData.countdownTime / 2),
            () => {
              this.isReviveTime = true;
            },
          ],
        ])
      );
    }

    // 紀錄開始時間
    this.startTime = Date.now();

    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  /** update, 每個frame執行一次 */
  fixedUpdate(time: number, delta: number) {
    this.timeEventManager.update(delta);
    this.gameFSM.update(delta);
  }

  //#region 狀態機
  /** 設定狀態機
   * @param gameFSM
   */
  public setGameFSM(gameFSM: IDefenseGameFSM): void {
    this.gameFSM = gameFSM;
  }

  /** 遊戲開場，播放遊戲動畫 */
  public async onOpeningEnter(): Promise<void> {
    // 塔防沒有開場表演
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 先進入第一個階段
    this.onNextState(false);
  }

  /** 遊戲進行中update
   * @param delta
   */
  public onGameUpdate(delta: number): void {
    // 塔防沒有遊戲進行中需要做的事
  }

  /** 當觸發續命 */
  public onReviveEnter(): void {
    // 摧毀拖曳中的砲塔顯示
    this.weaponDialog.destroyCurrentWeaponDisplay();
    // 暫停背景音樂
    this.bgm?.pause();
    // 暫停場景
    this.pauseScene();
  }

  /** 續命完成
   * @param rewardProp
   */
  public async onReviveEnd(rewardProp: TotalProps[]): Promise<void> {
    // 獲得道具獎勵並刷新下方砲台選單
    this.weaponDialog.addWeaponItems(rewardProp);

    // 恢復背景音樂
    this.bgm?.resume();
    // 所有場景暫停繼續
    this.resumeScene();
  }

  /** 遊戲結束 */
  public onEndingEnter(): ContestPlayerData {
    let totalScore = 0;
    this.dieEnemyMap.forEach((count, enemyId) => {
      // 計算得分
      const enemytableData = TableManager.defenseEnemy.findOne(enemyId);
      if (enemytableData == null) {
        return;
      }
      totalScore += enemytableData.score * count;
    });

    // 設定塔防結算資料
    const gameLog: TowerDefenseGameLog = {
      gameScore: totalScore,
      gameMode: GameType.WebTowerDefense,
      browser: navigator.userAgent,
      towerKills: this.destoryCount,
    };
    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: this.heroHp > 0,
      webGameLog: gameLog,
    };
  }

  /** 星球大戰結束遊戲表演 */
  public onPlanetResultEnter(): Promise<void> {
    // 塔防沒有結束表演
    return Promise.resolve();
  }

  /** 星球大戰結束遊戲 */
  public async onPlanetEndingEnter(): Promise<PlanetWarResult> {
    // 加進打倒敵人清單
    const dieEnemyArray: EnemyResultData[] = [];
    this.dieEnemyMap.forEach((value, key) => {
      dieEnemyArray.push({ enemyId: key, enemyCount: value });
    });

    // 計算經過時間
    const timeDiffInMilliSec = Date.now() - this.startTime;

    // 波數防呆
    if (this.finishedWaveCount > this.enemyData.length) {
      console.error(
        `endGame() warning, finishedWaveCount: ${this.finishedWaveCount} > totalWaveCount: ${this.enemyData.length}`
      );
      this.finishedWaveCount = this.enemyData.length;
    }

    // 星球大戰星星數: 打倒全部wave的敵人就3顆星, 每少打倒一波就減一顆星
    const starCount = 3 - (this.enemyData.length - this.finishedWaveCount);

    // 回傳星球大戰結算資料
    return {
      endType: starCount > 0 ? EndType.Success : EndType.Fail,
      gameResult: {
        learnLid: this.planetGameData?.learnLid ?? -1,
        hid: this.planetGameData?.hid ?? -1,
        gameSec: timeDiffInMilliSec / 1000,
        dieEnemys: dieEnemyArray,
        setWeapons: this.weaponDialog.weaponSetLogs,
        overWaveCount: this.finishedWaveCount,
        learnLogId: this.planetGameData?.learnLogId ?? -1,
        msgId: this.planetGameData?.msgId ?? '',
      },
    };
  }
  //#endregion

  /** 取得炮彈 */
  public getBomb(key?: string): WeaponBomb {
    const bomb = this.bombPool?.get() as WeaponBomb;

    // 建立子彈摧毀的事件
    bomb.onDestroy = () => {
      // 回收至物件池
      this.bombPool?.killAndHide(bomb);
      // 清除動畫
      this.tweens.killTweensOf(bomb);
      // 將炸彈從砲塔的gameContainer移除, 避免清除砲塔資源時, 刪到undefined的炸彈而報錯
      bomb.parentContainer?.remove(bomb);
    };

    // 設定子彈圖片
    if (key !== undefined) {
      bomb.setTexture(key);
    }

    return bomb;
  }

  /** 在範圍內取得敵人 */
  public getEnemy(towerPos: Phaser.Math.Vector2, radius: number): DefenseEnemy | null {
    // 檢查物件池
    const enemies = this.enemyPool?.getChildren() as DefenseEnemy[];
    if (enemies === undefined) {
      return null;
    }

    enemies.sort((a: DefenseEnemy, b: DefenseEnemy) => {
      return b.pathProgressRate - a.pathProgressRate;
    });

    // 尋找第一個在距離範圍內的敵人
    for (const enemy of enemies) {
      // 若敵人物件未出現在遊戲中則不錄取
      if (false === enemy.active || enemy.isDead) {
        continue;
      }

      // 檢查敵人是否在範圍內
      if (Phaser.Math.Distance.Between(towerPos.x, towerPos.y, enemy.x, enemy.y) <= radius) {
        return enemy;
      }
    }
    return null;
  }

  /** 取得血條 */
  public getHpBar(): Slider {
    const hpBar = this.hpBarPool?.get() as Slider;
    hpBar.setActive(true);
    hpBar.setVisible(true);
    this.add.existing(hpBar);
    hpBar.setDepth(DefenseDepth.HpBar);
    return hpBar;
  }

  /** 播放敵人攻擊音效 */
  public playOnShootSound(): void {
    this.onShootSoundPool?.play();
  }

  /** 設定遊戲加速倍率 */
  public setGameSpeed(newGameSpeed: GameSpeed): void {
    // 通知TimeEventManager更新遊戲速度
    TimeEventManager.instance.setGameSpeed(newGameSpeed);
    // 通知各DefenseEnemy
    if (this.enemyPool) {
      const allEnemies = this.enemyPool.getChildren() as DefenseEnemy[];
      for (const enemy of allEnemies) {
        enemy.OnGameSpeedReset(newGameSpeed);
      }
    }
    // 星球大戰時沒有timerDialog, 所以視作正常情況
    if (this.timerDialog === undefined) {
      return;
    }
    // 通知TimerDialog, 更新倒數計時速度
    this.timerDialog.setCountdownSpeed(newGameSpeed);
  }

  /** 載入砲塔圖片資源 */
  private loadWeaponResources(weaponData: DefenseWeaponData) {
    // 載入砲台圖片
    this.load.image(weaponData.nameKey, `${defenseImgUrl}/weapons/${weaponData.url}?v=1`);
    // 載入砲管圖片
    const barrelTableData = TableManager.defenseBarrel.findOne(weaponData.barrelId);
    if (barrelTableData != null) {
      this.load.image(barrelTableData.nameKey, `${defenseImgUrl}/barrels/${barrelTableData.url}?v=1`);
    }
    // 載入砲彈圖片
    const bombTableData = TableManager.defenseBomb.findOne(weaponData.bombId);
    if (bombTableData != null) {
      this.load.image(bombTableData.nameKey, `${defenseImgUrl}/bombs/${bombTableData.url}?v=1`);
    }
  }

  /** 取得英雄砲塔位置 */
  private getHeroTowerPos(): Phaser.Math.Vector2 {
    if (this.mapData == null) {
      console.error('DefenseGameScene.getHeroTowerPos() error, this.mapData is null!');
      return new Phaser.Math.Vector2(0, 0);
    }
    // mapData紀錄的是20*15的地圖座標
    const heroTilePos = this.mapData.heroTilePos;
    // 轉換成畫面上的pixel座標
    const zoneX = (heroTilePos.x + 0.5) * DefenseNumber.TileSizeX + DefenseNumber.OffsetX;
    let zoneY = (heroTilePos.y + 0.5) * DefenseNumber.TileSizeY + DefenseNumber.OffsetY;
    // 由於英雄砲塔特別大隻, 需要另外校正Y值, 否則會超出格子
    zoneY += DefenseNumber.HeroTowerOffset;
    // 回傳
    const heroPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(zoneX, zoneY);
    return heroPos;
  }

  /** 確認目前的狀態以及切換狀態 */
  private onNextState(isNoEnemy: boolean) {
    if (this.enemyData === undefined) {
      InfoBox.error([this], 'Game data are not found');
      return;
    }

    // 若超過最後一回合
    if (this.finishedWaveCount > this.enemyData.length - 1) {
      console.error('onNextState() error, finishedWaveCount = ' + this.finishedWaveCount);
      return;
    }

    // 若正在最後一回合期間
    if (this.finishedWaveCount === this.enemyData.length - 1) {
      // 敵人未清完
      if (isNoEnemy === false) {
        // 甚麼都不做, 等玩家輸掉或者清光場上怪物
        return;
      } else {
        // 全部波次清除
        this.isClearAllWave = true;
        // 完成回合數+1
        this.finishedWaveCount++;
        return;
      }
    }

    // 開始生成下一波怪
    this.finishedWaveCount++;

    // 設置狀態的資料
    const stateData = this.enemyData[this.finishedWaveCount];
    if (stateData == null) {
      console.error('onNextState() error, stateData is null! finishedWaveCount = ' + this.finishedWaveCount);
      return;
    }

    // 顯示UI
    this.stateDialog.changeState(`${this.finishedWaveCount + 1}`);

    // 決定每隻敵人要走的路徑編號
    this.setCurrentStateEnemiesPath(stateData);

    // 建立產生敵人的時間事件
    this.setSpawnEnemyTimeEvent(stateData);

    // 設置目前敵人的速度
    this.currentStateSpeed = stateData.speed;

    // 新增下一個狀態的敵人
    this.enemyCount += stateData.enemies.length;
  }

  /** 生成數個敵人 */
  private setSpawnEnemyTimeEvent(stateData: EnemyStateData) {
    // 取得現在遊戲時間
    const currentTime = TimeEventManager.instance.getTime();

    // 準備生成本波的所有敵人, 設定timeEvent, 時間到時生成對應敵人
    for (let i = 0; i < stateData.enemies.length; ++i) {
      // 計算生成時間
      const enemyCreateTime = currentTime + stateData.spawTime * i * 1000;
      // 生成timeEvent
      TimeEventManager.instance.newTimeEvent(enemyCreateTime, () => {
        // 時間到時生成敵人
        this.spawnEnemy(i, stateData.enemies[i]);
      });
    }

    // 更新下次onNextState()的時間
    // 取消上一個stateCountdownTimeEvent
    if (this.stateCountdownTimeEvent) {
      this.stateCountdownTimeEvent.cancel();
    }
    // 本波生怪流程結束時間
    const stateEndTime = TimeEventManager.instance.getTime() + stateData.time * 1000;
    // 更新stateCountdownTimeEvent
    this.stateCountdownTimeEvent = TimeEventManager.instance.newTimeEvent(stateEndTime, () => {
      // 時間到時進入下個state
      this.onNextState(false);
    });
  }

  /** 骰this.enemiesPath, 決定每隻敵人要走哪條路 */
  private setCurrentStateEnemiesPath(stateData: EnemyStateData) {
    if (this.mapData === undefined) {
      return;
    }
    const enemyCount = stateData.enemies.length;
    const pathCount = this.mapData.paths.length;
    // 先確保每條路徑的enemy總數差不多
    this.enemiesPath = [];
    for (let i = 0; i < enemyCount; ++i) {
      this.enemiesPath.push(i % pathCount);
    }
    // 洗牌, 亂序出怪
    this.enemiesPath.sort(() => {
      return Math.random() - 0.5;
    });
  }

  /** 生成敵人 */
  private spawnEnemy(enemyIndex: number, enemyId: number) {
    // 找出敵人靜態資料
    const enemyTableData = TableManager.defenseEnemy.findOne(enemyId);
    if (enemyTableData === undefined) {
      console.error(`找不到流水號為${enemyId}的敵人資料`);
      return;
    }
    // 防呆 this.mapData
    if (this.mapData === undefined) {
      InfoBox.error([this], '沒有地圖資料');
      return;
    }
    // 取得敵人物件
    const enemy: DefenseEnemy = this.enemyPool?.get();
    if (enemy === null) {
      return;
    }

    // 更新敵人數量
    this.spawEnemyCount++;

    // 初始化敵人
    enemy.setEnemyData(this.spawEnemyCount, this.currentStateSpeed * enemyTableData.speed);
    enemy.setEnemyTableData(enemyTableData);
    enemy.resetEnemyObject();
    enemy.setActive(true);
    enemy.setVisible(true);
    enemy.setDepth(DefenseDepth.Enemy);

    // 建立敵人物件摧毀後返回物件池
    enemy.onDestroy = (defenseEnemy: DefenseEnemy) => {
      this.enemyPool?.killAndHide(defenseEnemy);
      this.tweens.killTweensOf(defenseEnemy);

      if (defenseEnemy.topHp) {
        this.hpBarPool?.killAndHide(defenseEnemy.topHp);
      }

      if (defenseEnemy.tableData === undefined) {
        console.error(defenseEnemy, `該敵人沒有靜態資料`);
        return;
      }

      // 增加魔力值
      this.updateEnergy(defenseEnemy.tableData.magic);

      // 加進"被摧毀敵人"清單
      let enemyTypeDestroyCount = this.dieEnemyMap.get(defenseEnemy.tableData.id);
      if (enemyTypeDestroyCount == null) {
        this.dieEnemyMap.set(defenseEnemy.tableData.id, 1);
      } else {
        enemyTypeDestroyCount++;
        this.dieEnemyMap.set(defenseEnemy.tableData.id, enemyTypeDestroyCount);
      }

      // 通知BossGame表演
      this.bossGame?.onAttackBoss();

      // 計算敵人被殺的數量
      ++this.destoryCount;
      if (this.destoryCount === this.enemyCount) {
        this.onNextState(true);
      }
    };

    // 建立敵人進入出口後的動作 TODO
    enemy.onArrived = (defenseEnemy: DefenseEnemy) => {
      if (defenseEnemy.tableData == null) {
        console.error('enemy.onArrived.invoke() error, enemyData is null!');
        return;
      }
      // 扣血
      this.heroHp -= defenseEnemy.tableData.attack;
      this.weaponDialog.updateHeroHp(this.heroHp);
    };

    // 建立敵人抵達續命點後的動作
    enemy.onReviveArrive = () => {
      this.isRevivePoint = true;
    };

    // 取得行進路線
    const pathIndex = this.enemiesPath[enemyIndex];
    const path = this.mapData.paths[pathIndex];
    if (path == null) {
      return;
    }

    // 畫路線走向
    enemy.setScale(0.5);
    // TODO input TimeEventManager.currentGameSpeed
    enemy.setWalkAnimation(AnimationHelper.getCharacterAnimKey(enemyTableData, CharacterAnimType.Walk));
    enemy.startOnPath(path);

    // 計算每秒路徑移動進度
    enemy.setPathProgressRateInSec();
    // 計算觸發續命題的距離, 距離終點x格時會觸發續命題
    enemy.setRevivePathProgressRate(this.reviveTileNumberToEndPoint);
  }

  /** 更新能量
   * @param amount 更新能量值
   */
  public updateEnergy(amount: number): void {
    // 計算最終魔力值
    this._currentEnergy = clamp(this._currentEnergy + amount, DefenseNumber.MaxMagic, 0);
    // 表演 & UI更新
    this.weaponDialog.playEnergyUpdate(amount, this.currentEnergy);
  }
}
