/** 生物兵器操作按鈕狀態 */
export enum BtnStateType {
  /** 顯示金額 */
  Coin = 0,
  /** 點擊卸下 */
  Remove = 1,
  /** 點擊裝備 */
  Put = 2,
  /** 裝備中 */
  InPut = 3,
}

/** 不可解鎖兵器狀態 */
export enum WeaponLockState {
  /** 不能用晶球解鎖 */
  CrystalLock = -1,
  /** 不能用金幣解鎖 */
  GoldLock = -1,
}

/** 生物兵器操作紀錄 */
export enum WeaponLogOperationType {
  None = 0,
  /** 裝設砲塔 */
  Set = 1,
  /** 卸除砲塔 */
  Destroy = 2,
}
