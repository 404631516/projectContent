import { RewardItemKey } from '../enum/AnswerGame';
import {
  RankRuleType,
  TeamType,
  ContestStateType,
  RankRewardState,
  ContestSortType,
  ContestSortOrder,
  HeroJ7GameType,
  UserRole,
  DBBoolean,
  SubjectType,
  RoomFinishState,
  RoomSortType,
  QuizSource,
  ResponseState,
} from '../enum/Common';
import { BossData } from './Boss';

/** 賽事列表資訊 */
export interface ContestListData {
  /** App的網址 (iPlay遺產) */
  appDownloadLink: string;
  /** 比賽地點 (iPlay遺產) */
  centerLocation: string;
  /** 賽事建立時間 */
  createAt: string;
  /** 是否刪除 0 = 未刪 1 = 已刪 */
  delete: DBBoolean;
  /** 無年級限制 */
  g0: DBBoolean;
  /** 1年級限制 */
  g1: DBBoolean;
  /** 2年級限制 */
  g2: DBBoolean;
  /** 3年級限制 */
  g3: DBBoolean;
  /** 4年級限制 */
  g4: DBBoolean;
  /** 5年級限制 */
  g5: DBBoolean;
  /** 6年級限制 */
  g6: DBBoolean;
  /** 7年級限制 */
  g7: DBBoolean;
  /** 8年級限制 */
  g8: DBBoolean;
  /** 9年級限制 */
  g9: DBBoolean;
  /** 10年級限制 */
  g10: DBBoolean;
  /** 11年級限制 */
  g11: DBBoolean;
  /** 12年級限制 */
  g12: DBBoolean;
  /** 賽事規則 */
  gameDetail: GameDetail;
  /** 賽事結束時間 */
  gameEnd: string;
  /** 賽事獎勵 */
  gameReward: ContestGameAward[];
  /** 賽事開始時間 */
  gameStart: string;
  /** 賽事遊戲類型 */
  gameType: HeroJ7GameType;
  /** 賽事年級描述 */
  gradeDescription: string;
  /** 賽事ID */
  id: number;
  /** 不要算老師得分 0 = 要算 1 = 不算 */
  ignoreTeacherScore: DBBoolean;
  /** 賽事動態圖資料 */
  imageMap: ContestImageMap;
  /** 動態圖路徑 (iPlay用) */
  images: string[];
  /** 賽事詳細說明 */
  info: string;
  /** 是否為測試中 0 = 正式 1 = 測試 */
  isTesting: DBBoolean;
  /** 參與人數 */
  numberOfPlayer: number;
  /** 只有搜索會出現 */
  onlySearch: number;
  /** 賽事其他限制 */
  otherLimit: OtherLimitData;
  /** 賽事創建者UID */
  ownerId: number;
  /** 是否公開 0 = 不公開 1 = 公開 */
  public: DBBoolean;
  /** 排行獎勵 */
  rankReward: ContestRankRewardData[];
  /** 排行獎勵狀態 */
  rankRewardState: RankRewardState;
  /** 排行方式 */
  rankRule: RankRuleType;
  /** 教材資訊 */
  referDetail: ContestReferDetail | null;
  /** 報名結束時間 */
  registrationEnd: string;
  /** 報名開放時間 */
  registrationStart: string;
  /** 是否結算(發放獎勵) 0 = 未發放 1 = 已發放 */
  release: DBBoolean;
  /** 賽事狀態 */
  state: ContestStateType;
  /** 賽事科目 */
  subjectType: SubjectType;
  /** 賽事標籤 */
  tags: string;
  /** 組隊規則 */
  teamDetail: ContestTeamDetail;
  /** 組隊類別 */
  teamType: TeamType;
  /** 賽事標題 */
  title: string;
  /** 賽事更新時間 */
  updatedAt: string;
}

/** 賽事詳細資訊 */
export interface ContestDetailData {
  /** 魔王資訊 */
  bossData: BossData;
  /** 賽事資訊 */
  contest: ContestListData;
  /** 賽事獎勵狀態 */
  rankRewardState: RankRewardState;
}

/** 賽事紀錄 */
export interface ContestPlayerRecord {
  /** 最高得分 */
  bestScore: number;
  /** 賽事ID */
  contestId: number;
  /** 流水號 */
  id: number;
  /** 賽事紀錄建立時間 */
  logAt: string;
  /** 已遊玩次數 */
  playedCount: number;
  /** 使用者ID */
  playerId: number;
  /** 領獎紀錄 */
  // rankRewardRecord: {??}
  /** 賽事獎勵狀態 */
  rankRewardState: RankRewardState;
  /** 使用者今日ID */
  todayId: number;
  /** 今日遊玩次數 */
  todayPlayed: number;
  /** 賽事總得分 */
  totalScore: number;
  /** 賽事獲勝次數 */
  winCount: number;
}

