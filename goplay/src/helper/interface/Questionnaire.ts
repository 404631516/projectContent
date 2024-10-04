import { DBBoolean } from '../enum/Common';
import { OptionType, QuestionnaireFilterState, QuestionnaireSortType } from '../enum/Questionnaire';
import { ContestGameAward } from './Contest';

/** 問卷資料 */
export interface QuestionnaireData {
  /** 問卷編號 */
  formsId: number;
  /** 問卷標題 */
  title: string;
  /** 問卷副標題 */
  titleSub: string;
  /** 問卷內容說明 */
  content: string;
  /** 活動圖片連結 */
  contentPics: string[];
  /** 內容說明連結 */
  referLink: string;
  /** 已填寫數量 */
  filledCount: number;
  /** 有效題目數量 */
  questionCount: number;
  /** 發佈狀態; 0:未發佈(測試) 1:已發佈(正式) */
  isPublish: DBBoolean;
  /** 開始時間 */
  startAt: string;
  /** 結束時間 */
  endAt: string;
  /** 固定獎勵 */
  reward: ContestGameAward[];
  /** 抽獎獎勵 */
  rankReward: QuestionnaireRankReward[];
}

/** 問卷抽獎獎勵格式 */
export interface QuestionnaireRankReward {
  /** 獎勵內容 */
  rewardList: ContestGameAward[];
  /** 獎勵機率 */
  rate: number;
}

/** 問卷題目 */
export interface QuestionBlockData {
  /** 題目編號 */
  formsQuestionId: number;
  /** 問卷編號 */
  formsId: number;
  /** 題目文字 */
  questionMain: string;
  /** 副題目(網址) */
  questionSub: string;
  /** 選項模式 */
  optionType: OptionType;
  /** 選項內容 */
  optionArg: OptionArg;
  /** 是否關閉 */
  isClose: DBBoolean;
  /** 是否必填 */
  isRequire: DBBoolean;
}

/** 選項內容 */
export interface OptionArg {
  /** 選擇數量 */
  limitCount: number;
  /** 選項內容 */
  options: string[];
}

/** 問卷答案 */
export interface QuestionAnswer {
  /** 題目編號 */
  formsQuestionId: number;
  /** 答案 */
  answer: string[];
}

/** 回顧得獎 */
export interface QuestionnaireAwarded extends QuestionnaireData {
  /** 第幾獎 */
  winningRank: number;
}

/** 問卷題目介面 */
export interface ITopic {
  /** 答案 */
  currentAnswer: string[];
  /** 檢查答案 */
  checkAnswer(): string;
}

/** 問卷編輯題目 */
export interface IQuestionBlock {
  /** 檢查題目 */
  checkBlock(): string[];
}

/** 問卷清單資料-動態表 */
export interface QuestionnaireListDataNet {
  /** 問卷編號 */
  formsId: number;
  /** 問卷標題 */
  title: string;
  /** 已填寫人數 */
  filledCount: number;
  /** 有效答題數量 */
  questionCount: number;
  /** 已發佈 */
  isPublish: number;
  /** 開始時間 */
  startAt: string;
  /** 結束時間 */
  endAt: string;
  /** 已填寫 */
  isFilled: boolean;
}

/** 頁數參數 */
interface FormsListPageData {
  /** 頁次(第一頁填0) */
  page: number;
  /** 單頁物件數 */
  pageSize: number;
}

/** 排序參數 */
interface FormsListSortData {
  /** 問巻排序方式 */
  sortType: QuestionnaireSortType;
}

/** 過濾參數 */
interface FormsListFilterData {
  /** 問巻篩選方式 */
  state: QuestionnaireFilterState;
}

/** 用戶取得問卷清單 */
export interface FormsListData {
  /** 頁數參數 */
  pageOptions: FormsListPageData;
  /** 排序參數 */
  sortOptions: FormsListSortData;
  /** 過濾參數 */
  filterOptions: FormsListFilterData;
}
