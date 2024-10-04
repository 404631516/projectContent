/**
 * 表示一個表格加載器。
 * @template T 表示要加載的表格項的類型。
 */

export abstract class TableLoader {
  /**
   * 創建一個表格加載器。
   * @param filename 表示要加載的文件名。
   */
  constructor(public filename: string) {}

  /**
   * 加載表格數據。
   * @returns 返回加載的表格數據。
   */
  abstract load(): object[];

  /**
   * 記錄一條日誌。
   * @param msg 要記錄的日誌消息。
   */
  abstract log(msg: string): void;
}
