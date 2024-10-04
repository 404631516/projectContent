import { HeroListData } from './Hero';
import { WebGameMode, GameType } from '../enum/Common';
import { EnemyWaveMode, EndType } from '../enum/WebGame';
import { WeaponLogOperationType } from '../enum/Weapon';
import { MemberType } from '@/views/H5/Net/NetProtocol/CommonStructure';
import { AdornmentLevelData, BossItemData } from '@/manager/TableManager';
import { PersonalBase, AdornmentPosition } from './Adornment';

/** 波次資料 */
export interface EnemyStateData {
  /** 敵人數量 */
  enemyCount: number;
  /** 敵人數量與排序 */
  enemies: number[];
  /** 敵人波次模式 */
  mode: EnemyWaveMode;
  /** 下一隻敵人出現時間 */
  spawTime: number;
  /** 行走速度 */
  speed: number;
  /** 波次總時間 */
  time: number;
  /** 敵人道具等級(逆塔防) */
  itemLevel: number;
}

/** 小遊戲道具 */
export interface TotalProps {
  /** 道具ID */
  id: number;
  /** 道具數量 */
  count: number;
}

/** 賽事遊戲結算 */
export interface ContestGameResult {
  /** 賽事ID */
  contestId: number;
  /** 遊戲LogId */
  gameLogId: number;
  /** 認證碼 */
  verifyCode: string;
  /** 遊戲資料 */
  playerData: string;
}

/** 賽事遊戲紀錄資料 */
export interface ContestPlayerData {
  /** 英雄ID */
  hid: number;
  /** 是否通關 */
  isSurvivor: boolean;
  /** 遊戲紀錄 */
  webGameLog: WebGameLog;
}

/** 賽事遊戲紀錄基礎資料 */
export interface WebGameLog {
  /** 遊戲得分 */
  gameScore: number;
  /** 遊戲模式 */
  gameMode: GameType;
  /** 瀏覽器類型 */
  browser: string;
}

/** 魔王賽表演資料 */
export interface BossGameData {
  /** 出場魔王靜態資料 */
  bossTableData: BossItemData;
  /** 玩家出場英雄 */
  playerHeroData: HeroListData;
  /** 隊友名稱 */
  teammateName: string[];
}

/** 星球大戰資料 */
export interface PlanetGameData {
  /** 星球大戰關卡ID */
  learnLid: number;
  /** 關卡紀錄ID */
  learnLogId: number;
  /** 紀錄ID */
  msgId: string;
  /** 隊長ID */
  hid: number;
}

//#region 塔防
/** 塔防遊戲設定 */
export interface TowerDefenseGameData {
  /** 遊戲模式 */
  gameMode: WebGameMode;
  /** 出戰英雄資料 */
  heroListData: HeroListData;
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 地圖ID */
  mapId: number;
  /** 敵人資料 */
  enemies: EnemyStateData[];
  /** 倒數時間 (-1 = 無限時間) */
  countdownTime: number;
}

/** 塔防遊戲紀錄細節資料 */
export interface TowerDefenseGameLog extends WebGameLog {
  /** 塔防殺死怪物數量 */
  towerKills: number;
}

/** 星球大戰遊戲結束資料 */
export interface PlanetWarResult {
  /** 是否勝利 */
  endType: EndType;
  /** 星球大戰結算資料 */
  gameResult: PlanetWarGameResult;
}

/** 星球大戰結算 */
export interface PlanetWarGameResult {
  /** 星球大戰關卡ID */
  learnLid: number;
  /** 遊戲時間 */
  gameSec: number;
  /** 英雄ID */
  hid: number;
  /** 擊敗敵人資料 */
  dieEnemys: EnemyResultData[];
  /** 成功經歷了幾波敵人 */
  overWaveCount: number;
  /** 砲塔設定位置 & 種類 */
  setWeapons: DefenseWeaponSetLog[];
  /** 關卡紀錄ID */
  learnLogId: number;
  /** 紀錄ID */
  msgId: string;
}

/** 星球大戰-裝設/拆除砲塔的log格式 */
export interface DefenseWeaponSetLog {
  // tilePos的x, y
  x: number;
  y: number;
  // weaponTableData的id
  weaponId: number;
  // 操作時間
  operateAt: number;
  // 操作類型
  operateType: WeaponLogOperationType;
}

/** 敵人數量 */
export interface EnemyResultData {
  /** 敵人ID */
  enemyId: number;
  /** 擊倒數量 */
  enemyCount: number;
}
//#endregion

//#region 消消樂
/** 消消樂遊戲設定 */
export interface BejeweledGameData {
  /** 出戰英雄hid */
  hid: number;
  /** 魔王ID */
  bossId: number;
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 消除寶石目標 (由答對題數決定)*/
  targetGems: number;
}

/** 消消樂遊戲紀錄細節資料 */
export interface BejeweledGameLog extends WebGameLog {
  /** 消除方塊的數量 */
  bejeweledCount: number;
}
//#endregion

//#region 打地鼠
/** 打地鼠遊戲設定 */
export interface HamsterGameData {
  /** 道具清單 */
  totalProps: HamsterTotalProps;
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}

/** 打地鼠"就你最特別"道具清單 */
export interface HamsterTotalProps {
  /** 防禦道具 */
  defense: TotalProps[];
  /** 攻擊道具 */
  attack: TotalProps[];
}

/** 打地鼠遊戲紀錄細節資料 */
export interface HamsterGameLog extends WebGameLog {
  /** 打地鼠數量 */
  hamsterKills: number;
}
//#endregion

//#region 射擊
/** 射擊遊戲設定 */
export interface ShooterGameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}