/** 賽事教材資訊 */
export interface ContestReferDetail {
  /** 按鈕文字 */
  btnText: string;
  /** 網頁鏈結 */
  btnUrl: string;
  /** 教材說明 */
  info: string;
}

/** 賽事組隊規則 */
export interface ContestTeamDetail {
  /** 房間賽資訊 */
  roomOption: ContestRoomOption;
}

/** 賽事房間資訊 */
export interface ContestRoomOption {
  /** 密碼 */
  password: string;
  /** 房間最大人數 */
  maxPlayers: number;
  /** 房間數量 */
  roomCount: number;
  /** 遊戲時長 */
  roundTime: number;
}

/** 賽事api其他資訊 */
export interface OtherLimitData {
  /** 開放縣市 */
  schoolCountyIds: number[] | null;
  /** 開放時段 */
  gamePeriod: OpenPeriodInfo[][] | null;
  /** 限制身分 */
  roles: UserRole[] | null;
}

/** 賽事開放時段 */
export interface OpenPeriodInfo {
  /** 開始時間 */
  start: string;
  /** 結束時間 */
  end: string;
}

/** 賽事排行獎勵 */
export interface ContestRankRewardData {
  /** 排行名次  */
  rankValue: string;
  /** 排行獎勵 */
  rewardList: ContestGameAward[];
}

/** 賽事搜尋選項 */
export interface ContestOptions {
  /** 額外選項 */
  extraOptions: ContestExtraOptions;
  /** 過濾選項 */
  filterOptions: ContestFilterOptions;
  /** 頁數選項 */
  pageOptions: ContestPageOptions;
  /** 排序選項 */
  sortOptions: ContestSortOptions;
}

/** 賽事編輯搜尋選項 */
export interface ContestEditOptions {
  /** 額外選項 */
  extraOptions: ContestEditExtraOptions;
  /** 過濾選項 */
  filterOptions: ContestFilterOptions;
  /** 頁數選項 */
  pageOptions: ContestPageOptions;
}

/** 賽事編輯額外選項 */
export interface ContestEditExtraOptions {
  /** 回傳需要帶人數限制參數 */
  numberOfPlayer: boolean;
}

/** 賽事搜尋額外選項 */
export interface ContestExtraOptions {
  /** 回傳需要帶人數限制參數 */
  numberOfPlayer: boolean;
  /** 回傳需要帶獎勵狀態 */
  rankRewardState: boolean;
}

/** 賽事搜尋過濾選項 */
export interface ContestFilterOptions {
  /** 組隊類別 */
  teamType: TeamType[];
  /** 遊戲類別 */
  gameType: HeroJ7GameType[];
  /** 科目類別 */
  subjectType: number[];
  /** 賽事狀態 */
  state: ContestStateType[];
  /** 年級限定 */
  gradeFilter: number[];
  /** 使用者有參與過的賽事 */
  onlyHaveScore: boolean;
  /** 賽事開始時間 */
  gameStartDayId: number;
  /** 賽事結束時間 */
  gameEndDayId: number;
}

/** 賽事搜尋頁數選項 */
export interface ContestPageOptions {
  /** 當前頁數 */
  page: number;
  /** 一頁中的賽事數量 */
  pageSize: number;
}

/** 賽事搜尋排序選項 */
export interface ContestSortOptions {
  /** 賽事排序類別 */
  keywordType: ContestSortType;
  /** 賽事排序方式 */
  sortType: ContestSortOrder;
}

/** 遊戲設定 */
export interface GameDetail {
  /** 題數 */
  quizNumber: number;
  /** 答題次數 */
  quizRoundNum: number;
  /** 可挑戰次數 */
  limitRound: number;
  /** 每日限定次數? */
  dailyLimitRound: number;
  /** 房間賽地圖編號 */
  mapId: number;
  /** 房間賽魔王編號 */
  roomBossId: number;
}

/** 賽事獎勵格式 */
export interface ContestGameAward {
  /** 獎勵類別 */
  itemType: RewardItemKey;
  /** 獎勵道具ID */
  itemId: number;
  /** 獎勵數量 */
  count: number;
  /** 獲得機率 */
  rate: number;
}

/** 賽事動態圖資料 */
export interface ContestImageMap {
  /** 清單列表頁的卡面 */
  listCard: number;
  /** 詳細資訊看板圖片路徑 */
  infoBanner: string;
}

