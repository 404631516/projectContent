import { DBBoolean, TeamType, SubjectType, HeroJ7GameType, RankRuleType, QuizSource } from '../enum/Common';
import {
  ContestImageMap,
  ContestReferDetail,
  ContestGameAward,
  ContestRankRewardData,
  OtherLimitData,
  ContestTeamDetail,
  GameDetail,
} from './Contest';
import { BossDetail } from './Boss';
import { RewardItemKey, RewardItemKeyName } from '../enum/AnswerGame';
import { EventUploadType } from '../enum/BackEnd';

/** 賽事api題庫資訊 */
export interface ContestPKQuizBaseInfo {
  /** 賽事ID */
  contestId: number;
  /** 創建時間 */
  createAt: string;
  /** 流水ID */
  id: number;
  /** 賽事階段 */
  level: number;
  /** 題庫名稱 */
  quizName: string;
  /** 題庫ID */
  quizSetId: string;
  /** 題庫來源 */
  sourceType: QuizSource;
}

/** 題庫清單資料 */
export interface QuizSetListData {
  /** 創建時間 */
  createdAt: string;
  /** 題庫介紹 */
  description: string;
  /** 是否停用 */
  disable: DBBoolean;
  /** 題庫ID */
  id: number;
  /** 是否編輯中 */
  isEditing: DBBoolean;
  /** 題庫價格 */
  price: number;
  /** 題庫名稱 */
  quizName: string;
  /** 題目數量 */
  quizNumber: number;
  /** 創建者UID */
  uid: number;
  /** 更新時間 */
  updatedAt: string;
  /** 是否使用 */
  used: DBBoolean;
}

/** 上傳賽事API資料 */
export interface ContestUploadData {
  /** 賽事類型 */
  teamType: TeamType;
  /** 賽事遊戲類型 */
  gameType: HeroJ7GameType;
  /** 賽事科目 */
  subjectType: SubjectType;
  /** 賽事標題 */
  title: string;
  /** 賽事詳細說明 */
  info: string;
  /** 動態圖路徑 (iPlay用) */
  images: string[];
  /** 賽事動態圖資料 */
  imageMap: ContestImageMap;
  /** 賽事標籤 */
  tags: string;
  /** 比賽地點 (iPlay遺產) */
  centerLocation: string;
  /** 教材資訊 */
  referDetail: ContestReferDetail | null;
  /** 報名開放時間 */
  registrationStart: string;
  /** 報名結束時間 */
  registrationEnd: string;
  /** 賽事開始時間 */
  gameStart: string;
  /** 賽事結束時間 */
  gameEnd: string;
  /** 組隊規則 */
  teamDetail: ContestTeamDetail;
  /** 賽事規則 */
  gameDetail: GameDetail;
  /** 不要算老師得分 0 = 要算 1 = 不算 */
  ignoreTeacherScore: DBBoolean;
  /** 是否公開 0 = 不公開 1 = 公開 */
  public: DBBoolean;
  /** 賽事獎勵 */
  gameReward: ContestGameAward[];
  /** App的網址 (iPlay遺產) */
  appDownloadLink: string;
  /** 賽事年級描述 */
  gradeDescription: string;
  /** 排行方式 */
  rankRule: RankRuleType;
  /** 排行獎勵 */
  rankReward: ContestRankRewardData[];
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
  /** 是否為測試中 0 = 正式 1 = 測試 */
  isTesting: DBBoolean;
  /** 賽事其他限制 */
  otherLimit: OtherLimitData;
  /** 魔王資料 */
  bossDetail: BossDetail[];
}

/** 活動設定 */
export interface PartyEventEditData {
  /** 首頁Banner圖片 */
  homeBanner: PartyEventData;
  /** 魔王賽Banner圖片 */
  contestBanner: PartyEventData;
  /** 魔王賽Banner客製化圖片清單 */
  homeBGM: PartyEventData;
  /** 魔王賽Banner展示時間 */
  sprinklesUrl: PartyEventData;
  /** 時間背景色 */
  timeBackgroundColor: PartyEventData;
  /** 主入口按鈕背景圖 */
  buttonBackgroundImg: PartyEventData;
  /** 答題遊戲按鈕背景圖 */
  coursebuttonImg: PartyEventData;
  /** 魔王挑戰按鈕背景圖 */
  contestbuttonImg: PartyEventData;
  /** 星球大戰按鈕背景圖 */
  planetbuttonImg: PartyEventData;
  /** 校園賽事按鈕背景圖 */
  roomcontestbuttonImg: PartyEventData;
  /** 星際論壇按鈕背景圖 */
  interstellarbuttonImg: PartyEventData;
  /** 標題前圖片 */
  titleImg: PartyEventData;
  /** topNav背景色 */
  topNavBackgroundColor: PartyEventData;
}

/** 活動變數 */
export interface PartyEventData {
  /** 設定值 */
  argValue: string;
  /** 開始時間 */
  startAt: string;
  /** 結束時間 */
  endAt: string;
  /** 是否清除 */
  isClear: boolean;
}

/** 組件所需資料 */
export interface PartyEventUpload {
  /** 活動資料 */
  partyEventData: PartyEventData;
  /** 上傳類型 */
  uploadType: EventUploadType;
  /** 標題 */
  title: string;
  /** 是否顯示預設 */
  isShowDefault: boolean;
  /** 是否只傳單張圖片 */
  isSingleImage: boolean;
  /** 預設物件路徑 */
  defaultUrl: string;
  /** 預設文字 */
  defaultText: string;
  /** 限制寬度 */
  limitWidth: number;
  /** 限制高度 */
  limitHeight: number;
  /** 限制大小 */
  limitSize: number;
}

/** 獎勵設定 */
export interface RewardOptionData {
  /** 獎勵類別 */
  itemType: RewardItemKey;
  /** 獎勵類別名稱 */
  itemTypeName: RewardItemKeyName;
  /** 是否有ItemId */
  hasItemId: boolean;
  /** 可重複 */
  isMultiple: boolean;
  /** 數量固定 */
  isFixedCount: boolean;
  /** 獎勵選項 */
  rewardItemOptionList: SelectOption[];
}

/** 選項資料 */
export interface SelectOption {
  /** 選項文字 */
  label: string;
  /** 選項值 */
  value: number | string;
}
