import { GradeType, CountyType } from '../enum/Common';

/** 登入輸入資料 */
export interface LoginInfo {
  /** 帳號 */
  account: string;
  /** 密碼 */
  password: string;
}

/** 因材網轉跳資料 */
export interface AdlLoginInfo {
  /** 轉跳帶來的Token */
  token: string;
  /** 因材網轉跳GameLinkId */
  gameLinkId: string;
}

/** 使用者資料 */
export interface UserInfo {
  /** 使用者ID */
  uid: number;
  /** 認證Token */
  token: string;
  /** 使用者名稱 */
  name: string;
  /** 學校ID */
  schoolId: number;
  /** 學校名稱 */
  schoolName: string;
  /** 班級名稱 */
  className: string;
  /** 學校區域ID */
  schoolCountyId: CountyType;
  /** 權限 */
  roleId: number;
  // TODO 改成 gradeNumber
  /** 年級 */
  gradeNum: GradeType;
}

/** 宇宙能量 */
export interface UniverseEnergyData {
  /** 當前宇宙能量值 */
  energy: number;
  /** 恢復宇宙能量值 */
  recoveryEnergy: number;
}

/** Web介面設定 */
export interface WebAppConfig {
  /** 首頁BannerUrl清單 */
  homeBanner: string[];
  /** 賽事BannerUrl清單 */
  contestBanner: string[];
  /** 背景音樂 */
  homeBGM: string;
  /** 雪花圖片路徑 */
  sprinklesUrl: string;
  /** 時間背景色 */
  timeBackgroundColor: string;
  /** 主入口按鈕背景圖 */
  buttonBackgroundImg: string;
  /** 答題遊戲按鈕背景圖 */
  coursebuttonImg: string;
  /** 魔王挑戰按鈕背景圖 */
  contestbuttonImg: string;
  /** 星球大戰按鈕背景圖 */
  planetbuttonImg: string;
  /** 校園賽事按鈕背景圖 */
  roomcontestbuttonImg: string;
  /** 星際論壇按鈕背景圖 */
  interstellarbuttonImg: string;
  /** 標題前圖片 */
  titleImg: string;
  /** topNav背景色 */
  topNavBackgroundColor: string;
}

/** 使用者2022成就 */
export interface UserInfo2022Data {
  /** 英雄獲得數 */
  heroCount: number;
  /** 生物兵器獲得數 */
  weaponCount: number;
  /** 裡宇宙道具獲得數 */
  antiTDCount: number;
  /** 金幣數總獲得數 */
  goldCoin: number;
  /** 晶球數總獲得數 */
  crystalCoin: number;
  /** 魔王賽總得分 */
  bossTotalScore: number;
  /** 答題遊戲參與次數 */
  adlContestCount: number;
  /** 魔王賽參與次數 */
  bossContestCount: number;
}

/** 使用者2022成就 */
export interface UserInfo2022Data {
  /** 英雄獲得數 */
  heroCount: number;
  /** 生物兵器獲得數 */
  weaponCount: number;
  /** 裡宇宙道具獲得數 */
  antiTDCount: number;
  /** 金幣數總獲得數 */
  goldCoin: number;
  /** 晶球數總獲得數 */
  crystalCoin: number;
  /** 魔王賽總得分 */
  bossTotalScore: number;
  /** 答題遊戲參與次數 */
  adlContestCount: number;
  /** 魔王賽參與次數 */
  bossContestCount: number;
}
