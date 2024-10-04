/** 信件獎勵狀態 */
export enum RewardStatus {
  /** 無道具 */
  NoItem = -1,
  /** 有道具未領取 */
  Unreceive,
  /** 有道具已領取 */
  Received,
}

/** 通知狀態 */
export enum NoticeState {
  /** 全部 */
  All = 0,
  /** 未讀 */
  UnRead,
  /** 已讀 */
  IsRead,
  /** 未領取 */
  NoReceived,
}

/** 通知狀態文字型態 */
export enum NoticeStringState {
  /** 全部 */
  All = '全部',
  /** 未讀 */
  UnRead = '未讀',
  /** 已讀 */
  IsRead = '已讀',
  /** 未領取 */
  NoReceived = '未領取',
}

/** 通知種類 */
export enum NoticeType {
  /** 一般 */
  Normal = 0,
  /** 賽局邀請 */
  RoomInvitation = 1,
}

/** 通知的賽局狀態 */
export enum NoticeRoomGameState {
  /** 等待加入 */
  WaitToJoin,
  /** 加入賽局 */
  JoinGame,
  /** 賽局結束 */
  GameFinish,
}
