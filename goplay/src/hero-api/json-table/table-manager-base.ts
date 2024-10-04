import { JsonTable } from './json.table';
import { TableLoader } from './table-loader';

/**
 * 表格管理器，負責載入和管理所有的表格資料。
 */
export abstract class TableManagerBase {
  /**
   * 設定表格載入器的工廠函式。
   * @param {function} loaderFactory - 表格載入器的工廠函式。
   */
  public static setLoaderFactory(loaderFactory: (filename: string) => TableLoader): void {
    TableManagerBase.loaderFactory = loaderFactory;
  }

  /**
   * 載入所有的表格資料。
   * @throws {Error} 如果表格載入器的工廠函式未設定，則拋出錯誤。
   */
  public abstract loadAll(): void;

  /**
   * 表格載入器的工廠函式。
   * @type {function}
   * @private
   */
  protected static loaderFactory: (filename: string) => TableLoader;
}
