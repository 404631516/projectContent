import { AntiTDNumber, AntiTDString } from '../Data/AntiTDConfig';
import UIManager from '../../../Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import AntiTDTilemap from '../Component/AntiTDTilemap';
import AntiTDGuiDialog from '../Dialogs/AntiTDGuiDialog';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import TableManager, { AudioData } from '@/manager/TableManager';
import { AntiTDEnemyData, EffectData, HeroData, CombatItemData, TileMapData } from '@/manager/TableManager';
import { antiTDImgUrl, antiTDJsonUrl } from '../Data/AntiTDResourceData';
import InfoBox from '@/views/H5/Scripts/Components/InfoBox';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType, CharacterType } from '@/helper/enum/PhaserGame';
import { AntiTDGameData, EnemyResultData, PlanetWarResult, PlanetGameData } from '@/helper/interface/Game';
import { EndType, EnemyWaveMode } from '@/helper/enum/WebGame';
import WaveTimerDialog from '../../BomberMan/Dialogs/WaveTimerDialog';
import AntiTDHeroSelect from '../Component/AntiTDHeroSelect';
import AntiTDItemDialog from '../Dialogs/AntiTDItemDialog';
import AntiTDItem from '../Component/Item/AntiTDItem';
import AntiTDEnergyBall from '../Component/AntiTDEnergyBall';
import { HeroListData } from '@/helper/interface/Hero';
import { AntiTDEnemyIndicator, AntiTDHeroIndicator } from '../Component/AntiTDIndicator';
import SoundPool from '../../Common/SoundPool';
import PlanetWarHelper from '@/views/H5/Helper/PlanetWarHelper';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import BaseItem from '../../../Scripts/Components/Combat/Item/BaseItem';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import {
  BattleUnitAttackMode,
  combatAudioUrl,
  CombatEffectId,
  combatEffectImgUrl,
  InteractionType,
} from '@/helper/enum/Combat';
import UIHelper from '@/views/H5/Helper/UIHelper';
import PlanetGameFSM from '@/views/H5/Scripts/Components/StateMachine/PlanetGameFSM';
import { AntiTDEnemy, AntiTDHero } from '../Component/Battle/AntiTDBattleUnit';
import { CombatComponent, ICombatScene } from '../../../Scripts/Components/Combat/Combat';
import { AntiTDHeroTeam } from '../Component/Battle/AntiTDBattleTeam';
import AntiTDGroups from '../Component/AntiTDGroups';
import { InfluenceTypeEffect } from '@/views/H5/Scripts/Components/Combat/Battle/Attribute';
import AntiTDHelper from '../Component/AntiTDHelper';
import PhaserHelper from '@/views/H5/Helper/PhaserHelper';

/** 英雄單位資料 */
export interface AntiTDHeroUnitData {
  /** 英雄資料 */
  data: HeroData;
  /** 星球大戰等級 */
  planetWarLevel: number;
  /** 裝備道具編號列表 */
  equipItemDataList: CombatItemData[];
}

export default class AntiTDGameScene extends BaseGameScene implements ICombatScene {
  /** 遊戲狀態機 */
  private gameFSM!: PlanetGameFSM;

  //#region readonly
  /** 波次提示位置 */
  private readonly waveTimerPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(935, -35);
  /** 波次間隔 */
  private readonly waveInterval: number = 10;
  /** 最大魔力值 */
  private readonly maximumEnergy = 1000;
  /** 使用到的英雄動畫類別 */
  private readonly heroAnimTypes = [CharacterAnimType.Idle, CharacterAnimType.Walk];
  /** 結果表演時的時間縮放 */
  private readonly onResultTimeScale = 0.4;
  /** 結果表演時的Tween時長 */
  private readonly onResultTweenDuration = 800;
  /** hpBa樣式配置 */
  private readonly hpBarConfig = {
    size: { width: 56, height: 12 },
    stroke: 2,
    padding: 2,
    radius: 4,
    frameColor: 0xffffff,
    backColor: 0x222222,
    frameAlpha: 0.8,
    backAlpha: 0.8,
  };
  /** UI縮放 */
  public readonly uiScale = 1 / AntiTDNumber.CameraZoom;
  //#endregion readonly

  //#region 串接網路端資料/靜態表資料
  /** 英雄靜態表 */
  private heroUnitDataList: AntiTDHeroUnitData[] = [];
  /** 接下來會出現的英雄 */
  private heroSelectDataList: AntiTDHeroUnitData[] = [];
  /** 特效靜態表 */
  private effectDataMap!: Map<number, EffectData>;
  /** 地圖靜態資料 */
  private tileMapData!: TileMapData;
  //#endregion 串接網路端資料/靜態表資料

  //#region Dialog
  /** 介面Dialog : 分數、生命、道具數量 */
  public guiDialog!: AntiTDGuiDialog;
  /** 波次倒數計時 */
  public waveTimerDialog!: WaveTimerDialog;
  /** 英雄道具介面 */
  private itemDialog!: AntiTDItemDialog;
  //#endregion Dialog

