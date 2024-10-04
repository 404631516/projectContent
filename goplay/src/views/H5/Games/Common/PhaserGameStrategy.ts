import md5 from 'md5-ts';
import { AsyncHelper } from '../../Helper/AsyncHelper';
import { ResourceData } from '../../Scripts/Components/ResourceData';
import BootScene from '../../Scripts/Components/BootScene';
import BaseGameScene from '../../Scripts/Components/BaseGameScene';
import PlanetGameFSM, { IPlanetGame, IPlanetWeb } from '../../Scripts/Components/StateMachine/PlanetGameFSM';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '../../Scripts/Components/StateMachine/AnswerGameFSM';
import {
  BossGameData,
  AntiTDGameData,
  TowerDefenseGameData,
  HamsterGameData,
  BejeweledGameData,
  ShooterGameData,
  ParkourGameData,
  FishingGameData,
  BomberManGameData,
  BrickBreakerGameData,
  AdornmentGameData,
  PlanetGameData,
  BubbleDragonGameData,
  PiggyGameData,
  MatchingCardGameData,
  TestGameData,
  HeroUniverseGameData,
  SnakeGameData,
  VerticalParkourGameData,
  SpaceInvadersGameData,
  Puzzle2048GameData,
} from '@/helper/interface/Game';
import { bossResourceData } from '../../BossGame/Data/BossGameResource';
import BossGameScene from '../../BossGame/BossGameScene';
import { adornmentResourceData } from '../PersonalBase/Data/AdornmentResource';
import AdornmentGameScene from '../PersonalBase/Scenes/AdornmentGameScene';
import { antiTDResourceData } from '../AntiTDGame/Data/AntiTDResourceData';
import AntiTDGameScene from '../AntiTDGame/Scenes/AntiTDGameScene';
import { defenseResourceData } from '../Defense/Data/DefenseResource';
import DefenseGameScene from '../Defense/Scenes/DefenseGameScene';
import { hamsterResourceData } from '../Hamster/Data/HamsterResource';
import HamsterGameScene from '../Hamster/Scenes/HamsterGameScene';
import { bejeweledResourceData } from '../Bejeweled/Data/BejeweledResourceData';
import BejeweledGameScene from '../Bejeweled/Scenes/BejeweledGameScene';
import { shooterResourceData } from '../Shooter/Data/ShooterResource';
import ShooterGameScene from '../Shooter/Scenes/ShooterGameScene';
import { parkourResourceData } from '../ParkourGame/Data/ParkourResource';
import ParkourGameScene from '../ParkourGame/Scenes/ParkourGameScene';
import { fishingResourceData } from '../FishingGame/Data/FishingResource';
import FishingGameScene from '../FishingGame/Scenes/FishingGameScene';
import { bomberManResourceData } from '../BomberMan/Data/BomberManResource';
import BomberManGameScene from '../BomberMan/Scenes/BomberManGameScene';
import { brickBreakerResourceData } from '../BrickBreaker/Data/BrickBreakerResource';
import BrickBreakerGameScene from '../BrickBreaker/Scenes/BrickBreakerGameScene';
import { AdornmentNumber } from '../PersonalBase/Data/AdornmentConfig';
import RankGameScene from '../Rank/Scenes/RankGameScene';
import { rankResourceData } from '../Rank/Data/RankResourceData';
import { bubbleDragonResourceData } from '../BubbleDragon/Data/BubbleDragonResource';
import BubbleDragonGameScene from '../BubbleDragon/Scenes/BubbleDragonGameScene';
import { matchingCardResourceData } from '../MatchingCardGame/Data/MatchingCardResource';
import MatchingCardGameScene from '../MatchingCardGame/Scenes/MatchingCardGameScene';
import { piggyResourceData } from '../Piggy/Data/PiggyResource';
import PiggyGameScene from '../Piggy/Scenes/PiggyGameScene';
import { testResourceData } from '../TestGame/Data/TestResource';
import TestGameScene from '../TestGame/Scenes/TestGameScene';
import * as spine from '@esotericsoftware/spine-phaser';
import { heroUniverseResourceData } from '../HeroUniverse/Data/HeroUniverseResourceData';
import HeroUniverseGameScene from '../HeroUniverse/Scenes/HeroUniverseGameScene';
import { verticalParkourResourceData } from '../VerticalParkourGame/Data/VerticalParkourResource';
import VerticalParkourGameScene from '../VerticalParkourGame/Scenes/VerticalParkourGameScene';
import { HeroData } from '@/manager/TableManager';
import SnakeGameScene from '../Snake/Scenes/SnakeGameScene';
import { snakeResourceData } from '../Snake/Data/SnakeResource';
import { spaceInvadersResourceData } from '../SpaceInvaders/Data/SpaceInvadersResource';
import SpaceInvadersGameScene from '../SpaceInvaders/Scenes/SpaceInvadersGameScene';
import Puzzle2048GameScene from '../Puzzle2048/Scenes/Puzzle2048GameScene';
import { puzzle2048ResourceData } from '../Puzzle2048/Data/Puzzle2048Resource';

