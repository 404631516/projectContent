import { ResponseState, QuizSource } from '../enum/Common';
import { EndType } from '../enum/WebGame';
import { ListStatus, TransStatus } from '../enum/AnswerGame';
import { TotalProps } from './Game';

/** 答題遊戲資訊 */
export interface AnswerGameInfo {
  /** 賽事編號 */
  contestId: number;
  /** 房間號 */
  logId: number;
  /** 開局驗證碼 */
  verifyKey: string;
}

/** 作答封包格式 */
export interface AnswerNet {
  /** 房間號 */
  gameLogId: number;
  /** 題目排序ID */
  questOrder: number;
  /** 作答資料 */
  playerAnswer: string;
}

/** 作答格式 */
export interface AnswerInfo {
  /** 選擇答案 (未選 = -1) */
  answerIndex: number;
  /** 答題使用時間 */
  usedSecond: number;
}

/** 答題封包 */
export interface QuestionData {
  /** 封包結果 */
  result: ResponseState;
  /** 封包資料 */
  resMessage: string;
  /** 總題目數 */
  questTotalCount: number;
  /** 題目資料 */
  quizData: QuizData;
  /** 題目排序ID */
  questOrder: number;
  /** 是否答對 */
  isCorrect: boolean;
  /** 題目得分 */
  answerScore: number;
  /** 是否一般答題結束 */
  isRoundOneEnd: boolean;
  /** 是否答題結束 */
  isFinished: boolean;
}

/** 題目資料 */
export interface QuizData {
  /** 題目ID */
  qid: string;
  /** 題目 */
  questionMain: string;
  /** 鏈結url */
  questionSub: string;
  /** 選項 */
  options: AnswerOptions;
  /** 題庫來源 */
  quizSource: QuizSource;
  /** 作答限時 */
  seconds: number;
}

/** 答案選項 */
interface AnswerOptions {
  /** 選項1 */
  option1: string;
  /** 選項2 */
  option2: string;
  /** 選項3 */
  option3: string;
  /** 選項4 */
  option4: string;
}

/** 問題格式 */
export interface QuestionFormat {
  /** 題目 */
  topic: string;
  /** 答案選項 */
  options: OptionFormat[];
  /** 鏈結url */
  url: string;
}

/** 選項格式 */
interface OptionFormat {
  /** 選項文字 */
  val: string;
}

/** 作答結果 */
export interface AnswerResult {
  /** 總題數 */
  topicCount: number;
  /** 答題總分 */
  answerScore: number;
}

/** 答題組件開關 */
export interface AnswerSwitch {
  /** 跳過當前題目 */
  isPass: boolean;
  /** 是否答對獲取獎勵 */
  isCorrect: boolean;
}

/** 小遊戲道具資料 */
export interface GameItemData {
  /** 道具ID */
  itemId: number;
  /** 道具名稱多國Key */
  itemNameKey: string;
  /** 道具圖片路徑 */
  itemImageUrl: string;
}

/** 快閃店道具資料 */
export interface ShopItemData {
  /** 小遊戲道具資料 */
  gameItemData: GameItemData;
  /** 道具描述多國Key */
  itemContentKey: string;
  /** 購買道具所需要耗費的資源 */
  itemCost: number;
  /** 道具資訊說明 */
  itemInfo: ShopItemInfo[];
  /** 遊戲過關條件 */
  gameCondition: string;
}

/** 快閃店道具資訊說明 */
export interface ShopItemInfo {
  /** 排版Class */
  cssClass: string;
  /** 資訊ICON */
  infoIcon: string;
  /** 資訊標題 */
  infoTitle: string;
  /** 資訊數值 */
  infoValue: number;
}

/** 購物車商品格式 */
export interface ShopCartItem {
  /** 道具ID */
  itemId: number;
  /** 道具名稱多國Key */
  itemNameKey: string;
  /** 道具數量 */
  itemValue: number;
  /** 道具價格 */
  itemCost: number;
  /** 道具圖片路徑 */
  itemImageUrl: string;
}

// 賽事資訊
export interface ContestDetail {
  gameEnd: string;
  gameId: number;
  gameReward: string;
  rankReward: string;
  gameStart: string;
  gradeDescription: string;
  ignoreTeacherScore: number;
  info: string;
  peoplePt: string | undefined;
  state: number;
  subjectType: number;
  teamType: number;
  title: string;
}

export interface RewardAnswerData {
  itemType: number;
  itemId: number;
  itemName: string;
  itemImgUrl: string;
  count: number;
}

// 賽事列表領取獎勵
export interface RewardInfo {
  isOpen: boolean;
  class: number;
  name: number;
}

/** 答題結果排行狀態 */
export interface ResultListState {
  /** 開啟排行畫面 */
  isShowList: boolean;
  /** 排行類型 */
  listType: ListStatus;
  /** 開啟排行榜 */
  isOpenRank: boolean;
}

/** 續命題狀態 */
export interface ContinueState {
  /** 開啟答題畫面 */
  isShowAnswer: boolean;
  /** 答題結果 */
  resultType: EndType;
  /** 獎勵道具清單 */
  rewardData: TotalProps[];
}

/** 轉場狀態 */
export interface TransitionState {
  /** 開啟轉場畫面 */
  isOpen: boolean;
  /** 轉場類別 */
  transType: TransStatus;
}