/** 房間排序選項 */
export interface RoomSortOptions {
  /** 賽事排序類別 */
  keywordType: RoomSortType;
  /** 賽事排序方式 */
  sortType: ContestSortOrder;
}

/** 房間過濾選項 */
export interface RoomFilterOptions {
  /** 賽事編號(0表示不指定) */
  contestId: number;
  /** 是否結算 */
  isFinish: RoomFinishState;
}

/** 房間模板搜尋選項 */
export interface RoomContestOptions {
  /** 頁數選項 */
  pageOptions: ContestPageOptions;
  /** 過濾選項 */
  sortOptions: ContestSortOptions;
}

/** 房間列表搜尋選項 */
export interface RoomListOptions {
  /** 房間過濾選項 */
  filterOptions: RoomFilterOptions;
  /** 頁數選項 */
  pageOptions: ContestPageOptions;
  /** 過濾選項 */
  sortOptions: RoomSortOptions;
}

/** 房間資料 */
export interface RoomData {
  /** 遊戲id */
  gameId: number;
  /** 房間名稱 */
  roomName: string;
  /** 開始時間 */
  startAt: string;
  /** 單場時間 */
  roundTime: number;
  /** 內容敘述 */
  info: string;
  /** 參賽人數 */
  maxPlayers: number;
  /** 房間密碼 */
  roomPassword: string;
}

/** 已創建房間列表的資料 */
export interface RoomListData {
  /** 房間編號 */
  contestRoomId: number;
  /** 賽事編號 */
  contestId: number;
  /** 賽事種類 */
  teamType: TeamType;
  /** 遊戲編號 */
  gameId: number;
  /** 房間名稱 */
  roomName: string;
  /** 房間密碼 */
  roomPassword: string;
  /** 開始時間 */
  startAt: string;
  /** 結束時間 */
  endAt: string;
  /** 是否結束 */
  isFinished: DBBoolean;
  /** 賽事是否已結束 */
  contestIsExpired: boolean;
}

/** API回傳編輯房間資料格式 */
export interface RoomDataNet {
  /** 房間資料 */
  roomData: RoomData;
  /** 題庫來源 */
  sourceType: QuizSource;
  /** 題庫資料代碼 */
  quizSetIds: string[];
  /** 題庫名稱 */
  quizSetNames: string[];
}

/** 題庫簡易資料 */
export interface QuizSetData {
  /** 題庫來源 */
  sourceType: QuizSource;
  /** 題庫ID */
  quizSetId: string;
  /** 題庫名稱 */
  quizSetName: string;
}

/** 賽局邀請資料 */
export interface ContestInvitationData {
  /** 邀請人角色 */
  inviterRole: string;
  /** 邀請人姓名 */
  inviterName: string;
  /** 賽局名稱 */
  roomName: string;
  /** 賽局ID */
  contestRoomId: number;
  /** 賽局密碼 */
  roomPassword: number;
  /** 開始時間 */
  startAt: string;
  /** 結束時間 */
  endAt: string;
  /** 遊戲種類 */
  gameId: number;
  /** 是否結束 */
  isFinished: number;
}

/** 每校系統排行榜類型 */
export enum EverySchoolSystemType {
  /** 登入 */
  Login = 0,
  /** 賽事 */
  Contest = 1,
  /** 學習 */
  Learning = 2,
}

/** 每校系統排行榜計數類型 */
export enum EverySchoolSystemRankCounterEnum {
  /** 上週 */
  LastWeek = 0,
  /** 累計到昨天(23:59) */
  UntilLastNight = 1,
}

/** 每校系統排行榜請求參數 */
export interface EverySchoolSystemRankDto {
  /** 系統類型 */
  systemType: EverySchoolSystemType;
  /** 計數類型 */
  counterType: EverySchoolSystemRankCounterEnum;
}

/** 每校系統排行榜資料 */
export interface SchoolSystemRankData {
  /** 學校編號 */
  schoolId: number;
  /** 總數 */
  totalCount: number;
  /** 排名 */
  rank: number;
  /** 學校名稱 */
  name: string;
  /** 縣市名稱 */
  countyName: string;
}

/** 每校系統排行榜回傳資料 */
export interface EverySchoolSystemRankResultDto {
  /** 回傳狀態 */
  result: ResponseState;
  /** 回傳訊息 */
  resMessage: string;
  /** 排行榜起始日期 */
  startDayId: number;
  /** 排行榜結束日期 */
  endDayId: number;
  /** 排行榜資料 */
  schoolRank: SchoolSystemRankData[];
}