/** Phaser遊戲設定 */
export abstract class BaseGameStrategy {
  /** 遊戲畫面寬度 (子層可以覆蓋)*/
  protected gameWidth: number = 1024;
  /** 遊戲畫面高度 (子層可以覆蓋)*/
  protected gameHeight: number = 512;
  /** 遊戲需要加載的資料 */
  protected abstract urlData: ResourceData;
  /** 遊戲場景 */
  protected abstract gameScene: BaseGameScene;

  /** Phaser遊戲實例 */
  private gameInstance!: Phaser.Game;

  /** 遊戲是否靜音 */
  public get isMute(): boolean {
    return this.gameInstance.sound.mute;
  }

  /** 開始遊戲
   * @param containerId
   * @param isMute
   */
  public async startGame(containerId: string, isMute: boolean): Promise<void> {
    // 生成PhaserGame
    this.gameInstance = new Phaser.Game({
      type: Phaser.AUTO, // WebGL or Canvas
      width: this.gameWidth,
      height: this.gameHeight,
      scale: {
        parent: containerId,
        mode: Phaser.Scale.FIT,
      },
      physics: {
        default: 'arcade', // arcade 代表以塊狀為單位
        arcade: {
          debug: false,
        },
      },
      scene: [new BootScene(this.urlData, this.gameScene.sys.settings.key), this.gameScene],
      plugins: {
        scene: [{ key: 'spine.SpinePlugin', plugin: spine.SpinePlugin, mapping: 'spine' }],
      },
    });

    // 等待BootScene加載遊戲資源完畢
    await AsyncHelper.pendingUntil(() => this.gameInstance.scene.isActive(this.gameScene));

    // 初始化遊戲設定
    this.gameScene.initialize(isMute);
  }

  /** 摧毀遊戲 */
  public destroyGame(): void {
    this.gameInstance.destroy(true);
  }
}

//#region 獨立遊戲
export interface IAdornmentWeb {
  /** 開啟商店 */
  onOpenShop(): Promise<void>;
  /** 開啟背包 */
  onOpenBackpack(): Promise<void>;
  /** 開啟同班同學列表 */
  onOpenClassmateList(): Promise<boolean>;
  /** 開啟解鎖房間訊息 */
  onOpenUnlockRoomMessage(): Promise<boolean>;
  /** 回到自己房間 */
  goBackSelfHome(): void;
  /** 回排行榜 */
  goBackRankList(): void;
}
/** 個人基地遊戲設定 */
export class AdornmentGame extends BaseGameStrategy {
  protected gameWidth: number = AdornmentNumber.phaserGameWidth;
  protected gameHeight: number = AdornmentNumber.phaserGameHeight;
  protected urlData = adornmentResourceData;
  protected gameScene: AdornmentGameScene;

  /** 個人基地遊戲場景 */
  public get adornmentGameScene(): AdornmentGameScene {
    return this.gameScene;
  }

  constructor(gameData: AdornmentGameData, adornmentWeb: IAdornmentWeb) {
    super();
    this.gameScene = new AdornmentGameScene(gameData, adornmentWeb);
  }
}

/** 即時排行榜 */
export class RankGame extends BaseGameStrategy {
  protected urlData = rankResourceData;
  protected gameScene = new RankGameScene();
}

/** 載入因雄宇宙的網頁 */
export interface IHeroUniverseWeb {
  /** 開啟NPC對話
   * @param npcId NPC id
   * @param location 觸發位置
   */
  openNpcDialog(npcId: number, location: Phaser.Math.Vector2): Promise<void>;

  /** 重新導向
   * @param path 路徑
   */
  redirect(path: string): void;

  /** 傳送到別張地圖
   * @param mapId 地圖編號
   */
  transport(mapId: number, location?: Phaser.Types.Math.Vector2Like): void;

  /** 回到前一個地圖 */
  goBackToPreviousMap(): void;

  /**
   * 是否有可完成任務
   * @param npcId NPC id
   */
  hasCompletableTasks(npcId: number): boolean;

  /**
   * 是否有進行中任務
   * @param npcId NPC id
   */
  hasInProgressTasks(npcId: number): boolean;

  /**
   * 是否有可接受任務
   * @param npcId NPC id
   */
  hasAcceptableTasks(npcId: number): boolean;

  /** 遊戲英雄資料 */
  heroData: HeroData;
}