/** 射擊遊戲紀錄細節資料 */
export interface ShooterGameLog extends WebGameLog {
  /** 射擊消除的血量 */
  shootHp: number;
}
//#endregion

//#region 跑酷
/** 跑酷遊戲設定 */
export interface ParkourGameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}

/** 跑酷遊戲紀錄細節資料 */
export interface ParkourGameLog extends WebGameLog {
  /** 取得鑽石數量 */
  diamondCount: number;
}
//#endregion

//#region 釣魚
/** 釣魚遊戲設定 */
export interface FishingGameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}

/** 釣魚遊戲紀錄細節資料 */
export interface FishingGameLog extends WebGameLog {
  /** 取得漁獲量 */
  catchAmount: number;
}
//#endregion

//#region 炸彈超人
/** 炸彈超人遊戲設定 */
export interface BomberManGameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}

/** 炸彈超人遊戲紀錄細節資料 */
export interface BomberManGameLog extends WebGameLog {
  /** 殺敵數 */
  bomberKillCount: number;
}
//#endregion 炸彈超人

//#region 逆塔防
/** 逆塔防遊戲設定 */
export interface AntiTDGameData {
  /** 出戰英雄資料 */
  heroListDataList: HeroListData[];
  /** 地圖ID */
  mapId: number;
  /** 英雄等級上限 */
  heroLevelCap: number;
  /** 敵人資料 */
  enemies: EnemyStateData[];
}
//#endregion

//#region 新魔王賽
export interface BrickBreakerGameData {
  /** 房間Token */
  contestRoomUserToken: string;
  /** 出戰英雄資料 */
  heroListData: HeroListData;
  /** 玩家自己的uid */
  uid: number;
  /** 玩家顯示用姓名 */
  name: string;
  /** 玩家顯示用學校 */
  school: string;
  /** 玩家類型: 觀戰者或玩家 */
  memberType: MemberType;
}
export interface BrickBreakerScoreList {
  /** 參賽玩家UID */
  uid: number;
  /** 排名 */
  rank: number;
  /** 參賽玩家學校 */
  school: string;
  /** 參賽玩家名字 */
  name: string;
  /** 分數 */
  score: number;
}
//#endregion

//#region 房間佈置
/** 房間佈置遊戲設定 */
export interface AdornmentGameData {
  /** 出戰英雄資料 */
  heroList: number[];
  /** 取得英雄總積分 */
  heroTotalPoint: number;
  /** 目前房間等級靜態表 */
  adornmentLevelData: AdornmentLevelData;
  /** 房間佈置頁面 */
  personalBaseList: PersonalBase[];
  /** 已放置裝飾物位置 */
  adornmentPositionList: Map<number, AdornmentPosition[]>;
}
//#endregion 房間佈置

//#region 泡泡龍
/** 泡泡龍遊戲設定 */
export interface BubbleDragonGameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}
/** 泡泡龍遊戲紀錄細節資料 */
export interface BubbleDragonGameLog extends WebGameLog {
  /** 泡泡數 */
  bubbleCount: number;
}
//#endregion 泡泡龍

//#region 翻翻牌
/** 翻翻牌遊戲設定 */
export interface MatchingCardGameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}
/** 翻翻牌遊戲紀錄細節資料 */
export interface MatchingCardGameLog extends WebGameLog {
  /** 擊殺數 */
  killCount: number;
}
//#endregion 翻翻牌

//#region 小豬
/** 小豬遊戲設定 */
export interface PiggyGameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}
/** 小豬遊戲紀錄細節資料 */
export interface PiggyGameLog extends WebGameLog {
  /** 擊殺數 */
  killCount: number;
}
//#endregion 小豬

//#region 貪食蛇
/** 貪食蛇遊戲設定 */
export interface SnakeGameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}
/** 貪食蛇遊戲紀錄細節資料 */
export interface SnakeGameLog extends WebGameLog {
  /** 吃食物數量 */
  eatFoods: Array<{ id: number; count: number }>;
  /** 蛇身長度 */
  snakeLength: number;
  /** 使用道具數量 */
  useProps: TotalProps[];
}
//#endregion

//#region 因雄宇宙
/** 因雄宇宙遊戲設定 */
export interface HeroUniverseGameData {
  /** 地圖ID */
  mapId: number;
  /** 指定英雄所在地點 */
  location?: Phaser.Types.Math.Vector2Like;
}
//#endregion

//#region 垂直跑酷
/** 垂直跑酷遊戲設定 */
export interface VerticalParkourGameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}
/** 垂直跑酷遊戲紀錄細節資料 */
// TODO: 確認細節
export interface VerticalParkourGameLog extends WebGameLog {
  /** 取得金幣數量 */
  coinCount: number;
  /** 使用道具數量 */
  useProps: TotalProps[];
}
//#endregion 垂直跑酷

//#region 太空侵略者
/** 太空侵略者遊戲設定 */
export interface SpaceInvadersGameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}
/** 太空侵略者遊戲紀錄細節資料 */
export interface SpaceInvadersGameLog extends WebGameLog {
  /** 擊殺敵人數 */
  killCount: number;
  /** 使用道具數量 */
  useProps: TotalProps[];
}
//#endregion 太空侵略者

//#region 2048
/** 2048遊戲設定 */
export interface Puzzle2048GameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}

/** 2048遊戲紀錄細節資料 */
// TODO: 確認細節
export interface Puzzle2048GameLog extends WebGameLog {
  /** 使用道具數量 */
  useProps: TotalProps[];
}
//#endregion

//#region 測試
/** 測試遊戲設定 */
export interface TestGameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}
/** 測試遊戲紀錄細節資料 */
export interface TestGameLog extends WebGameLog {
  /** 客製分數 */
  catchAmount: number;
}
