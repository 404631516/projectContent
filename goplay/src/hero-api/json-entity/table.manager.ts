import { HeroUniverseTaskTable } from './hero-universe-task.table';
import { TableManagerBase } from '../json-table/table-manager-base';
import { StaticTableName } from '../dto/static-table.dto';

/**
 * 表格管理器，負責載入和管理所有的表格資料。
 */
export class TableManager extends TableManagerBase {
  /** 因雄宇宙任務 */
  public static readonly heroUniverseTaskTable = new HeroUniverseTaskTable();

  /**
   * 取得表格管理器的唯一實例。
   * @returns {TableManager} 表格管理器的唯一實例。
   */
  public static get instance(): TableManager {
    if (!TableManager._instance) {
      TableManager._instance = new TableManager();
    }
    return TableManager._instance;
  }

  /**
   * 載入所有的表格資料。
   * @throws {Error} 如果表格載入器的創建函式未設定，則拋出錯誤。
   */
  public loadAll(): void {
    const loaderFactory = TableManagerBase.loaderFactory;
    if (!loaderFactory) {
      throw new Error('Loader creator not set');
    }

    TableManager.heroUniverseTaskTable.load(loaderFactory(StaticTableName.HeroUniverseTaskTable), 'id');

    this.populateTables();
  }

  /**
   * 表格管理器的唯一實例。
   * @type {TableManager}
   * @private
   */
  private static _instance: TableManager;

  private populateTables() {
    // TODO
  }
}