  //#region 遊戲內元件
  /** 音效Map */
  public audioMap!: Map<number, SoundPool>;
  /** 地圖 */
  private tilemap!: AntiTDTilemap;
  /** 英雄隊伍 */
  private heroTeam!: AntiTDHeroTeam;
  /** 英雄隊長 */
  public get heroTeamLeader(): AntiTDHero {
    return this.heroTeam.leader;
  }
  /** 波次計時器 */
  private waveTimer?: Phaser.Time.TimerEvent;
  /** 戰鬥系統元件 */
  public combatComponent!: CombatComponent;
  /** 群組管理 */
  private _combatGroups!: AntiTDGroups;
  public get combatGroups(): AntiTDGroups {
    return this._combatGroups;
  }
  /** 狀態特效對應表 */
  public combatInfluenceTypeEffectMap: Map<InteractionType, InfluenceTypeEffect[]> = new Map([
    [
      // 特效對應到什麼狀態
      InteractionType.Hp,
      [
        // Buff時的效果
        {
          // 觸發的當下要播的特效
          startEffectIdList: [],
          // 狀態持續時重複播放的特效
          persistentEffectIdList: [],
        },
        // Debuff時的效果
        {
          startEffectIdList: [CombatEffectId.HpDebuffStart],
          persistentEffectIdList: [CombatEffectId.HpDebuff],
        },
      ],
    ],
    [
      InteractionType.InteractionValue,
      [
        {
          startEffectIdList: [CombatEffectId.InteractionValueBuffStart],
          persistentEffectIdList: [CombatEffectId.InteractionValueBuff],
        },
        {
          startEffectIdList: [],
          persistentEffectIdList: [CombatEffectId.InteractionValueDebuff],
        },
      ],
    ],
    [
      InteractionType.LaunchRate,
      [
        {
          startEffectIdList: [CombatEffectId.LaunchRateBuffStart],
          persistentEffectIdList: [CombatEffectId.LaunchRateBuff],
        },
        {
          startEffectIdList: [],
          persistentEffectIdList: [CombatEffectId.LaunchRateDebuff],
        },
      ],
    ],
    [
      InteractionType.Defense,
      [
        {
          startEffectIdList: [],
          persistentEffectIdList: [CombatEffectId.DefenseBuff],
        },
        {
          startEffectIdList: [],
          persistentEffectIdList: [CombatEffectId.DefenseDebuff],
        },
      ],
    ],
    [
      InteractionType.Speed,
      [
        {
          startEffectIdList: [CombatEffectId.SpeedBuffStart],
          persistentEffectIdList: [CombatEffectId.SpeedBuff],
        },
        {
          startEffectIdList: [],
          persistentEffectIdList: [CombatEffectId.SpeedDebuff],
        },
      ],
    ],
    [
      InteractionType.Range,
      [
        {
          startEffectIdList: [CombatEffectId.RangeBuffStart],
          persistentEffectIdList: [CombatEffectId.RangeBuff],
        },
        {
          startEffectIdList: [],
          persistentEffectIdList: [CombatEffectId.RangeDebuff],
        },
      ],
    ],
    [
      InteractionType.AllPositive,
      [
        {
          startEffectIdList: [],
          persistentEffectIdList: [CombatEffectId.AllPositiveBuff],
        },
        {
          startEffectIdList: [CombatEffectId.AllPositiveDebuffStart],
          persistentEffectIdList: [CombatEffectId.AllPositiveDebuff],
        },
      ],
    ],
    [
      InteractionType.ClearNegative,
      [
        {
          startEffectIdList: [],
          persistentEffectIdList: [],
        },
        {
          startEffectIdList: [],
          persistentEffectIdList: [],
        },
      ],
    ],
    [
      InteractionType.Invincible,
      [
        {
          startEffectIdList: [],
          persistentEffectIdList: [CombatEffectId.Invincible],
        },
        {
          startEffectIdList: [],
          persistentEffectIdList: [CombatEffectId.Invincible],
        },
      ],
    ],
    [
      InteractionType.Revive,
      [
        {
          startEffectIdList: [],
          persistentEffectIdList: [],
        },
        {
          startEffectIdList: [],
          persistentEffectIdList: [],
        },
      ],
    ],
    [
      InteractionType.IgnoreFront,
      [
        {
          startEffectIdList: [],
          persistentEffectIdList: [],
        },
        {
          startEffectIdList: [],
          persistentEffectIdList: [],
        },
      ],
    ],
    [
      InteractionType.Freeze,
      [
        {
          startEffectIdList: [],
          persistentEffectIdList: [CombatEffectId.Freeze],
        },
        {
          startEffectIdList: [],
          persistentEffectIdList: [CombatEffectId.Freeze],
        },
      ],
    ],
  ]);
  //#endregion 遊戲內元件

  //#region 遊戲內暫存
  /** 分數累計 */
  private scoreCount: number = 0;
  /** 魔力值 */
  private currentEnergy: number = 50;
  /** 完成波數 */
  private finishedWaveCount: number = -1;
  /** 當前波次敵人初始數量 */
  private waveStartEnemyTeamCount: number = 0;
  /** 當前波次最低擊殺數 */
  private waveEnemyTeamKillsRequire: number = 0;
  /** 當前波次擊殺數 */
  private waveEnemyTeamKills: number = 0;
  /** 打倒敵人數。 key 為 enemy Id, value 為打倒數量 */
  private enemyKillsMap: Map<number, number> = new Map();
  //#endregion 遊戲內暫存

  //#region 動態世界寬高、顯示深度
  /** 世界上邊緣Y */
  public get worldTopEdgeY(): number {
    return -this.physics.world.bounds.height / 2;
  }
  /** 世界下邊緣Y */
  public get worldBottomEdgeY(): number {
    return this.physics.world.bounds.height / 2;
  }
  /** 世界左邊緣X */
  public get worldLeftEdgeX(): number {
    return -this.physics.world.bounds.width / 2;
  }
  /** 世界右邊緣X */
  public get worldRightEdgeX(): number {
    return this.physics.world.bounds.width / 2;
  }
  /** UI顯示深度 */
  public get uiDepth(): number {
    return this.physics.world.bounds.height;
  }
  //#endregion 動態世界寬高、顯示深度

  /** 判斷遊戲是否該結束 */
  public get isGameEnd(): boolean {
    // 隊伍死亡或波數清除完畢
    return this.heroTeam.isDead() || this.finishedWaveCount > this.gameData.enemies.length - 1;
  }

  //#region constructor、Phaser function
  constructor(private gameData: AntiTDGameData, private planetGameData: PlanetGameData) {
    super({ key: 'AntiTDGameScene' });
  }

