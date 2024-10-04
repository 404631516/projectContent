import { NoticeType, RewardStatus } from '../enum/Notice';
import { ContestGameAward } from './Contest';

/** 通知格式 */
export interface NoticeData {
  /** 信件編號 */
  mailId: number;
  /** 標題 */
  title: string;
  /** 寄件日期 */
  sendAt: string;
  /** 是否已讀取 */
  isRead: boolean;
  /** 獎勵狀態 */
  rewardStatus: RewardStatus;
}

/** 通知內文格式 */
export interface NoticeContent extends NoticeData {
  /** 內文 */
  content: string;
  /** 寄件者 */
  fromName: string;
  /** 獎勵內容 */
  reward: ContestGameAward[];
  /** 通知種類 */
  customId: NoticeType;
  /** 賽局資訊 */
  refer: string;
}

/** 賽局資訊 */
export interface RoomGameInfo {
  /** 賽局號碼 */
  contestRoomId: number;
  /** 賽局密碼 */
  roomPasswrod: string;
  /** 賽局開始時間 */
  startAt: string;
  /** 賽局結束時間 */
  endAt: string;
}
