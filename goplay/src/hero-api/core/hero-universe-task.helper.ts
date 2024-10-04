export class TaskHelper {
  /** 每頁的任務數量，128 個 */
  static tasksPerPage = 128;

  /**
   * 取得頁數。
   * @param taskGlobalIndex 全局任務索引（任務在所有頁中的整體位置）。
   * @returns 返回頁數。
   */
  public static getPage(globalIndex: number): number {
    // 從第 0 頁開始，每頁的數量為 128 個。
    return Math.floor(globalIndex / this.tasksPerPage);
  }
}
