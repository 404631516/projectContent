import {
  BattleUnitAttackMode,
  combatEffectImgUrl,
  InteractionEffect,
  InteractionType,
  combatAudioUrl,
  CombatEffectId,
} from '@/helper/enum/Combat';
import { GameType } from '@/helper/enum/Common';
import { CharacterAnimType, CharacterType } from '@/helper/enum/PhaserGame';
import { ContestPlayerData, PiggyGameData, PiggyGameLog, TotalProps } from '@/helper/interface/Game';
import TableManager, {
  AudioData,
  CombatItemData,
  EffectData,
  HeroData,
  PiggyEnemyData,
  PiggyEnemyPatternData,
  PiggyItemData,
  PiggySpawnData,
  PiggyWaveData,
} from '@/manager/TableManager';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { Align, CompassRad } from '@/views/H5/Helper/MathHelper';
import PhaserHelper, { Size } from '@/views/H5/Helper/PhaserHelper';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import { defaultItemOperationList, InfluenceTypeEffect } from '@/views/H5/Scripts/Components/Combat/Battle/Attribute';
import CombatPopUpNumberTween from '@/views/H5/Scripts/Components/Combat/Component/CombatPopUpNumberTween';
import { CanNotPassObstacle } from '@/views/H5/Scripts/Components/Combat/Component/MapObstacle';
import InfoBox from '@/views/H5/Scripts/Components/InfoBox';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import UIManager from '@/views/H5/Scripts/Manager/UIManager';
import { CombatComponent, ICombatScene } from '../../../Scripts/Components/Combat/Combat';
import SoundPool from '../../Common/SoundPool';
import ItemDialog from '../../UIHelper/ItemDialog';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import PiggyAttackPointGroup from '../Component/PiggyAttackPointGroup';
import PiggyEnemy from '../Component/PiggyEnemy';
import { PiggyEnemyTeam } from '../Component/PiggyEnemyTeam';
import PiggyGroups from '../Component/PiggyGroups';
import PiggyHero from '../Component/PiggyHero';
import { PiggyHeroTeam } from '../Component/PiggyHeroTeam';
import PiggyItem from '../Component/PiggyItem';
import {
  PiggyDepth,
  PiggyString,
  PiggyNumber,
  PiggyPatternOrderType,
  PiggyItemType,
  PiggyEffectId,
  PiggyWaveDifficulty,
} from '../Data/PiggyConfig';
import { piggyImgUrl } from '../Data/PiggyResource';
import PiggyBackgroundDialog from '../Dialogs/PiggyBackgroundDialog';
import PiggyGuiDialog from '../Dialogs/PiggyGuiDialog';

export default class PiggyGameScene extends BaseGameScene implements ICombatScene, IAnswerGame {
  /** 遊戲狀態機 */
  private gameFSM: AnswerGameFSM;

