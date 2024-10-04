import { ItemType } from '../enum/AnswerGame';
import { ResponseState } from '../enum/Common';

/** Mssr通用回傳格式 */
export interface MssrResultDto {
  /** 回傳結果 */
  result: ResponseState;
  /** 補充訊息 */
  resMessage: string;
}

/** 多國 */
export interface I18n {
  /** 答題相關 */
  answer: I18nAnswer;
  /** 通用 */
  common: I18nCommon;
  /** 錯誤訊息 */
  errorMsg: I18nErrorMsg;
  /** 選單 */
  menu: I18nMenu;
  /** 小遊戲名稱 */
  webgameName: I18nWebGameName;
}

/** 答題相關 */
export interface I18nAnswer {
  /** 選擇 */
  Select: string;
  /** 下一題 */
  Next: string;
  /** 結束 */
  End: string;
}

/** 通用 */
export interface I18nCommon {
  /** 返回選單 */
  backMenu: string;
  /** 返回 */
  back: string;
  /** 登入 */
  signIn: string;
  /** 確認 */
  confirm: string;
  /** 取消 */
  cancel: string;
  /** 警告 */
  warning: string;
  /** 錯誤訊息 */
  errorMsg: string;
  /** 訊息 */
  essage: string;
  /** 資訊區 */
  QuizInfo: string;
  /** 遊戲規則 */
  QuizRule: string;
  /** 規則說明 */
  QuizInfoContent: string;
  /** 題 */
  Question: string;
  /** score */
  Score: string;
  /** close */
  Close: string;
  /** 登入頁面 */
  signPage: string;
  /** 帳號 */
  account: string;
  /** 密碼 */
  pwd: string;
  /** 請輸入帳號 */
  pleaseAccount: string;
  /** 請輸入密碼 */
  pleasePwd: string;
  /** 登入成功 */
  suceesSign: string;
}

/** 錯誤訊息 */
export interface I18nErrorMsg {
  /** 找不到該頁面 */
  noPage: string;
  /** 伺服器出錯 */
  serveError: string;
  /** 服務失效 */
  serveFail: string;
  /** 連接錯誤 */
  connectError: string;
  /** 連接到服務器失敗 */
  connectFail: string;
}

/** 選單 */
export interface I18nMenu {
  /** 故事導覽 */
  storyTour: string;
}

/** 小遊戲名稱 */
export interface I18nWebGameName {
  /** 塔防 */
  TowerRoom: string;
  /** 打地鼠 */
  Hamster: string;
  /** 射擊 */
  Shooter: string;
  /** 飛鏢 */
  KnifeHit: string;
  /** 消消樂 */
  Bejeweled: string;
}

/**開放縣市Table格式 */
export interface CountyInfo {
  /** 縣市名稱 */
  countyName: string;
  /** 縣市縮寫 */
  codeName: string;
  /** 縣市ID */
  countyId: number;
}

/** 背包道具 */
export interface BackpackItem {
  /** 道具UID */
  itemUid: number;
  /** 道具ID */
  itemId: number;
  /** 道具類型 */
  itemType: ItemType;
  /** 持有道具數量 */
  useNum: number;
}

/** 選項資料 */
export interface SelectOption {
  /** 選項文字 */
  label: string;
  /** 選項值 */
  value: number | string;
}
