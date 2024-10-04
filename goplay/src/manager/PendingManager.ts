/** 待辦Key */
export enum PendingKey {
  /** 點擊星球 */
  WaitForPlanet,
  /** 切換表裡宇宙 */
  WaitForWormhole,
}

/** 待辦管理 */
export default class PendingManager {
  /** 待辦事項 */
  private static pendingMap: Map<PendingKey, boolean> = new Map();

  /** 開始待辦
   * @param pendingKey
   */
  public static startPending(pendingKey: PendingKey): boolean {
    // 待辦中, 開始失敗
    if (this.isPending(pendingKey)) {
      return false;
    }
    // 開始待辦
    else {
      this.pendingMap.set(pendingKey, true);
      return true;
    }
  }

  /** 結束待辦
   * @param pendingKey
   */
  public static finishPending(pendingKey: PendingKey): void {
    // 防呆
    if (this.pendingMap.has(pendingKey) === false) {
      console.error(`Missing PendingKey= ${pendingKey}`);
      return;
    }

    // 結束待辦
    this.pendingMap.set(pendingKey, false);
  }

  /** 是否待辦中
   * @param pendingKey
   */
  public static isPending(pendingKey: PendingKey): boolean {
    return this.pendingMap.get(pendingKey) ?? false;
  }
}