  //#region readonly
  /** 敵人出發平台初始x座標  */
  private readonly platformInitialPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1500, 100);
  /** 敵人出發平台座標 */
  private readonly platformPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(820, -50);
  /** 敵人出發平台動畫時間 */
  private readonly platformTweenDuration: number = 3000;

  /** 隱形牆位置 */
  private readonly invisibleWallPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(175, 250);
  /** 隱形牆大小 */
  private readonly invisibleWallsize: Size = { width: 10, height: 500 };

  /** 英雄初始位置 */
  private readonly heroPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(240, 120);
  /** 落石起點y座標 */
  private readonly rockFallStartPositionY: number = 50;

  /** 道具標籤寬度 */
  private readonly itemDialogTagWidth: number = 24;
  /** 道具標籤高度 */
  private readonly itemDialogTagHeight: number = 32;
  /** 道具UI大小 */
  private readonly itemDialogSize: Size = { width: 50, height: 50 };
  /** 生怪點X座標 */
  private readonly spawnPointXList: number[] = [510, 610, 710, 810, 910];
  /** 生怪y座標 */
  private readonly spawnPositionY: number = 50;

  /** 目標分數 */
  private readonly targetScore: number = 1000;
  //#endregion readonly

  //#region 串接網路端資料/靜態表資料
  /** 英雄資料 */
  private piggyHeroData!: HeroData;
  /** 分數 */
  private scoreCount: number = 0;
  /** 魔力值 */
  private energyCount: number = 1000;
  /** 擊殺數 */
  public killCount: number = 0;
  //#endregion

  //#region 遊戲內元件
  /** 戰鬥系統元件 */
  public combatComponent!: CombatComponent;
  /** 群組管理 */
  private _combatGroups!: PiggyGroups;
  public get combatGroups(): PiggyGroups {
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
          persistentEffectIdList: [PiggyEffectId.Invincible],
        },
        {
          startEffectIdList: [],
          persistentEffectIdList: [PiggyEffectId.Invincible],
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
          persistentEffectIdList: [PiggyEffectId.Freeze],
        },
        {
          startEffectIdList: [],
          persistentEffectIdList: [PiggyEffectId.Freeze],
        },
      ],
    ],
    [
      InteractionType.Absorb,
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
      InteractionType.IgnoreProjectile,
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
      InteractionType.IgnoreNonProjectile,
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
      InteractionType.ClearIgnore,
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
  ]);

  /** 平台 */
  private platform!: Phaser.GameObjects.Image;
  /** 偷襲點群組 */
  public attackPointGroup!: PiggyAttackPointGroup;
  /** 隱藏牆(阻擋未命中投射物) */
  private invisibleWall!: CanNotPassObstacle;

  /** 英雄隊伍 */
  public heroTeam!: PiggyHeroTeam;
  //#endregion

  //#region 世界寬高
  /** 世界上邊緣Y */
  public get worldTopEdgeY(): number {
    return 100;
  }
  /** 世界下邊緣Y */
  public get worldBottomEdgeY(): number {
    return 370;
  }
  /** 世界左邊緣X */
  public get worldLeftEdgeX(): number {
    return 0;
  }
  /** 世界右邊緣X */
  public get worldRightEdgeX(): number {
    return 1024;
  }
  //#endregion 世界寬高

  //#region 一般變數、元件
  /** 背景 */
  private bgDialog!: PiggyBackgroundDialog;
  /** Gui */
  private guiDialog!: PiggyGuiDialog;
  /** 子彈道具介面 */
  public bulletItemDialog!: ItemDialog<PiggyItem>;
  /** 一次性道具介面 */
  private oneTimeItemDialog!: ItemDialog<PiggyItem>;
  /** 能量文字動畫 */
  private tweenTextGroup!: Phaser.GameObjects.Group;

  /** 音效池 */
  public audioMap!: Map<number, SoundPool>;
  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 冰凍計時 */
  private freezeTimer!: Phaser.Time.TimerEvent;
  /** 波次列表 */
  private waveList: PiggyWaveData[] = [];
  /** 波次計數 */
  private waveCount: number = 0;
  /** 所有生怪計時器 */
  private spawnTimeEventList: Phaser.Time.TimerEvent[] = [];
  /** 敵人物件池 */
  private enemyGroup!: Phaser.GameObjects.Group;
  /** 敵人隊伍物件池 */
  private enemyTeamGroup!: Phaser.GameObjects.Group;
  //#endregion

  //#region getter
  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    return this.energyCount <= PiggyNumber.ReviveEnergy || this.isReviveTime;
  }
  /** 判斷遊戲是否該結束 */
  public get isGameEnd(): boolean {
    return this.energyCount <= 0 || this.isTimeOut;
  }
  //#endregion getter

  //#region constructor、Phaser hook(不用加回傳值、屬性)
  constructor(private gameData: PiggyGameData, private gameWeb: IAnswerWeb) {
    super({ key: 'PiggyGameScene' });
    this.gameFSM = new AnswerGameFSM(this, gameWeb);
  }

  preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);

    // 載入道具靜態表、圖示
    this.initItemData();
    // 載入遊戲中特效
    this.preloadEffect();
    // 載入遊戲中音效
    this.preloadAudio();
    // 載入敵人資料
    this.initEnemyData();
    // 載入英雄資料
    this.initHeroData();
    // 初始化波數資料
    this.initWaveData();
  }

  async create() {
    // 設定戰鬥系統相關元件
    this.setGroups();

    // 生成場景物件
    this.setScene();

    // 設置動畫
    this.createEffect();

    // 生成英雄
    this.setHero();

    // 設置音效
    this.createAudio();

    // 設置Dialog
    await this.setDialog();

    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  fixedUpdate(time: number, delta: number) {
    this.gameFSM.update(delta);
  }
  //#endregion constructor、Phaser hook

  //#region preload init data
  /** 載入道具資料 */
  private initItemData(): void {
    // 載入圖檔
    TableManager.piggyItem.getAll().forEach((itemData: PiggyItemData) => {
      if (itemData.piggyItemType === PiggyItemType.None) {
        return;
      }

      this.load.image(`${itemData.nameKey}`, PhaserHelper.ensureVersionedResourceUrl(`${piggyImgUrl}/${itemData.url}`));
    });
  }

  /** 載入敵人靜態表  */
  private initEnemyData(): void {
    TableManager.piggyEnemy.getAll().forEach((piggyEnemyData: PiggyEnemyData) => {
      // 動態載入敵人走路動畫
      AnimationHelper.loadCharacterSprite(this, piggyEnemyData, CharacterType.Enemy, CharacterAnimType.Walk);
    });
  }

  /** 初始化波數資料 */
  private initWaveData(): void {
    for (let i = PiggyWaveDifficulty.Easy; i < PiggyWaveDifficulty.Max; i++) {
      // 取對應難度波次
      const availableWaves = TableManager.piggyWave.where((wave: Readonly<PiggyWaveData>) => wave.difficulty === i);
      // 取隨機不重複波數
      Phaser.Utils.Array.Shuffle(availableWaves);
      this.waveList = this.waveList.concat(availableWaves.splice(0, PiggyNumber.WaveCountPerDifficulty));
    }
  }

  /** 從特效靜態表載入動畫，並記錄 */
  public preloadEffect(): void {
    TableManager.combatEffect.getAll().forEach((effectData: EffectData) => {
      this.load.spritesheet(effectData.nameKey, `${combatEffectImgUrl}/${effectData.url}`, {
        frameWidth: effectData.frameSize,
        frameHeight: effectData.frameSize,
      });
    });
  }

  /** 從特效靜態表載入音效 */
  public preloadAudio(): void {
    TableManager.combatAudio.getAll().forEach((value: AudioData) => {
      this.load.audio(value.nameKey, `${combatAudioUrl}/${value.url}`);
    });
  }

  /** 載入英雄 */
  private async initHeroData(): Promise<void> {
    const heroData = TableManager.hero.findOne(this.gameData.heroListData.heroId);
    if (heroData === undefined) {
      await InfoBox.defaultMessage([this], `英雄資料讀取失敗! 英雄ID: ${this.gameData.heroListData.heroId}`);
      console.error(`英雄資料讀取失敗! 英雄ID: ${this.gameData.heroListData.heroId}`);
      this.scene.stop();
      return;
    }
    this.piggyHeroData = heroData;

    // 動態載入英雄走路動畫
    AnimationHelper.loadCharacterSprite(this, this.piggyHeroData, CharacterType.Hero, CharacterAnimType.Walk);
  }
  //#endregion preload init data

  //#region create set data
  /** 設定戰鬥系統相關元件 */
  private setGroups(): void {
    this.combatComponent = new CombatComponent(this);
    this._combatGroups = new PiggyGroups(this);
    this._combatGroups.init();

    // 取得敵人物件池
    const enemyGroup = this.combatGroups.getGroup(PiggyEnemy.name);
    if (enemyGroup === undefined) {
      console.error('敵人物件池取得失敗');
      return;
    }
    this.enemyGroup = enemyGroup;

    // 取得敵人隊伍物件池
    const enemyTeamGroup = this.combatGroups.getGroup(PiggyEnemyTeam.name);
    if (enemyTeamGroup === undefined) {
      console.error('敵人隊伍物件池取得失敗');
      return;
    }
    this.enemyTeamGroup = enemyTeamGroup;
  }

  /** 設置場景物件 */
  private setScene(): void {
    // 生成敵人出發平台
    this.platform = this.add.image(
      this.platformInitialPosition.x,
      this.platformInitialPosition.y,
      PiggyString.Platform,
    );

    // 生成偷襲點群組
    this.attackPointGroup = this.combatGroups.getGroup(PiggyAttackPointGroup.name)?.create();
    // 生成隱形牆(阻擋未命中投射物)
    this.invisibleWall = new CanNotPassObstacle(this, this.invisibleWallPosition.x, this.invisibleWallPosition.y);
    this.invisibleWall.setSize(this.invisibleWallsize.width, this.invisibleWallsize.height);
    this.physics.add.existing(this.invisibleWall);
  }

  /** 生成英雄 */
  private setHero(): void {
    const hero: PiggyHero = this._combatGroups
      .getGroup(PiggyHero.name)
      ?.create(this.heroPosition.x, this.heroPosition.y);
    hero.init(this.piggyHeroData, 1, 0, BattleUnitAttackMode.DoNotAttack, false);
    this.heroTeam = this._combatGroups.getGroup(PiggyHeroTeam.name)?.create(this.heroPosition.x, this.heroPosition.y);
    this.heroTeam.setTeam([hero]);
    this.heroTeam.initTeam();
  }

  /** 設置動畫 */
  public createEffect(): void {
    // 道具特效常駐動畫
    TableManager.combatEffect.getAll().forEach((effectData: EffectData) => {
      AnimationHelper.createSpriteAnimFromEffectData(this, effectData);
    });

    // 敵人走路動畫
    const piggyEnemyList = TableManager.piggyEnemy.getAll();
    piggyEnemyList.forEach((enemyData: PiggyEnemyData) => {
      AnimationHelper.createCharacterAnim(this, enemyData, CharacterAnimType.Walk);
    });

    // 英雄走路動畫
    AnimationHelper.createCharacterAnim(this, this.piggyHeroData, CharacterAnimType.Walk);
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

  /** 設定背景、Gui等Dialog */
  private async setDialog(): Promise<void> {
    // 開啟背景
    this.bgDialog = UIManager.instance.openDialog(PiggyBackgroundDialog, this);
    this.bgDialog.setDepth(PiggyDepth.Bg);

    // 開啟Gui
    this.guiDialog = UIManager.instance.openDialog(PiggyGuiDialog, this);
    this.guiDialog.setDepth(PiggyDepth.Gui);
    this.guiDialog.updateEnergyBar(this.energyCount, 1000);
    this.guiDialog.updateScoreCount(this.scoreCount, this.targetScore);

    // 開啟子彈道具介面
    const bulletItems = this.gameData.totalProps.filter(
      (item: TotalProps) => TableManager.piggyItem.findOne(item.id)?.piggyItemType === PiggyItemType.Bullet,
    );
    if (bulletItems.length > 0) {
      const bulletItemDataList = TableManager.piggyItem.where(
        (item: PiggyItemData) => item.piggyItemType === PiggyItemType.Bullet,
      );
      this.bulletItemDialog = UIManager.instance.openDialog<ItemDialog<PiggyItem>>(ItemDialog, this);
      this.bulletItemDialog.setDepth(PiggyDepth.Gui);
      this.bulletItemDialog.init(
        bulletItemDataList,
        this.itemDialogSize,
        new Phaser.Math.Vector2(this.game.canvas.width - 800, this.game.canvas.height - 40),
        Align.LeftCenter,
      );

      // 子彈標籤
      const bulletTag = this.bulletItemDialog.addObject(0, 0, Object2D);
      bulletTag.addImage(
        PiggyString.BulletTag,
        this.game.canvas.width - 800 - this.itemDialogTagWidth / 2,
        this.game.canvas.height - 40 - (this.itemDialogSize.height / 2 - this.itemDialogTagHeight / 2),
      );

      // 加入已購買子彈道具
      await this.bulletItemDialog.addItems(bulletItems, PiggyItem, this.clickBulletItem.bind(this));
    }

    // 開啟一次性道具介面
    const oneTimeItems = this.gameData.totalProps.filter((item: TotalProps) => bulletItems.includes(item) === false);
    if (oneTimeItems.length > 0) {
      const oneTimeItemDataList = TableManager.piggyItem.where(
        (item: PiggyItemData) =>
          item.piggyItemType !== PiggyItemType.None && item.piggyItemType !== PiggyItemType.Bullet,
      );
      this.oneTimeItemDialog = UIManager.instance.openDialog<ItemDialog<PiggyItem>>(ItemDialog, this);
      this.oneTimeItemDialog.setDepth(PiggyDepth.Gui);
      this.oneTimeItemDialog.init(
        oneTimeItemDataList,
        this.itemDialogSize,
        new Phaser.Math.Vector2(this.game.canvas.width - 750 + bulletItems.length * 60, this.game.canvas.height - 40),
        Align.LeftCenter,
        bulletItems.length,
      );

      // 道具標籤
      this.oneTimeItemDialog.addImage(
        PiggyString.ItemTag,
        this.game.canvas.width - 750 + bulletItems.length * 60 - this.itemDialogTagWidth / 2,
        this.game.canvas.height - 40 - (this.itemDialogSize.height / 2 - this.itemDialogTagHeight / 2),
      );

      // 加入已購買一次性道具
      await this.oneTimeItemDialog.addItems(oneTimeItems, PiggyItem, this.clickOneTimeItem.bind(this));
    }

    // 設置分數/能量popUp文字群組
    this.tweenTextGroup = this.add.group({
      classType: CombatPopUpNumberTween,
    });

    // 預先創建popUp
    const preCreateCount = 20;
    for (let i = 0; i < preCreateCount; i++) {
      this.tweenTextGroup.create(-20, -20, '', '', false, false);
    }
  }
  //#endregion create set data

  //#region 狀態機
  /** 遊戲開場 */
  public async onOpeningEnter(): Promise<void> {
    // 生怪平台進入動畫
    const platformTween = this.tweens.add({
      targets: this.platform,
      x: this.platformPosition.x,
      y: this.platformPosition.y,
      duration: this.platformTweenDuration,
    });
    // 開場倒數
    await this.guiDialog.showOpeningGameText();
    await AsyncHelper.pendingUntil(() => platformTween.progress === 1);
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 英雄可以開始移動
    this.heroTeam.move();
    // 開啟Timer計時
    this.setTimerDialog(180, PiggyDepth.Gui);
    // 設置Timer事件
    this.setTimerEvent(
      // 時間到，遊戲結束
      () => {
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
    this.setWave();
  }

  /** 遊戲進行中update
   * @param delta
   */
  public onGameUpdate(delta: number): void {
    // 使用冰凍
    // 冰凍時暫停生怪&遊戲時間
    if (this.freezeTimer) {
      const activeEnemies = this.enemyGroup.getMatching('active', true);
      // 敵人死光提早結束
      if (activeEnemies.every((activeEnemy: PiggyEnemy) => activeEnemy.isAlive === false)) {
        // 冰凍解除
        this.freezeTimer.remove(true);
      }
    }
  }

  /** 當觸發續命 */
  public async onReviveEnter(): Promise<void> {
    // 停止計時
    this.timerDialog?.pause();
    // 暫停背景音樂
    this.bgm?.pause();
    // 所有場景暫停
    this.pauseScene();
  }

  /** 當續命完成時
   * @param rewardProp 續命題結果
   */
  public async onReviveEnd(rewardProp: TotalProps[]): Promise<void> {
    // 加入續命題贈送的道具

    for (const itemReward of rewardProp) {
      const rewardItem = TableManager.piggyItem.findOne(itemReward.id);
      if (rewardItem == null) {
        console.error(`找不到編號${itemReward.id}的道具`);
        continue;
      }
      if (rewardItem.piggyItemType === PiggyItemType.Bullet) {
        // 加入續命題贈送的子彈道具
        this.bulletItemDialog.addItems([itemReward], PiggyItem, this.clickBulletItem.bind(this));
      } else {
        // 加入續命題贈送的一次性道具
        this.oneTimeItemDialog.addItems([itemReward], PiggyItem, this.clickOneTimeItem.bind(this));
      }
    }
    await this.guiDialog.showOpeningGameText();
    // 開始計時
    this.timerDialog?.resume();
    // 繼續背景音樂
    this.bgm?.resume();
    // 所有場景繼續
    this.resumeScene();
  }

  /** 結束遊戲 */
  public onEndingEnter(): ContestPlayerData {
    // 防止敵人已死亡敵人隊伍持續await
    const enemyTeamList = this.enemyTeamGroup.getChildren() as PiggyEnemyTeam[];
    enemyTeamList.forEach((enemyTeam: PiggyEnemyTeam) => (enemyTeam.leader.body.velocity.y = 0));

    // 設定小豬結算資料
    const webGameLog: PiggyGameLog = {
      gameScore: this.scoreCount,
      gameMode: GameType.WebPiggy,
      browser: navigator.userAgent,
      killCount: this.killCount,
    };
    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: this.scoreCount >= this.targetScore,
      webGameLog,
    };
  }
  //#endregion 狀態機

  //#region 獲取靜態資料
  /** 獲取戰鬥單位道具資料
   * @param unitData 戰鬥單位資料
   * @param level 等級(自定義計算)
   * @returns 道具資料
   */
  public getBattleUnitItemData(unitData: HeroData, level: number): CombatItemData | undefined {
    return this.getItemData(unitData.antiTDItemId);
  }

  /** 獲取道具資料
   * @param itemId 道具id
   */
  public getItemData(itemId: number): CombatItemData | undefined {
    const itemData = TableManager.piggyItem.findOne(itemId);
    if (itemData === undefined) {
      console.error(`無法從 TableManager.piggyItem 中獲取 itemId = ${itemId} 的道具資料`);
    }
    return itemData;
  }
  //#endregion 獲取靜態資料

  //#region 遊戲相關(邏輯、表演等)
  /** 設定波次計時 */
  private setWave(): void {
    // 檢查全部wave清空, 遊戲結束
    if (this.waveCount >= this.waveList.length) {
      return;
    }

    // 清空生成事件
    this.spawnTimeEventList.splice(0);

    // 取波次資料
    const waveData = this.waveList[this.waveCount];
    if (waveData === undefined) {
      console.error(`第${this.waveCount}波的波次資料取得失敗！`);
      return;
    }
    this.waveCount++;

    // 生成敵人波次模板
    const totalPatternTime = this.setPattern(waveData);

    // 下一波時間計時
    const nextWaveTimer = this.time.addEvent({
      delay: (totalPatternTime + waveData.waveInterval) * 1000,
      callback: () => {
        // 生下一波
        this.setWave();
        this.time.removeEvent(nextWaveTimer);
      },
    });
    this.spawnTimeEventList.push(nextWaveTimer);
  }

  /** 設定該波次模板計時
   *  @param wave 波次資料
   *  @returns 整波所有模板需要的時間
   */
  private setPattern(wave: PiggyWaveData): number {
    // 第一個模板等0秒
    let totalPatternTime = 0;
    let patternList = wave.patternList;

    if (wave.patternOrderType === PiggyPatternOrderType.Random) {
      patternList = Phaser.Math.RND.shuffle(patternList);
    }

    patternList.forEach((patternId: number) => {
      const patternData = TableManager.piggyEnemyPattern.findOne(patternId);
      if (patternData === undefined) {
        console.error(`抓不到${patternId}號模板`);
        return;
      }
      // 設置模板計時
      const patternTimer = this.time.addEvent({
        delay: totalPatternTime * 1000,
        callback: () => {
          this.setSpawnData(wave.enemyAppearType, wave.enemySpeedMultiply, patternData);
          this.time.removeEvent(patternTimer);
        },
      });

      this.spawnTimeEventList.push(patternTimer);
      // 計算所有pattern時間加總)
      totalPatternTime += patternData.spawnDataList[patternData.spawnDataList.length - 1].time + wave.patternInterval;
    });
    return totalPatternTime;
  }

  /** 設定模板每一次生成
   * @param appearType 該波次生成的敵人種類
   * @param enemySpeedMultiply 該波次的掉落時間調整值
   * @param pattern 模板資料
   */
  private setSpawnData(appearType: number[], enemySpeedMultiply: number, pattern: PiggyEnemyPatternData): void {
    pattern.spawnDataList.forEach((spawnData: PiggySpawnData) => {
      const spawnTimer = this.time.addEvent({
        delay: spawnData.time * 1000,
        callback: () => {
          spawnData.spawnPointList.forEach((spawnPosition: number) => {
            this.spawnEnemy(appearType, enemySpeedMultiply, spawnPosition);
          });
          this.time.removeEvent(spawnTimer);
        },
      });
      this.spawnTimeEventList.push(spawnTimer);
    });
  }

  /**產生敵人資料並從物件池生成
   * @param appearType 該波次生成的敵人種類
   * @param enemySpeedMultiply 該波次的掉落時間調整值
   *  @param spawnPosition 生成位置
   */
  private spawnEnemy(appearType: number[], enemySpeedMultiply: number, spawnPosition: number): void {
    // 取得該波次能出現的種類

    // 隨機取一個敵人
    const enemyId = Phaser.Math.RND.pick(appearType);
    const enemyData = TableManager.piggyEnemy.findOne(enemyId);
    if (enemyData === undefined) {
      console.error('生成敵人資料失敗');
      return;
    }

    // 生成敵人，初始化並轉向
    const enemy: PiggyEnemy = this.enemyGroup.get(this.spawnPointXList[spawnPosition], this.spawnPositionY);
    enemy.init(enemyData, 1, 0, BattleUnitAttackMode.Active, false);
    enemy.forwardRotation = CompassRad.Left;

    // 加入敵人到隊伍中，調整下落時間
    const enemyTeam: PiggyEnemyTeam = this.enemyTeamGroup.get(this.spawnPointXList[spawnPosition], this.spawnPositionY);
    enemyTeam.setTeam([enemy]);
    enemyTeam.enemySpeedMultiply = enemySpeedMultiply;
  }

  /** 按下射擊按鈕 */
  public clickShootButton(): void {
    if (this.gameFSM.isGameState === false) {
      return;
    }
    this.heroTeam.delayDetectAttack();
  }

  /** 點擊使用子彈道具
   *  @param item 道具
   */
  private clickBulletItem(item: PiggyItem): void {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false) {
      return;
    }

    // 使用中關掉
    if (item.isHighlight) {
      this.heroTeam.changeItem(this.heroTeam.defaultItemId);
      item.unequipBullet();
    }
    // 非使用中開啟
    else {
      this.heroTeam.changeItem(item.itemData.id);
      item.equipBullet();
      // 關閉其他子彈道具
      this.bulletItemDialog.getOtherItems(item).forEach((otherItem: PiggyItem) => {
        otherItem.unequipBullet();
      });
    }
  }

  /** 使用一次性道具
   *  @param item 道具
   */
  private async clickOneTimeItem(item: PiggyItem): Promise<void> {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false) {
      return;
    }

    // 冷卻中返回
    if (item.isBlock) {
      return;
    }
    // UI扣減數量
    item.useItem();

    // 使用道具功能
    switch (item.itemData.piggyItemType) {
      // 青椒防護罩
      case PiggyItemType.Invincible:
      // 墨魚汁黑洞
      case PiggyItemType.BlackHole:
        this.oneTimeItemDialog.setCountDownPendingUntil(
          item,
          item.itemData.cooldown,
          this.useItemAndWaitCooldown(item.itemData),
        );
        break;
      // 牛奶震波
      case PiggyItemType.Shockwave:
        this.oneTimeItemDialog.setCountDownPendingUntil(
          item,
          item.itemData.cooldown,
          // 調整位置到敵人生成區塊中心點
          this.useCustomItemAndWaitCooldown(
            this.spawnPointXList[(this.spawnPointXList.length - 1) / 2],
            this.worldBottomEdgeY / 2,
            item.itemData,
            0,
            CompassRad.Down,
          ),
        );
        break;
      // 西瓜落石
      case PiggyItemType.RockFall:
        this.oneTimeItemDialog.setCountDownPendingUntil(
          item,
          item.itemData.cooldown,
          // 設置起始位置為偷襲點上方往下落
          this.useCustomItemAndWaitCooldown(
            PiggyNumber.AttackPointX,
            this.rockFallStartPositionY,
            item.itemData,
            0,
            CompassRad.Down,
          ),
        );
        break;
      // 蘑菇地雷
      case PiggyItemType.Mine:
        const randomPositionRange = Phaser.Math.RND.between(1, 10);
        let randomMinePositionX = 0;
        // 70%機率在前半
        if (randomPositionRange <= 7) {
          randomMinePositionX = Phaser.Math.FloatBetween(this.spawnPointXList[0], this.spawnPointXList[2]);
        }
        // 30%機率在後半
        else {
          randomMinePositionX = Phaser.Math.FloatBetween(this.spawnPointXList[2], this.spawnPointXList[4]);
        }
        this.oneTimeItemDialog.setCountDownPendingUntil(
          item,
          item.itemData.cooldown,
          // 設置生成位置為敵人生成區域下方隨機位置
          this.useCustomItemAndWaitCooldown(
            randomMinePositionX,
            this.worldBottomEdgeY + 30,
            item.itemData,
            0,
            CompassRad.Up,
          ),
        );
        break;
      // 凍結
      case PiggyItemType.Freeze:
        this.oneTimeItemDialog.setCountDownPendingUntil(
          item,
          item.itemData.cooldown,
          this.useItemAndWaitCooldown(item.itemData),
        );
        this.spawnTimeEventList.forEach((timer: Phaser.Time.TimerEvent) => (timer.paused = true));
        this.freezeTimer = this.time.addEvent({
          delay: item.itemData.interactionTime * 1000,
          callback: () => {
            this.spawnTimeEventList.forEach((timer: Phaser.Time.TimerEvent) => (timer.paused = false));
          },
        });
        break;
      // 蒜頭砲塔
      case PiggyItemType.Turret:
        this.oneTimeItemDialog.setCountDownPendingUntil(
          item,
          item.itemData.cooldown,
          // 設置生成位置為英雄前方
          this.useCustomItemAndWaitCooldown(
            this.heroTeam.leader.x + 80,
            this.heroTeam.leader.y,
            item.itemData,
            PiggyNumber.TurretAttackCount - 1,
            CompassRad.Right,
          ),
        );
        break;
      default:
        console.error(`未知的小豬道具種類，種類=${item.itemData.piggyItemType}`);
        return;
    }
  }

  /** 擊殺敵人
   *  @param score 分數
   *  @param energy 魔力
   *  @param enemyPosition 敵人位置
   */
  public enemyKilled(score: number, energy: number, enemyPosition: Phaser.Math.Vector2): void {
    this.killCount++;
    this.updateScore(score, enemyPosition.x + 10, enemyPosition.y - 10);
    this.updateEnergy(energy, enemyPosition.x + 10, enemyPosition.y + 10);
    this.combatComponent.playEffectOnMap(enemyPosition.x, enemyPosition.y, PiggyEffectId.Dead);
  }

  /** 調整分數
   *  @param score 分數
   *  @param popUpX 顯示的x位置
   *  @param popUpY 顯示的y位置
   */
  private updateScore(score: number, popUpX: number, popUpY: number): void {
    // 加0分不顯示popUp
    if (score === 0) {
      return;
    }
    this.scoreCount += score;
    const scoreTweenText: CombatPopUpNumberTween = this.tweenTextGroup.get(popUpX, popUpY);
    scoreTweenText.setDepth(this.worldBottomEdgeY);
    // 避免顯示小數點
    scoreTweenText.popUpNumberUnit(Math.trunc(score), '分');
    this.guiDialog.updateScoreCount(this.scoreCount, 1000);
  }

  /** 更新英雄魔力值
   *  @param energy 魔力
   *  @param popUpX 顯示的x位置
   *  @param popUpY 顯示的y位置
   */
  public updateEnergy(energy: number, popUpX: number, popUpY: number): void {
    let displayEnergy: number = energy;
    // 英雄無敵負值歸0
    if (this.heroTeam.leader.isInvincible) {
      if (energy < 0) {
        displayEnergy = 0;
      }
    }
    // 正值才需要顯示
    if (displayEnergy > 0) {
      const energyTweenText: CombatPopUpNumberTween = this.tweenTextGroup.get(popUpX, popUpY);
      energyTweenText.setDepth(this.worldBottomEdgeY);
      // 避免顯示小數點
      energyTweenText.popUpNumberIcon(Math.trunc(displayEnergy), BaseSceneString.EnergyIcon);
    }
    this.heroTeam.leader.interact(
      0,
      0,
      {
        /** 被影響時顯示的道具圖標，'' = 不顯示 */
        itemNameKey: '',
        /** 擊中時觸發的特效id清單 */
        onHitEffectIdList: [],
        /** 屬性受甚麼互動類型影響 */
        type: InteractionType.Hp,
        /** 互動類型的效果 */
        effect: InteractionEffect.MAX,
        /** 影響的數值 */
        value: displayEnergy,
        /** 影響的時間 */
        duration: 0,
        /** 累積影響的數值 */
        cumulativeValue: 0,
      },
      false,
      false,
    );
  }

  /** 英雄血量同步魔力條
   *  @param energy 能量
   */
  public syncEnergyBarUI(energy: number): void {
    this.energyCount = energy;
    this.guiDialog.updateEnergyBar(energy, 1000);
  }

  /** 使用道具並等待冷卻
   * @param itemData 道具資料
   */
  private async useItemAndWaitCooldown(itemData: CombatItemData): Promise<void> {
    this.heroTeam.leader.useItem(itemData);
    await this.waitCoolDown(itemData.cooldown);
  }

  /** 使用自訂道具並等待冷卻
   * @param positionX 道具X位置
   * @param positionY 道具Y位置
   * @param itemData 道具資料
   * @param refreshTimes 道具重複次數
   * @param rotation 道具方向
   */
  private async useCustomItemAndWaitCooldown(
    positionX: number,
    positionY: number,
    itemData: CombatItemData,
    refreshTimes: number,
    rotation: number,
  ): Promise<void> {
    this.combatComponent
      .getItemInstance(positionX, positionY, {
        /** 道具資料 */
        itemData,
        /** 發動者 */
        instigator: this.heroTeam.leader,
        /** 道具數值運算 */
        itemOperationList: defaultItemOperationList,
        /** 不跟隨發動者 */
        isIgnorefollow: true,
        /** 要重複發動幾次，-1是無限 */
        refreshTimes,
      })
      ?.setRotation(rotation);

    await this.waitCoolDown(itemData.cooldown);
  }

  /** 等待冷卻時間
   *  @param cooldown 冷卻時間
   */
  private async waitCoolDown(cooldown: number): Promise<void> {
    const cooldownTimeEvent = this.time.addEvent({
      delay: cooldown * 1000,
    });
    await AsyncHelper.pendingUntil(() => cooldownTimeEvent.getOverallProgress() === 1);
  }

  //#endregion 遊戲相關(邏輯、表演等)
}
