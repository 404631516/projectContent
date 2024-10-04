import { TeamType } from '../enum/Common';

/** 個人資訊遊玩次數 */
export interface UserPlayCountInfo {
  /** 一般賽事次數 */
  contestPlayedCount: number;
  /** 魔王賽次數 */
  bossContestPlayedCount: number;
  /** 表宇宙進度 */
  warEndLevel: string;
  /** 裡宇宙進度 */
  antiTDEndLevel: string;
}

/** 學習歷程資料(個資部分) */
export interface ContestGameRecordUserInfo {
  /** 學校所在縣市 */
  countyName: string;
  /** 學校 */
  school: string;
  /** 班級 */
  class: string;
  /** 姓名 */
  name: string;
}

/** 學習歷程資料 */
export interface ContestGameRecordData {
  /** 挑戰編號 */
  id: number;
  /** 賽事編號 */
  contestId: number;
  /** 開始時間 */
  startAt: string;
  /** 結束時間 */
  endAt: string;
  /** 賽事標題 */
  title: string;
  /** 挑戰類型 */
  teamType: TeamType;
  /** 總答題數 */
  total: number;
  /** 答題正確數 */
  correct: number;
  /** 未作答題數 */
  unAnswer: number;
  /** 總耗時(秒) */
  useSec: number;
  /** 科目 */
  subject_groupings_name: string;
  /** 學年 */
  semesterYear: string;
  /** 上/下學期 */
  semesterType: string;
  /** 版本 */
  publisher_name: string;
  /** 年級 */
  grade: number;
}
