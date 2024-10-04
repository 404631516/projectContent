/** 逆塔防道具總類 */
export enum AntiTDItemType {
  /** 無分類、普攻道具 */
  None = 0,
  /** 物理類 */
  Physics = 1,
  /** 詛咒類 */
  Curse = 2,
  /** 強化類 */
  Buff = 3,
  /** 元素類 */
  Element = 4,
  /** 奇蹟類 */
  Miracle = 5,
  /** 治療類 */
  Healing = 6,
  /** 召喚類 */
  Summon = 7,
  /** 投射類 */
  Projectile = 8,
}

/** 逆塔防敵人隊伍移動模式 */
export enum AntiTDEnemyTeamMoveMode {
  /** 定點 */
  FixedPoint = 'FixedPoint',
  /** 十字 */
  Cross = 'Cross',
  /** 米字 */
  Star = 'Star',
  /** 圓形邊緣(8邊形) */
  CircleShape = 'CircleShape',
  /** 圓形範圍內隨機 */
  CircleRandom = 'CircleRandom',
  /** 長方形邊緣 */
  RectangleShape = 'RectangleShape',
  /** 長方形範圍內隨機 */
  RectangleRandom = 'RectangleRandom',
  /** 不移動 */
  DoNotMove = 'DoNotMove',
}

/** 逆塔防敵人隊伍移動方向 */
export enum AntiTDEnemyTeamMoveDirection {
  /** 順時針 */
  Clockwise = 0,
  /** 逆時針 */
  CounterClockwise = 1,
  /** 隨機 */
  Random = 2,
}

/** 不可解鎖兵器狀態 */
export enum AntiTDItemLockState {
  /** 不能用晶球解鎖 */
  CrystalLock = -1,
  /** 不能用金幣解鎖 */
  GoldLock = -1,
}

/**換道具或英雄功能介面 */
export enum AntiTDDialogType {
  /**換道具 */
  ItemEdit = 0,
  /**換英雄 */
  TeamEdit = 1,
}