/** 因雄宇宙 */
export class HeroUniverseGame extends BaseGameStrategy {
  protected urlData = heroUniverseResourceData;
  protected gameScene: HeroUniverseGameScene;

  public get heroUniverseGameScene(): HeroUniverseGameScene {
    return this.gameScene;
  }

  constructor(gameData: HeroUniverseGameData, heroUniverseWeb: IHeroUniverseWeb) {
    super();
    this.gameScene = new HeroUniverseGameScene(gameData, heroUniverseWeb);
  }
}
//#endregion

//#region 星球大戰
/** 星球大戰設定 */
export abstract class PlanetWarGameStrategy extends BaseGameStrategy {
  protected abstract gameScene: BaseGameScene & IPlanetGame;

  /** 星球大戰資訊 */
  protected planetGameData: PlanetGameData;

  constructor(learnLid: number, learnLogId: number, hid: number) {
    super();
    // 生成星球大戰資料
    this.planetGameData = {
      learnLid,
      learnLogId,
      msgId: md5(`${learnLid}:${learnLogId}:${hid}:7788`),
      hid,
    };
  }

  /** 初始化星球大戰遊戲
   * @param gameWeb
   */
  public initPlanetGame(gameWeb: IPlanetWeb): void {
    this.gameScene.setGameFSM(new PlanetGameFSM(this.gameScene, gameWeb));
  }
}

/** 塔防星球大戰遊戲設定 */
export class PlanetDefenseGame extends PlanetWarGameStrategy {
  protected urlData = defenseResourceData;
  protected gameScene: DefenseGameScene;

  constructor(gameData: TowerDefenseGameData, learnLid: number, learnLogId: number) {
    super(learnLid, learnLogId, gameData.heroListData.hid);
    this.gameScene = new DefenseGameScene(gameData, undefined, this.planetGameData);
  }
}

/** 逆塔防星球大戰遊戲設定 */
export class PlanetAntiTDGame extends PlanetWarGameStrategy {
  protected urlData = antiTDResourceData;
  protected gameScene: AntiTDGameScene;

  constructor(gameData: AntiTDGameData, learnLid: number, learnLogId: number) {
    super(learnLid, learnLogId, gameData.heroListDataList[0].hid);
    this.gameScene = new AntiTDGameScene(gameData, this.planetGameData);
  }
}
//#endregion

//#region 強連網
/** 強連網網頁端 */
export interface IRoomWeb {
  /** 遊戲結束 */
  onGameEnd(): void;
  /** 遊戲重開 */
  onGameRestart(): void;
}

/** 強聯網遊戲 */
export abstract class RoomGameStrategy extends BaseGameStrategy {
  protected abstract gameScene: BaseGameScene;
}

/** 敲敲答答遊戲設定 */
export class BrickBreakerGame extends RoomGameStrategy {
  protected urlData = brickBreakerResourceData;
  protected gameScene: BrickBreakerGameScene;

  constructor(gameData: BrickBreakerGameData, roomWeb: IRoomWeb) {
    super();
    this.gameScene = new BrickBreakerGameScene(gameData, roomWeb);
  }
}
//#endregion

//#region 答題遊戲
/** 魔王表演設定 */
export class BossGame extends BaseGameStrategy {
  protected gameWidth: number = 1920;
  protected gameHeight: number = 320;
  protected urlData = bossResourceData;
  protected gameScene: BossGameScene;

  constructor(gameData: BossGameData) {
    super();
    this.gameScene = new BossGameScene(gameData);
  }

  /** 開始魔王表演
   * @param containerId
   * @param isMute
   */
  public async startBossEntering(containerId: string, isMute: boolean): Promise<void> {
    // 開始魔王表演
    await this.startGame(containerId, isMute);

    // 等待開場結束進入遊戲
    await AsyncHelper.pendingUntil(() => this.gameScene.isGameState);
  }

  /** 開始魔王結束表演
   * @param totalDamage
   * @param isMute
   */
  public async startBossEnding(totalDamage: number, isMute: boolean): Promise<void> {
    // 設定靜音
    this.gameScene.setMute(isMute);
    // 開始魔王表演閉幕
    await this.gameScene.onBossEnding(totalDamage);
  }

  /** 攻擊魔王表演 */
  public onAttackBoss(): void {
    this.gameScene.onAttackBoss();
  }
}

/** 答題遊戲 */
export abstract class AnswerGameStrategy extends BaseGameStrategy {
  protected abstract gameScene: BaseGameScene & IAnswerGame;

  constructor(public bossGame?: BossGame) {
    super();
  }

  /** 是否隱藏魔王遊戲 (子層可以覆蓋)*/
  public isHideBoss: boolean = false;
}

