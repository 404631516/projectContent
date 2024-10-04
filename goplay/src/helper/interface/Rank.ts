import { RankingRankType } from '../enum/Common';

export interface MyRankInfo {
  rank: number;
  grade: string;
  name: string;
  points: number;
}

/** API資料格式, 一筆排名資料 */
export interface RankData {
  /** 排行資訊 */
  rankList: RankListData[];
  /** 自己的排行資訊 */
  selfRank: RankDetailData | null;
}

/** 排名詳細資訊 */
export interface RankDetailData {
  /** 排名 */
  rank: number;
  /** 使用者ID */
  playerId: number;
  /** 總得分 */
  totalScore: number;
  /** 最高得分 */
  bestScore: number;
}

/** 排名資訊 */
export interface RankListData extends RankDetailData {
  /** 使用者資訊 */
  playerInfo: RankUserInfo;
}

/** 排名使用者資訊 */
export interface RankUserInfo {
  /** 名稱 */
  name: string;
  /** 學校 */
  school: string;
  /** 班級 */
  class: string;
  /** 縣市別 */
  countyName: string;
}

/** 排行資料類型 */
export interface RankingListItem {
  id: number;
  /** 名字 */
  name: string;
  /** 學生 */
  school: string;
  /** 班級 */
  class: string;
  /** 分數 */
  score: string;
}

/** 排行標題資料 */
export interface RankTitleData {
  /** 排行類型 */
  rankType: RankingRankType;
  /** 排行名稱 */
  rankTitle: string;
  /** 名稱標題 */
  nameTitle: string;
  /** 年級標題 */
  gradeTitle: string;
  /** 得分標題 */
  scoreTitle: string;
  /** 得分類別 */
  scoreTypeTitle: string;
}
