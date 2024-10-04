import { StaticTableAPI } from '@/api/heroApiStaticTable';
import { TableLoader } from './json-table/table-loader';
import { StaticTableName } from './dto/static-table.dto';
import { TableItem } from './json-table/json.table';
import { TableManager } from './json-entity/table.manager';

/**
 * 呼叫 StaticTableAPI.GetStaticTable 取得資料
 * 使用方法: TableManager.gameShopItemTable.load(new ServerTableLoader(StaticTableName.GameShopItems), 'id');
 */
export class ServerTableLoader extends TableLoader {
  /** 儲存所有跟hero-api取回來的靜態表資料 */
  private static allTableItems: Map<string, TableItem[]> = new Map<string, TableItem[]>();

  constructor(public filename: string) {
    super(filename);
  }

  load(): object[] {
    // 從 allTableItems 取得資料
    const tableItems = ServerTableLoader.allTableItems.get(this.filename);
    return tableItems || [];
  }

  log(msg: string): void {
    console.log(msg);
  }

  /**
   * 發送請求取得所有靜態表資料, 並指定TableManager所使用的TableLoader為ServerTableLoader
   */
  public static async initTableLoader(): Promise<void> {
    // 跟hero-api取得所有的靜態表格
    const result = await StaticTableAPI.getAllStaticTable();
    ServerTableLoader.allTableItems = new Map<string, TableItem[]>();
    // 將資料存入 allTableItems
    ServerTableLoader.allTableItems.set(StaticTableName.HeroUniverseTaskTable, result.heroUniverseTaskItems);

    // Load Table first
    TableManager.setLoaderFactory((filename: string) => new ServerTableLoader(filename));
  }
}