  async preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);
    // 串接網路端遊戲資料
    this.initGameData();
    // 載入地圖
    this.initMapData();
    // 串接/載入英雄資料
    await this.initHeroData();
    // 載入敵人資料
    this.initEnemyData();
    // 載入遊戲中特效
    this.preloadEffect();
    // 載入遊戲中音效
    this.preloadAudio();
  }

  // 類似start
  create() {
    // 設定戰鬥系統相關元件
    this.setComabt();
    // 設定遊戲內用到的材質
    this.setTextures();
    // 設定特效動畫
    this.createEffect();
    // 設定音效群組
    this.createAudio();
    // 設定英雄
    this.setHeroTeam();
    // 設定世界大小、邊界碰撞
    this.setWorld();
    // 設置Dialog
    this.setDialog();
    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  fixedUpdate(time: number, delta: number) {
    // 更新狀態機
    this.gameFSM.update(delta);
    // 隱藏擋住英雄隊長的UI
    this.hiddenUIWhenBlocked();
  }

  /** 隱藏擋住英雄隊長的UI */
  private hiddenUIWhenBlocked(): void {
    // 英雄隊長右緣與世界右緣距離
    const heroLeaderScreenRight =
      (this.heroTeamLeader.x + this.heroTeamLeader.displayWidth / 2 - this.cameras.main.worldView.x) *
      AntiTDNumber.CameraZoom;
    // 英雄隊長上緣與世界上緣距離
    const heroLeaderScreenTop =
      (this.heroTeamLeader.y - this.heroTeamLeader.upHalfDisplayHeight - this.cameras.main.worldView.y) *
      AntiTDNumber.CameraZoom;
    // 英雄隊長走到波次提示UI底下時，波次提示變透明
    if (
      heroLeaderScreenRight > this.guiDialog.progressBarComponentLeft &&
      heroLeaderScreenTop < this.guiDialog.waveProgressComponentDown
    ) {
      this.waveTimerDialog.setAlpha(0.45);
    } else {
      this.waveTimerDialog.setAlpha(1);
    }
    // 英雄隊長走到進度條UI底下時，進度條UI變透明
    if (
      heroLeaderScreenRight > this.guiDialog.progressBarComponentLeft &&
      heroLeaderScreenTop < this.guiDialog.progressBarComponentDown
    ) {
      this.guiDialog.setProgressBarComponentAlpha(0.45);
    } else {
      this.guiDialog.setProgressBarComponentAlpha(1);
    }
    // 英雄隊長走到目前波次進度UI底下時，目前波次進度UI變透明
    if (
      heroLeaderScreenRight > this.guiDialog.waveProgressComponentLeft &&
      heroLeaderScreenTop < this.guiDialog.waveProgressComponentDown
    ) {
      this.guiDialog.setWaveProgressComponentAlpha(0.45);
    } else {
      this.guiDialog.setWaveProgressComponentAlpha(1);
    }
  }
  //#endregion constructor、Phaser function

  //#region preload init data
  /** 取得網頁端資料 */
  private initGameData(): void {
    // 檢查敵人波數資料
    if (this.gameData.enemies === undefined || this.gameData.enemies.length < 1) {
      console.error(`無法取得gameData.enemies is null`);
      this.scene.stop();
      return;
    }
  }

  /** 載入地圖 */
  private initMapData(): void {
    const tileMapData = TableManager.antiTDMap.findOne(this.gameData.mapId);
    if (tileMapData === undefined) {
      console.error(`無法載入地圖，地圖id:${this.gameData.mapId}`);
      return;
    }
    this.tileMapData = tileMapData;

    this.load.tilemapTiledJSON(
      tileMapData.nameKey,
      PhaserHelper.ensureVersionedResourceUrl(`${antiTDJsonUrl}${tileMapData.url}`),
    );
  }

  /** 載入英雄 */
  private async initHeroData(): Promise<void> {
    for (const heroListData of this.gameData.heroListDataList) {
      const antiTDHeroData = TableManager.hero.findOne(heroListData.heroId);
      if (antiTDHeroData === undefined) {
        await InfoBox.defaultMessage([this], `英雄資料讀取失敗! 英雄ID: ${heroListData.heroId}`);
        console.error(`英雄資料讀取失敗! 英雄ID: ${heroListData.heroId}`);
        this.scene.stop();
        return;
      }

      // 動態載入英雄遊戲內頭像
      this.load.image(
        `${antiTDHeroData.nameKey}${HeroImgType.Ingame}`,
        PhaserHelper.ensureVersionedResourceUrl(`${HeroManager.getHeroImgUrl(heroListData, HeroImgType.Ingame)}`),
      );

      this.heroAnimTypes.forEach((animType: CharacterAnimType) => {
        // 動態載入英雄動畫
        AnimationHelper.loadCharacterSprite(this, antiTDHeroData, CharacterType.Hero, animType);
      });

      // 英雄攜帶的道具資料
      const itemDataList: CombatItemData[] = [];
      heroListData.equipItemIds.forEach((itemId: number) => {
        // 未攜帶的資料不處理
        if (itemId === 0) {
          return;
        }

        const itemData = TableManager.antiTDItem.findOne(itemId);
        if (itemData == null) {
          console.error(`Can not find itemData, itemId = ${itemId}`);
          return;
        }

        itemDataList.push(itemData);
      });

      // 載入英雄攜帶的道具圖片
      itemDataList.forEach((itemData: CombatItemData) => {
        this.load.image(
          `${itemData.nameKey}`,
          PhaserHelper.ensureVersionedResourceUrl(`${antiTDImgUrl}/Item/${itemData.url}`),
        );
      });

      /** 2022/08/08 企劃Jimmy要求取消英雄等級限制功能
      // 英雄限制等級
      const heroCappedLevel = heroListData.level; // Math.min(heroListData.level, this.gameData.heroLevelCap);
      const itemLevel = AntiTDHelper.getHeroItemLevel(heroCappedLevel);
      */
      const planetWarLevel = PlanetWarHelper.getHeroPlanetWarLevel(heroListData.level);

      // 紀錄英雄資料
      this.heroUnitDataList.push({
        data: antiTDHeroData,
        planetWarLevel,
        equipItemDataList: itemDataList,
      });
    }

    // 更新之後會出場的英雄列表
    this.heroSelectDataList = this.heroUnitDataList.slice();
  }

  /** 從敵人/敵人隊伍靜態表  */
  private initEnemyData(): void {
    const antiTDEnemyList = TableManager.antiTDEnemy.getAll();
    antiTDEnemyList.forEach((antiTDEnemyData: AntiTDEnemyData) => {
      // 動態載入敵人走路動畫
      AnimationHelper.loadCharacterSprite(this, antiTDEnemyData, CharacterType.Enemy, CharacterAnimType.Walk);
    });
  }

  /** 從特效靜態表載入動畫，並記錄 */
  public preloadEffect(): void {
    // 需要的特效ID
    let effectIds: number[] = [];
    // 英雄普攻特效
    this.heroUnitDataList.forEach((unitData: AntiTDHeroUnitData) => {
      const normalAttackEffectIds = this.getEffectIdFromItemId(unitData.data.antiTDItemId);
      effectIds = effectIds.concat(normalAttackEffectIds);
    });
    // 英雄道具特效
    this.gameData.heroListDataList.forEach((listData: HeroListData) => {
      listData.equipItemIds.forEach((equipItemId: number) => {
        // equipItemId = 0 表示未裝備道具
        if (equipItemId === 0) {
          return;
        }
        const equipEffectIds = this.getEffectIdFromItemId(equipItemId);
        effectIds = effectIds.concat(equipEffectIds);
      });
    });
    // 敵人普攻特效
    const antiTDEnemyList = TableManager.antiTDEnemy.getAll();
    antiTDEnemyList.forEach((enemyData: AntiTDEnemyData) => {
      const normalAttackEffectIds = this.getEffectIdFromItemId(enemyData.antiTDItemId);
      effectIds = effectIds.concat(normalAttackEffectIds);
    });

    // 載入被標記特效
    effectIds.push(CombatEffectId.MarkedEffectId);

    // 載入狀態特效
    for (const influenceTypeEffects of this.combatInfluenceTypeEffectMap.values()) {
      influenceTypeEffects.forEach((influenceTypeEffect: InfluenceTypeEffect) => {
        effectIds.push(...influenceTypeEffect.startEffectIdList);
        effectIds.push(...influenceTypeEffect.persistentEffectIdList);
      });
    }

    // 移除重複特效id
    const uniqueEffectIds = effectIds.filter((value: number, index: number) => effectIds.indexOf(value) === index);
    // 轉換成特效資料
    const effectDataList: EffectData[] = [];
    uniqueEffectIds.forEach((effectId: number) => {
      const effectData = TableManager.combatEffect.findOne(effectId);

      if (effectData == null) {
        console.error(`Can not find effectData, effectId = ${effectId}`);
        return;
      }

      effectDataList.push(effectData);
    });

    // 載入特效
    effectDataList.forEach((effectData: EffectData) => {
      this.load.spritesheet(
        effectData.nameKey,
        PhaserHelper.ensureVersionedResourceUrl(`${combatEffectImgUrl}/${effectData.url}`),
        {
          frameWidth: effectData.frameSize,
          frameHeight: effectData.frameSize,
        },
      );
    });
    // 儲存特效資料map
    this.effectDataMap = new Map(effectDataList.map((value: EffectData) => [value.id, value]));
  }

  /** 從音效靜態表載入音效 */
  public preloadAudio(): void {
    TableManager.combatAudio.getAll().forEach((value: AudioData) => {
      this.load.audio(value.nameKey, `${combatAudioUrl}/${value.url}`);
    });
  }

  /** 獲取戰鬥單位道具資料
   * @param unitData 戰鬥單位資料
   * @param level 等級(自定義計算)
   * @returns 道具資料
   */
  public getBattleUnitItemData(unitData: HeroData, level: number): CombatItemData | undefined {
    const itemData = AntiTDHelper.getBattleUnitItemData(unitData, level);
    if (itemData === undefined) {
      console.error(`BattleUnit init fail, can not find itemData, baseItem: ${unitData}, itemLevel: ${level}`);
    }

    return itemData;
  }

  /** 從道具Id來獲取用到的特效Id
   * @param itemId 道具Id
   * @returns 特效Id
   */
  private getEffectIdFromItemId(itemId: number): number[] {
    // 找到道具資料
    const itemData = this.getItemData(itemId);
    if (itemData == null) {
      // getItemData裡面已經有報錯，此處不需要
      return [];
    }

    // 獲取該道具所需特效
    const effectIds: number[] = [
      ...itemData.channelEffectIdList,
      ...itemData.effectIdList,
      ...itemData.fillEffectIdList,
      ...itemData.onHitEffectIdList,
      ...itemData.onHitObstacleEffectIdList,
    ];

    // 檢查是否有擊中生成的道具
    if (itemData.spawnOnHitItemId !== -1) {
      effectIds.push(...this.getEffectIdFromItemId(itemData.spawnOnHitItemId));
    }

    return effectIds;
  }
  //#endregion preload init data

  //#region create set data
  /** 設置材質 */
  private setTextures(): void {
    // 創建繪圖用Graphics
    const drawGraphics = new Phaser.GameObjects.Graphics(this);

    const offsetX = -this.hpBarConfig.size.width / 2;
    const offsetY = -this.hpBarConfig.size.height / 2;

    // 設定外框及內框樣式
    drawGraphics.fillStyle(this.hpBarConfig.backColor, this.hpBarConfig.backAlpha);
    drawGraphics.fillRoundedRect(
      offsetX,
      offsetY,
      this.hpBarConfig.size.width,
      this.hpBarConfig.size.height,
      this.hpBarConfig.radius,
    );
    drawGraphics.lineStyle(this.hpBarConfig.stroke, this.hpBarConfig.frameColor, this.hpBarConfig.frameAlpha);
    drawGraphics.strokeRoundedRect(
      offsetX,
      offsetY,
      this.hpBarConfig.size.width,
      this.hpBarConfig.size.height,
      this.hpBarConfig.radius,
    );

    // 將框轉為Texture儲存
    const bgRenderTexture = this.make.renderTexture(
      { width: this.hpBarConfig.size.width, height: this.hpBarConfig.size.height },
      false,
    );
    bgRenderTexture.draw(drawGraphics, this.hpBarConfig.size.width / 2, this.hpBarConfig.size.height / 2);
    bgRenderTexture.saveTexture(AntiTDString.HpBarBg);

    // 清除繪圖用Graphics
    drawGraphics.clear();

    // 設定滑條樣式
    drawGraphics.fillStyle(UIHelper.whiteNumber, 1);
    const width = this.hpBarConfig.size.width - this.hpBarConfig.padding * 2;
    const radius = Math.min(this.hpBarConfig.radius - this.hpBarConfig.padding, width);
    drawGraphics.fillRoundedRect(
      offsetX + this.hpBarConfig.padding,
      offsetY + this.hpBarConfig.padding,
      width,
      this.hpBarConfig.size.height - this.hpBarConfig.padding * 2,
      radius,
    );

    // 將滑條為Texture儲存
    const barRenderTexture = this.make.renderTexture(
      { width: this.hpBarConfig.size.width, height: this.hpBarConfig.size.height },
      false,
    );
    barRenderTexture.draw(drawGraphics, this.hpBarConfig.size.width / 2, this.hpBarConfig.size.height / 2);
    barRenderTexture.saveTexture(AntiTDString.HpBarValue);

    // 清除繪圖用Graphics
    drawGraphics.clear();
    drawGraphics.destroy(true);
  }

  /** 設置動畫 */
  public createEffect(): void {
    // 設置英雄動畫
    this.heroUnitDataList.forEach((heroUnitData: AntiTDHeroUnitData) => {
      this.heroAnimTypes.forEach((animType: CharacterAnimType) =>
        AnimationHelper.createCharacterAnim(this, heroUnitData.data, animType),
      );
    });

    // 敵人走路動畫
    const antiTDEnemyList = TableManager.antiTDEnemy.getAll();
    antiTDEnemyList.forEach((enemyData: AntiTDEnemyData) =>
      AnimationHelper.createCharacterAnim(this, enemyData, CharacterAnimType.Walk),
    );

    // 特效常駐動畫
    this.effectDataMap.forEach((effectData: EffectData) => {
      AnimationHelper.createSpriteAnimFromEffectData(this, effectData);
    });
  }

  /** 設置音效池 */
  public createAudio(): void {
    this.audioMap = new Map(
      TableManager.combatAudio.getAll().map((data: AudioData) => {
        const audio = new SoundPool(this, data.nameKey);
        return [data.id, audio];
      }),
    );
  }

  /** 設定戰鬥系統相關元件 */
  private setComabt(): void {
    // 戰鬥元件
    this.combatComponent = new CombatComponent(this);
    // 戰鬥群組
    this._combatGroups = new AntiTDGroups(this);
    this._combatGroups.init();
  }

  /** 設置英雄隊伍及隊長物件 */
  private setHeroTeam(): void {
    // 取得英雄隊長資料
    const heroUnitData = this.heroSelectDataList.shift();
    if (heroUnitData === undefined) {
      console.error(`初始化英雄隊伍失敗，找不到任何英雄資料`);
      return;
    }
    // 創建英雄隊長
    const hero = this.createHeroInstance(heroUnitData);
    if (hero === undefined) {
      return;
    }
    // 設置隊伍
    const heroTeam = this.combatGroups.getMemberFromGroup<AntiTDHeroTeam>(AntiTDHeroTeam.name);
    if (heroTeam == null) {
      console.error(`初始化英雄隊伍失敗，創建隊伍失敗`);
      return;
    }
    this.heroTeam = heroTeam;
    this.heroTeam.setTeam([hero]);
  }

  /** 設置怪物波數 */
  private async setWave(): Promise<void> {
    // 當前波次擊殺數低於當前波次最低擊殺數，遊戲結束
    if (this.waveEnemyTeamKills < this.waveEnemyTeamKillsRequire) {
      this.heroTeam.dead();
      return;
    }

    // 開始生成下一波怪
    this.finishedWaveCount++;
    // 若超過最後一回合
    if (this.finishedWaveCount > this.gameData.enemies.length - 1) {
      return;
    }
    // 不是第一個波次的話
    if (this.finishedWaveCount !== 0) {
      const firstAliveHeroSelect = this.combatGroups.getGroup(AntiTDHeroSelect.name)?.getFirstAlive();
      // 假如場上沒有選角物件，且可出場英雄數量大於0，生成英雄選角物件
      if (firstAliveHeroSelect == null && this.heroSelectDataList.length > 0) {
        this.spawnHeroSelect();
      }
      // 下一波數提示
      await this.waveTimerDialog.showWavePrompt(this.waveInterval);
    }

    // 顯示目前波次PopUp
    this.guiDialog.showWavePrompt(this.finishedWaveCount);
    // 更新目前波次進度
    this.guiDialog.updateCurrentWaveProgress(this.finishedWaveCount);

    // 設置狀態的資料
    const stateData = this.gameData.enemies[this.finishedWaveCount];

    // 生成敵人隊伍
    let enemyIdIndex = 0;
    for (let index = 0; index < stateData.enemyCount; index++) {
      // 根據生成方式挑選要生成的敵人隊伍Id
      let enemyTeamId = stateData.enemies[0];
      switch (stateData.mode) {
        case EnemyWaveMode.Order:
          enemyTeamId = stateData.enemies[enemyIdIndex++];
          if (enemyIdIndex > stateData.enemies.length - 1) {
            enemyIdIndex = 0;
          }
          break;
        case EnemyWaveMode.Random:
          enemyTeamId = Phaser.Math.RND.pick(stateData.enemies);
          break;
      }

      // 以關卡波次來決定敵人隊伍等級
      this.spawnEnemyTeam(enemyTeamId, stateData.itemLevel);
    }

    // 設定當前波次敵人初始數量
    this.waveStartEnemyTeamCount = this.combatGroups.getTotalAliveEnemyTeam();
    // 設定當前波次最低擊殺數
    this.waveEnemyTeamKillsRequire = Math.ceil(
      this.waveStartEnemyTeamCount * AntiTDNumber.WaveEnemyTeamKillsRequireRate,
    );
    // 設定當前波次擊殺數
    this.waveEnemyTeamKills = 0;

    // 重置進度條
    this.guiDialog.updateProgressBar(0, this.waveStartEnemyTeamCount);

    // 設置波數計時器
    this.waveTimer = this.time.addEvent({
      delay: stateData.time * 1000,
      callback: () => {
        // 觸發callback就移除
        if (this.waveTimer) {
          this.time.removeEvent(this.waveTimer);
          this.waveTimer = undefined;
        }

        // 觸發下一階段
        this.setWave();
      },
    });
    // 更新當前波次剩餘時間
    this.timerDialog?.startCountdown(stateData.time);
  }

  /** 生成英雄選角物件 */
  private spawnHeroSelect(): void {
    // 篩選掉距離英雄隊伍隊長太近的Tile
    const tilesAwayFromHero = this.tilemap.heroSpawnTiles.filter((tile: Phaser.Tilemaps.Tile) => {
      const distance = Phaser.Math.Distance.Between(
        tile.getCenterX(),
        tile.getCenterY(),
        this.heroTeamLeader.x,
        this.heroTeamLeader.y,
      );
      // 與英雄隊長大於3個角色的距離
      return distance > this.heroTeamLeader.height * 3;
    });
    // 檢查篩選後的數量是否足夠生成選角物件
    if (tilesAwayFromHero.length < this.heroSelectDataList.length) {
      console.error(`經過篩選，遠離英雄隊伍隊長且可生成英雄的Tile數量小於可出場的英雄數量，無法生成英雄選角物件`);
      console.error(`請調整地圖增加可生成英雄的Tile數量或調整密集程度，使可生成英雄的Tile分散`);
      return;
    }

    // 將生成地點順序打亂
    const spawnTiles = Phaser.Math.RND.shuffle(tilesAwayFromHero);
    this.heroSelectDataList.forEach((heroUnitData: AntiTDHeroUnitData) => {
      // 挑選隨機生成地點
      const spawnTile = spawnTiles.pop();
      if (spawnTile === undefined) {
        console.error(`無法從AntiTDGameScene.spawnHeroSelect.spawnTiles中取出Tile，請檢查程式邏輯.`);
        return;
      }
      // 取得選角物件
      const heroSelect = this.combatGroups.getMemberFromGroup<AntiTDHeroSelect>(AntiTDHeroSelect.name);
      if (heroSelect === undefined) {
        return;
      }
      // 讓英雄選角物件切齊tile底部
      heroSelect.setPosition(
        spawnTile.getCenterX(),
        spawnTile.getCenterY() - (heroSelect.height - spawnTile.height) / 2,
      );
      heroSelect.init(heroUnitData);

      // 取得英雄選角指標
      const heroIndicator = this.combatGroups.getMemberFromGroup<AntiTDHeroIndicator>(AntiTDHeroIndicator.name);
      if (heroIndicator === undefined) {
        return;
      }
      // 初始化英雄選角指標
      heroIndicator.init(heroSelect);
    });

    // 提示可以選角
    this.guiDialog.playHeroAvailableHint();
  }

  /** 生成敵人隊伍
   * @param enemyTeamId 敵人隊伍id
   * @param itemLevel 敵人道具等級
   */
  private spawnEnemyTeam(enemyTeamId: number, itemLevel: number): void {
    const enemyTeamData = TableManager.antiTDEnemyTeam.findOne(enemyTeamId);
    if (enemyTeamData === undefined) {
      console.error(`找不到敵人隊伍資料，隊伍id: ${enemyTeamId}`);
      return;
    }

    // 獲取生成位置
    const spawnPointIds: number[] = JSON.parse(enemyTeamData.spawnPointIds);
    const spawnPoint = this.tilemap.getEnemyTeamSpawnPoint(spawnPointIds);

    // 敵人隊伍成員id
    const teamMemberIds: number[] = [];
    // 可能出現的敵人隊伍成員id
    const possibleMemberIds: number[] = JSON.parse(enemyTeamData.enemiesId);
    // 隨機抽取敵人id
    for (let index = 0; index < enemyTeamData.teamLength; index++) {
      const memberId = Phaser.Math.RND.pick(possibleMemberIds);
      teamMemberIds.push(memberId);
    }
    // 假如有指定敵人隊伍隊長
    if (enemyTeamData.leaderEnemyId !== -1) {
      teamMemberIds[0] = enemyTeamData.leaderEnemyId;
    }

    // 嘗試創建所有敵人
    const enemyGroup = this.combatGroups.getGroup(AntiTDEnemy.name);
    const enemies: AntiTDEnemy[] = [];
    for (const enemyId of teamMemberIds) {
      const enemy: AntiTDEnemy = enemyGroup?.get();
      // 讓敵人腳底切齊tile底部
      enemy.setPosition(spawnPoint.x, spawnPoint.y - (enemy.height - spawnPoint.height) / 2);
      const enemyData = TableManager.antiTDEnemy.findOne(enemyId);
      if (enemy !== undefined && enemyData !== undefined) {
        enemy.init(enemyData, itemLevel, 1, enemyTeamData.attackMode, enemyTeamData.ignoreObstacle);
        enemies.push(enemy);
      }
    }

    // 設置敵人隊伍
    const enemyTeamGroup = this.combatGroups.getGroup(enemyTeamData.moveMode);
    const enemyTeam = enemyTeamGroup?.get();
    if (enemyTeam !== undefined) {
      enemyTeam.setTeamByTeamData(enemies, enemyTeamData, spawnPoint);
    }

    // 指標追蹤
    const enemyIndicator = this.combatGroups.getMemberFromGroup<AntiTDEnemyIndicator>(AntiTDEnemyIndicator.name);
    enemyIndicator?.init(enemyTeam.leader);
  }

  /** 設置遊戲世界 */
  private setWorld(): void {
    // 創建地圖
    this.tilemap = new AntiTDTilemap(this, 0, 0, this.tileMapData.nameKey);
    this.tilemap.init();

    // 依照地圖調整遊戲世界大小
    this.physics.world.setBounds(
      -this.tilemap.layer.width / 2,
      -this.tilemap.layer.height / 2,
      this.tilemap.layer.width,
      this.tilemap.layer.height,
    );
    // 設置遊戲世界邊界碰撞(防止角色超出遊戲邊界)
    this.physics.world.setBoundsCollision();

    // 將英雄隊長移動到隨機出生位置
    const spawnTile = Phaser.Math.RND.pick(this.tilemap.heroSpawnTiles);
    this.heroTeam.leader.setPosition(
      spawnTile.getCenterX(),
      spawnTile.getCenterY() - (this.heroTeam.leader.height - spawnTile.height) / 2,
    );

    // 設置鏡頭跟隨玩家操控的英雄隊長
    this.cameras.main.setZoom(AntiTDNumber.CameraZoom);
    this.cameras.main.startFollow(this.heroTeam.leader);
    this.cameras.main.setFollowOffset(0, -AntiTDNumber.CameraOffsetY);

    // 設置鏡頭邊界
    this.cameras.main.setBounds(
      -this.tilemap.layer.width / 2,
      -this.tilemap.layer.height / 2,
      this.tilemap.layer.width,
      this.tilemap.layer.height,
    );
  }

  /** 設定背景、Gui等Dialog */
  private setDialog(): void {
    // 開啟Gui
    this.guiDialog = UIManager.instance.openDialog(AntiTDGuiDialog, this);
    this.guiDialog.setDepth(this.uiDepth);
    this.guiDialog.setScrollFactor(0);
    this.guiDialog.updateEnergyBar(this.currentEnergy, this.maximumEnergy);
    this.guiDialog.updateProgressBar(0, 1);
    this.guiDialog.updateCurrentWaveProgress(this.finishedWaveCount);
    this.guiDialog.updateTotalWaveProgress(this.gameData.enemies.length);
    this.guiDialog.setScale(this.uiScale);
    this.guiDialog.setPosition(
      (1 - this.uiScale) * (this.guiDialog.width / 2),
      (1 - this.uiScale) * (this.guiDialog.height / 2),
    );

    // 開啟道具UI
    this.itemDialog = UIManager.instance.openDialog(AntiTDItemDialog, this);
    this.itemDialog.setDepth(this.uiDepth);
    this.itemDialog.init(this.heroUnitDataList);
    this.itemDialog.setScale(this.uiScale);
    // 更新英雄道具欄位顯示
    this.itemDialog.updateHeroItems(this.heroTeam.battleUnits, this.currentEnergy);

    // 當前波數倒數UI
    this.setTimerDialog(0, this.uiDepth);
    this.timerDialog?.setScale(this.uiScale);
    this.timerDialog?.setPosition(
      (1 - this.uiScale) * (this.timerDialog.width / 2),
      (1 - this.uiScale) * (this.timerDialog.height / 2),
    );
    this.timerDialog?.setVisible(false);
    // 切換回此遊戲視窗時同步計時秒數
    this.game.events.on('visible', () => {
      this.timerDialog?.startCountdown(this.waveTimer ? this.waveTimer?.getOverallRemainingSeconds() : 0);
    });

    // 下一波數倒數UI
    this.waveTimerDialog = UIManager.instance.openDialog(WaveTimerDialog, this);
    this.waveTimerDialog.setDepth(this.uiDepth);
    this.waveTimerDialog.setScrollFactor(0);
    this.waveTimerDialog.setPosition(this.waveTimerPosition.x, this.waveTimerPosition.y);
    this.waveTimerDialog.hideWavePrompt();
    this.waveTimerDialog.setScale(this.uiScale * 0.85);
  }
  //#endregion create set data

  //#region FSM
  /** 設定狀態機
   * @param gameFSM
   */
  public setGameFSM(gameFSM: PlanetGameFSM): void {
    this.gameFSM = gameFSM;
  }

  /** 遊戲開場，播放遊戲動畫 */
  public async onOpeningEnter(): Promise<void> {
    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();
  }

  /** 遊戲開始 */
  public onGameEnter(): void {
    // 設定波數
    this.setWave();

    // 英雄隊伍進入移動狀態
    this.heroTeam.move();
  }

  /** 遊戲進行Update */
  public onGameUpdate(): void {
    // 顯示當前波數剩餘時間
    const waveTimerRemainingSeconds = this.waveTimer ? this.waveTimer.getRemainingSeconds() : Infinity;
    this.timerDialog?.setVisible(waveTimerRemainingSeconds <= 30);
  }

  /** 遊戲結束 */
  public async onPlanetResultEnter(): Promise<void> {
    // 速度變慢
    this.setTimeScale(this.onResultTimeScale);
    // 鏡頭拉近
    const tween = this.tweens.add({
      targets: this.cameras.main,
      duration: this.onResultTweenDuration,
      zoom: {
        from: AntiTDNumber.CameraZoom,
        to: AntiTDNumber.CameraZoomOnResult,
      },
    });
    await AsyncHelper.pendingUntil(() => tween.totalProgress === 1);
  }

  /** 遊戲結算 */
  public async onPlanetEndingEnter(): Promise<PlanetWarResult> {
    // 星星數: 打倒全部wave的敵人就3顆星, 每少打倒一波就減一顆星
    const starCount = 3 - (this.gameData.enemies.length - this.finishedWaveCount);
    const endType = starCount > 0 ? EndType.Success : EndType.Fail;

    // 假如星星數0顆(失敗)，且未完成擊殺要求，顯示提示UI
    if (endType === EndType.Fail && this.heroTeamLeader.isAlive) {
      await this.guiDialog.showTimeUpWarning();
    }

    // 英雄隊伍死亡，停止操控
    this.heroTeam.dead();
    // 清除所有事件
    this.removePhaserEvent();
    // 因道具使用到pendingUntil，因此需要關閉所有道具，確保程序不會卡死在pending
    this.combatGroups.getItemGroups().forEach((itemGroup: Phaser.GameObjects.Group) => {
      itemGroup.getChildren().forEach((itemGameObject: Phaser.GameObjects.GameObject) => {
        const item = itemGameObject as BaseItem;
        item.killAndHide();
      });
    });
    // pendingUntil 偵測間隔為0.1秒，因此在這等候一秒
    // 讓所有使用到的 pendingUntil 的邏輯，有0.1秒的時間自然清除
    await AsyncHelper.sleep(0.2);

    // 暫停遊戲
    this.pauseScene();

    // 轉換敵人擊殺格式
    const dieEnemyArray: EnemyResultData[] = [];
    this.enemyKillsMap.forEach((value, key) => {
      // 加進打倒敵人清單
      dieEnemyArray.push({ enemyId: key, enemyCount: value });
    });

    // 遊戲時間
    const gameTime = this.game.getTime() / 1000;

    // 回傳星球大戰結算資料
    return {
      endType,
      gameResult: {
        learnLid: this.planetGameData.learnLid,
        hid: this.gameData.heroListDataList[0].hid,
        gameSec: gameTime,
        dieEnemys: dieEnemyArray,
        overWaveCount: endType === EndType.Success ? this.finishedWaveCount : 0,
        setWeapons: [],
        learnLogId: this.planetGameData.learnLogId,
        msgId: this.planetGameData.msgId,
      },
    };
  }
  //#endregion FSM

  //#region 獲取靜態資料
  /** 獲取道具資料
   * @param itemId 道具id
   */
  public getItemData(itemId: number): CombatItemData | undefined {
    const itemData = TableManager.antiTDItem.findOne(itemId);
    if (itemData === undefined) {
      console.error(`無法從 AntiTDGameScene.itemDataMap 中獲取 itemId = ${itemId} 的道具資料`);
    }
    return itemData;
  }
  //#endregion 獲取靜態資料

  //#region 表演(動畫、音效)
  /** 播放音效
   * @param audioId 音效id
   */
  public playAudio(audioId: number): void {
    const audio = this.audioMap.get(audioId);
    audio?.play();
  }
  //#endregion 表演(動畫、音效)

  //#region 遊戲邏輯
  /** 創建英雄Instance
   * @param unitData 英雄資料
   * @returns 英雄Instance
   */
  public createHeroInstance(unitData: AntiTDHeroUnitData): AntiTDHero | undefined {
    // 隊伍排序順位
    const teamOrder = this.heroUnitDataList.indexOf(unitData);
    // 創建英雄Instance
    const hero = this.combatGroups.createMemberFromGroup<AntiTDHero>(AntiTDHero.name);
    if (hero === undefined) {
      console.error(`AntiTDGameScene.createHeroInstance 無法創建英雄Instance.`);
      return undefined;
    }
    // 初始化英雄
    hero.init(unitData.data, unitData.planetWarLevel, teamOrder, BattleUnitAttackMode.Active, false);
    return hero;
  }

  /** 使用道具
   * @param heroId 英雄id
   * @param item 道具
   * @returns
   */
  public async useItem(heroId: number, item: AntiTDItem): Promise<void> {
    // 不在遊戲狀態不給使用
    if (this.gameFSM.isGameState === false) {
      return;
    }

    // 尋找對應英雄
    const hero = this.heroTeam.battleUnits.find((antiTDHero: AntiTDHero) => antiTDHero.unitId === heroId);
    // 找不到對應英雄
    if (hero === undefined) {
      console.error(`找不到與此道具綁定的英雄，heroId = ${heroId}`);
      return;
    }

    // 道具在執行或冷卻中
    if (item.isHighlight || item.isBlock) {
      // 道具不可使用提示
      this.guiDialog.playItemNotAvailableHint();
      return;
    }

    // 現有魔力不足
    if (item.itemData.magic > this.currentEnergy) {
      // 魔力不足提示
      this.guiDialog.playNotEnoughEnergyHint();
      return;
    }

    // 扣減魔力
    this.updateEnergy(-item.itemData.magic);
    // 使用道具
    await this.itemDialog.setHighlightPendingUntil(item, hero.useItem(item.itemData));
    // 道具使用完開始冷卻
    this.itemDialog.setCountDownPendingUntil(item);
  }

  /** 當敵方隊伍死亡 */
  public async onEnemyTeamDead(): Promise<void> {
    // 更新進度條
    this.waveEnemyTeamKills += 1;
    this.guiDialog.updateProgressBar(this.waveEnemyTeamKills, this.waveStartEnemyTeamCount);

    // 判斷是否有任何敵人隊伍生還
    const isAllEnemyTeamDead = this.combatGroups.getTotalAliveEnemyTeam() === 0;

    // 若場上無生還敵方隊伍 且 波次計時器尚在運作
    if (isAllEnemyTeamDead && this.waveTimer) {
      // 中止計時器並提早前往下一階段
      this.time.removeEvent(this.waveTimer);
      this.waveTimer = undefined;
      await this.setWave();
    }
    // 若無計時器運作表示處於波次轉換過程中，讓波次自動轉換，不處理
  }

  /** 當英雄選擇下一隻隊伍角色
   * @param heroUnitData 選擇的隊伍角色資料
   */
  public onHeroSelect(heroUnitData: AntiTDHeroUnitData): void {
    // 清除剩餘英雄選擇元件
    const heroSelectGroup = this.combatGroups.getGroup(AntiTDHeroSelect.name);
    heroSelectGroup?.getMatching('active', true).forEach((heroSelect: AntiTDHeroSelect) => {
      heroSelectGroup.killAndHide(heroSelect);
    });

    // 將出場的英雄資料移除
    this.heroSelectDataList = this.heroSelectDataList.filter(
      (unitData: AntiTDHeroUnitData) => unitData.data.id !== heroUnitData.data.id,
    );

    // 創建英雄
    const hero = this.createHeroInstance(heroUnitData);
    if (hero == null) {
      return;
    }

    // 加入英雄隊伍
    this.heroTeam.addBattleUnit(hero);
  }

  /** 生成能量球
   * @param x 位置x
   * @param y 位置y
   * @param energy 能量值
   */
  public spawnEnergyBall(x: number, y: number, energy: number): void {
    const energyBall = this.combatGroups.getMemberFromGroup<AntiTDEnergyBall>(AntiTDEnergyBall.name);
    energyBall?.init(energy);
    energyBall?.setPosition(x, y);
  }
  //#endregion 遊戲邏輯

  //#region 介面顯示相關
  /** 改變魔力量
   * @param energy 要改變的量，<0為扣魔力
   */
  public updateEnergy(energy: number): void {
    // 限制能量區間
    this.currentEnergy += energy;
    this.currentEnergy = Phaser.Math.Clamp(this.currentEnergy, 0, 1000);

    // 更新魔力顯示
    this.guiDialog.updateEnergyBar(this.currentEnergy, 1000);

    this.itemDialog.updateHeroItems(this.heroTeam.battleUnits, this.currentEnergy);
  }

  /** 改變分數
   * @param score 要改變的量
   */
  public updateScore(score: number): void {
    // 限制分數區間
    this.scoreCount += score;
    this.scoreCount = Math.max(this.scoreCount, 0);
  }

  /** 紀錄敵人擊殺數
   * @param enemyId 敵人id
   */
  public updateEnemyKills(enemyId: number): void {
    const kills = this.enemyKillsMap.get(enemyId);
    this.enemyKillsMap.set(enemyId, kills ? kills + 1 : 1);
  }

  /** 更新英雄道具
   * @param heros 道具對應的英雄
   */
  public updateHeroItems(heros: AntiTDHero[]): void {
    this.itemDialog.updateHeroItems(heros, this.currentEnergy);
  }

  /** 顯示狀態圖示
   * @param hero 對應英雄
   * @param itemNameKey 狀態圖示
   */
  public showHeroItemStateIcon(hero: AntiTDHero, itemNameKey: string): void {
    this.itemDialog.showHeroItemStateIcon(hero, itemNameKey);
  }

  /** 關閉狀態圖示
   * * @param hero 對應英雄
   * @param itemNameKey 狀態圖示
   */
  public hideHeroItemStateIcon(hero: AntiTDHero, itemNameKey: string): void {
    this.itemDialog.hideHeroItemStateIcon(hero, itemNameKey);
  }

  /** 清除狀態圖示
   *  @param hero 對應英雄
   */
  public clearHeroItemStateIcon(hero: AntiTDHero): void {
    this.itemDialog.clearHeroItemStateIcon(hero);
  }

  /** 判斷pointer是否在UI之上
   * @param pointer pointer
   * @returns 是否在UI之上
   */
  public isPointerAboveItemDialog(pointer: Phaser.Input.Pointer): boolean {
    return this.itemDialog.isPointerAboveUI(pointer);
  }
  //#endregion 介面顯示相關
}
