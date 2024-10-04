/** 賽事魔王資訊 */
export interface BossData {
  /** 魔王波次清單 */
  bossDetail: BossDetail[];
  /** 賽事ID */
  contestId: number;
  /** 魔王創建時間 */
  createdAt: string;
  /** 魔王累計傷害 */
  cumulateDamage: number;
  /** 魔王死亡紀錄 */
  deadRecord: DeadRecord[];
  /** 魔王們總血量 */
  totalHp: number;
  /** 魔王更新時間 */
  updateAt: string;
}

/** 魔王 */
export interface BossDetail {
  /** 魔王ID */
  bossId: number;
  /** 魔王血量 */
  hp: number;
}

/** 魔王擊殺紀錄 */
export interface DeadRecord {
  /** 打出最後一擊的使用者 */
  killerUid: number;
  /** 魔王死亡時間(UnixTime) */
  deadAt: number;
}

export interface BossTalkInfo {
  talkId: number;
  roleType: number;
  message: string;
  key: string;
}
