import { OriginQuizData, ServiceUserInfo } from './CommonStructure';

/** 跟mssrServer要的BrickBreaker房間特殊設定 */
export interface BrickBreakerRoomData {
  /** 魔王ID */
  roomBossId: number;
  /** 地圖ID */
  mapId: number;
  /** 房間總人數 */
  maxPlayers: number;
  /** 遊戲開始時間 */
  startAt: number;
  /** 遊戲結束時間 */
  endAt: number;
  /** 題庫 */
  quizList: OriginQuizData[];
  /** 房間是否已結束 */
  isFinished: boolean;
}

/** 玩家遊戲資料 */
export interface BrickBreakerAvatarData extends ServiceUserInfo {
  /** 玩家編號(此玩家是第幾個加入遊戲的) */
  playerIndex: number;
  /** 重生點 */
  beginGridId: number;
  /** 當前所在gridId */
  currentGridId: number;
  /** 觸發目標gridId */
  targetGridId: number;
  /** 玩家狀態(idle, 移動中, 答題中......) */
  userState: BrickBreakerAvatarState;
  /** 玩家道具清單, index對應道具type, value為數量 */
  itemList: number[];

  //#region 分數相關參數
  /** 對魔王造成傷害量 */
  bossDamage: number;
  /** 魔王格子七題全對次數 */
  bossHitSuccessCount: number;
  /** 使用號角次數 */
  hornCount: number;
  /** 魔王觸手成功防禦次數 */
  defenseCount: number;
  /** 成功打開寶箱次數 */
  answerTreasureCount: number;
  /** 觸發寶物格子次數 */
  treasureCount: number;
  /** 觸發磚塊格子次數 */
  brickBreakCount: number;
  /** 答題正確數 */
  correctCount: number;
  /** 總答題數 */
  questionCount: number;
  //#endregion
}

/** 魔王資料 */
export interface BrickBreakerBossData {
  /** 魔王外型id */
  bossId: number;
  /** 魔王總hp */
  totalHp: number;
  /** 魔王當前hp */
  hp: number;
}

/** 玩家遊戲狀態 */
export enum BrickBreakerAvatarState {
  Idle = 0,
  Answering,
  Freeze,
}

/** 動態格子資料 */
export interface BrickBreakerGrid {
  /** id */
  gridId: number;

  /** 對應的格子類型 */
  gridType: BrickBreakerGridType;

  /** 格子事件類型, 隨機事件型的格子, 會在重生時骰事件 */
  eventType: BrickBreakerGridEventType;

  /** 是否已被觸發過, 正在等待再生 */
  isWaitForRegenerate: boolean;
  /** 下次再生時間點 */
  regenerateAt: number;

  /** 永遠摧毀, 不再重生 */
  isDestroyPermenantly: boolean;

  /** 所屬解鎖區域 */
  unlockAreaId: number;
  /** 是否是已開放區域 */
  isUnlock: boolean;
}

export enum GridDestroyType {
  /** 無法破壞 */
  NotDestroyable = 0,
  /** 等待重生 */
  Regenerate,
  /** 破壞後不再重生 */
  DestroyPermenantly,
}

/** 地圖格子類型 */
export enum BrickBreakerGridType {
  Empty = 1,
  /** 可破壞磚塊, 骰隨機事件 */
  BreakableBrick1,
  BreakableBrick2,
  BreakableBrick3,
  /** 不可破壞磚塊, 玩家停留在原地 */
  UnbreakableBrick1,
  UnbreakableBrick2,
  UnbreakableBrick3,
  /** 遠程武器, 答題後攻擊魔王 */
  Attack,
  /** 魔王觸手, 答題後防禦來自魔王的攻擊 */
  Defense,
  /** 寶物, 直接獲得寶物 */
  Treasure,
  /** 寶箱, 答題後獲得寶物 */
  AnswerTreasure,
  /** 出生點 */
  RespawnPoint,
  /** 魔王 */
  Boss,
  /** 一次性磚塊, 破壞後不再生成 */
  DisposableBrick,
  /** GridType數量上限, 方便程式計算用 */
  Max,
}

/** 地圖格子類型 */
export enum BrickBreakerGridEventType {
  /** 觸發失敗 */
  TriggerFailed = 1,
  /** 走上空地 */
  Move,
  /** 不可破壞磚塊, 玩家停留在原地 */
  UnbreakableBrick,
  /** 遠程武器, 答題後攻擊魔王 */
  Attack,
  /** 魔王觸手, 答題後防禦來自魔王的攻擊 */
  Defense,
  /** 寶箱, 答題後獲得寶物 */
  AnswerTreasure,
  /** 炸彈, 直接死亡, 回到起始點 */
  Bomb,
  /** 傳送到整張地圖上的任意空地(GridType=Empty) */
  Portal,
  /** 魔王 */
  Boss,
  /** 一次破壞上下左右磚塊 */
  CrossBrickBreak,
  /** 手裡劍, 直接攻擊魔王 */
  Shuriken,
  /** 凍結30秒 */
  Freeze,
  /** 號角, 解凍全體 */
  Horn,
  /** 獲得道具 盾牌 */
  GetShield,
  /** 獲得道具(自己) 威力上升 */
  GetAxeSelf,
  /** 獲得道具(九宮格) 威力上升 */
  GetAxeAround,
  /** 獲得道具(全體) 威力上升 */
  GetAxeAll,
  /** 獲得道具 防止凍結 */
  GetFreezePrevent,
}

/** broadcast avatar更新用資料 */
export interface BrickBreakerAvatarUpdateData {
  /** 更新表演類型 */
  updateType: BrickBreakerAvatarUpdateType;
  /** 得到道具時, 判斷此值做表演 */
  itemId: number;
  /** 事件觸發人uid */
  activatorUid: number;
}