/** 塔防遊戲設定 */
export class DefenseGame extends AnswerGameStrategy {
  protected urlData = defenseResourceData;
  protected gameScene: DefenseGameScene;

  constructor(gameData: TowerDefenseGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new DefenseGameScene(gameData, bossGame);

    // 設定狀態機為答題狀態機
    this.gameScene.setGameFSM(new AnswerGameFSM(this.gameScene, gameWeb));
  }
}

/** 打地鼠遊戲設定 */
export class HamsterGame extends AnswerGameStrategy {
  protected urlData = hamsterResourceData;
  protected gameScene: HamsterGameScene;

  constructor(gameData: HamsterGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new HamsterGameScene(gameData, gameWeb, bossGame);
  }
}

/** 消消樂遊戲設定 */
export class BejeweledGame extends AnswerGameStrategy {
  protected urlData = bejeweledResourceData;
  protected gameScene: BejeweledGameScene;
  public isHideBoss = true;

  constructor(gameData: BejeweledGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new BejeweledGameScene(gameData, gameWeb);
  }
}

/** 射擊遊戲設定 */
export class ShooterGame extends AnswerGameStrategy {
  protected urlData = shooterResourceData;
  protected gameScene: ShooterGameScene;

  constructor(gameData: ShooterGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new ShooterGameScene(gameData, gameWeb, bossGame);
  }
}

/** 跑酷遊戲設定 */
export class ParkourGame extends AnswerGameStrategy {
  protected urlData = parkourResourceData;
  protected gameScene: ParkourGameScene;

  constructor(gameData: ParkourGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new ParkourGameScene(gameData, gameWeb);
  }
}

/** 釣魚遊戲設定 */
export class FishingGame extends AnswerGameStrategy {
  protected urlData = fishingResourceData;
  protected gameScene: FishingGameScene;

  constructor(gameData: FishingGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new FishingGameScene(gameData, gameWeb);
  }
}

/** 炸彈超人遊戲設定 */
export class BomberManGame extends AnswerGameStrategy {
  protected urlData = bomberManResourceData;
  protected gameScene: BomberManGameScene;

  constructor(gameData: BomberManGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new BomberManGameScene(gameData, gameWeb);
  }
}

/** 泡泡龍遊戲設定 */
export class BubbleDragonGame extends AnswerGameStrategy {
  protected urlData = bubbleDragonResourceData;
  protected gameScene: BubbleDragonGameScene;

  constructor(gameData: BubbleDragonGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new BubbleDragonGameScene(gameData, gameWeb);
  }
}

/** 翻翻牌遊戲設定 */
export class MatchingCardGame extends AnswerGameStrategy {
  protected urlData = matchingCardResourceData;
  protected gameScene: MatchingCardGameScene;

  constructor(gameData: MatchingCardGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new MatchingCardGameScene(gameData, gameWeb);
  }
}

/** 小豬遊戲設定 */
export class PiggyGame extends AnswerGameStrategy {
  protected urlData = piggyResourceData;
  protected gameScene: PiggyGameScene;

  constructor(gameData: PiggyGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new PiggyGameScene(gameData, gameWeb);
  }
}

/** 貪食蛇設定 */
export class SnakeGame extends AnswerGameStrategy {
  protected urlData = snakeResourceData;
  protected gameScene: BaseGameScene & IAnswerGame;

  constructor(gameData: SnakeGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new SnakeGameScene(gameData, gameWeb);
  }
}

/** 垂直跑酷遊戲設定 */
export class VerticalParkourGame extends AnswerGameStrategy {
  protected urlData = verticalParkourResourceData;
  protected gameScene: VerticalParkourGameScene;

  constructor(gameData: VerticalParkourGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new VerticalParkourGameScene(gameData, gameWeb);
  }
}

/** 太空侵略者遊戲設定 */
export class SpaceInvadersGame extends AnswerGameStrategy {
  protected urlData = spaceInvadersResourceData;
  protected gameScene: BaseGameScene & IAnswerGame;

  constructor(gameData: SpaceInvadersGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new SpaceInvadersGameScene(gameData, gameWeb);
  }
}

/** 2048設定 */
export class Puzzle2048Game extends AnswerGameStrategy {
  protected urlData = puzzle2048ResourceData;
  protected gameScene: Puzzle2048GameScene;

  constructor(gameData: Puzzle2048GameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new Puzzle2048GameScene(gameData, gameWeb);
  }
}

/** 測試遊戲設定 */
export class TestGame extends AnswerGameStrategy {
  protected urlData = testResourceData;
  protected gameScene: TestGameScene;

  constructor(gameData: TestGameData, gameWeb: IAnswerWeb, bossGame?: BossGame) {
    super(bossGame);
    this.gameScene = new TestGameScene(gameData, gameWeb);
  }
}
//#endregion