/** avatar更新 表演類型 */
export enum BrickBreakerAvatarUpdateType {
  /** client端報錯 */
  ShowError,
  /** 什麼都不做 */
  DoNothing,
  /** 表演撞牆 */
  HitWall,
  /** 原已在線上的玩家 */
  AlreadyJoin,
  /** 初次加入遊戲 */
  Join,
  /** 玩家上線/下線 */
  Online,
  /** 玩家移動 */
  Move,
  /** 玩家開始答題 */
  StartAnswer,
  /** 表演遠程攻擊魔王 */
  Attack,
  /** 表演防禦成功 */
  DefenseSuccess,
  /** 表演防禦失敗, 回重生點 */
  DefenseFailedBomb,
  /** 表演防禦失敗, 消耗護盾防禦 */
  DefenseFailedShield,
  /** 表演死亡, 回到起始點 */
  Bomb,
  /** 玩家瞬移 */
  Teleport,
  /** 魔王答題全對, 表演攻擊魔王 */
  HitBossSuccess,
  /** 魔王答題沒有全對, 表演攻擊魔王後被炸 */
  HitBossFailedBomb,
  /** 魔王答題沒有全對, 表演攻擊魔王後被炸, 並消耗護盾防禦 */
  HitBossFailedShield,
  /** 表演破壞上下左右磚塊 */
  CrossBrickBreak,
  /** 表演手裏劍 */
  Shuriken,
  /** 結凍 */
  Freeze,
  /** 表演號角, 解凍全體 */
  Horn,
  /** 被別人解凍 */
  Unfreeze,
  /** 表演獲得道具 */
  GetItem,
  /** 表演獲得道具(九宮格) */
  GetItemAround,
  /** 表演獲得道具(全體) */
  GetItemAll,
  /** 表演使用道具 */
  UseItem,
}

/** 道具類型 */
export enum BrickBreakerItemType {
  /** 為了讓itemType對上item table的id, 所以多加一個None在前面 */
  None = 0,
  Shield,
  Axe,
  FreezePrevent,
  Max,
}

/** 特效Key(對照BrickBreakerEffectData的Id) */
export enum BrickBreakerEffectKey {
  /**  Avatar攻擊 */
  AvatarAttack = 1,
  /**  Avatar發射手裡劍 */
  AvatarShuriken = 2,
  /**  Avatar被冰凍 */
  AvatarFreeze = 3,
  /**  Avatar使用號角 */
  AvatarHorn = 4,
  /**  Avatar防禦 */
  AvatarDefense = 5,
  /** Avatar破壞磚塊 */
  AvatarBreakBrick = 6,
  /** Avatar近距離攻擊Boss */
  AvatarHitBoss = 7,
  /**  Grid發生爆炸 */
  GridBomb = 8,
  /** Grid竄出觸手(Defense事件表演) */
  GridTentacle = 9,
  /**  護盾圖示 */
  IconShield = 10,
  /**  斧頭圖示 */
  IconAxe = 11,
  /**  防冰圖示 */
  IconFreezePrevent = 12,
  /**  Grid竄出觸手(Defense格子) */
  GridTentacleDefense = 13,
  /** 使用斧頭的攻擊前特效 */
  AvatarPowerAttack = 14,
}

/** 結算統計類型 */
export enum BrickBreakerRankType {
  GameScore,
  BossDamage,
  BossHitSuccess,
  QuestionCorrect,
  HornCount,
  DefenseCount,
  AnswerTreasureCount,
  TreasureCount,
  BrickBreakCount,
  MAX,
}

/** 結算mvp資料結構 */
export interface BrickBreakerRankData {
  rankType: BrickBreakerRankType;
  vueMvpData: BrickBreakerVueMvpData;
}

/** mvp顯示用資料結構 */
export interface BrickBreakerVueMvpData {
  /** 玩家uid */
  playerId: number;
  /** 學校 */
  school: string;
  /** 姓名 */
  name: string;
  /** 玩家所選英雄類型 */
  heroId: number;
  /** 玩家英雄, 在DB裡的流水號id */
  hid: number;
  /** 此mvp在該項rankType所得的分數 */
  count: number;
}

/** 結算排行榜 個人答題相關統計資料 */
export interface BrickBreakerAnswerStatisticsData {
  /** 總答題數 */
  totalAnswerCount: number;
  /** 答對題數 */
  correctAnswerCount: number;
  /** 答對率 = (答對題數/總答題數) */
  correctAnswerRate: number;
}

/** 結算排行榜 vue顯示用 答題相關統計資料+顯示用個人資料 */
export interface BrickBreakerVueUserAnswerData extends BrickBreakerAnswerStatisticsData, BrickBreakerVueMvpData {}

/** 遊戲結算顯示用資料, 遊戲結束狀態 */
export interface BrickBreakerGameFinishStatus {
  /** 遊戲遊玩時間(時分秒) */
  gamePlayTime: string;
  /** BOSS總血量 */
  bossTotalHp: number;
  /** BOSS剩餘血量 */
  bossHp: number;
}

/** 依據公式計算綜合分數
 * @param avatarData 要計算分數的avatarData
 */
export function getBrickBreakerAvatarScore(avatarData: BrickBreakerAvatarData): number {
  const totalScore =
    20 * avatarData.correctCount +
    60 * avatarData.bossHitSuccessCount +
    0.1 * avatarData.bossDamage +
    15 * avatarData.hornCount +
    15 * avatarData.defenseCount +
    15 * avatarData.answerTreasureCount +
    5 * avatarData.treasureCount +
    5 * avatarData.brickBreakCount;
  return totalScore;
}
