import { TableItem } from '../json-table/json.table';
import { ApiResOkBaseDto } from './api.dto';
import { HeroUniverseTaskItem } from '../json-entity/hero-universe-task.table';

export enum StaticTableName {
  HeroUniverseTaskTable = 'HeroUniverseTaskTable',
}

/**
 * 獲取所有必要的靜態表格的結果的DTO
 */
export class GetAllStaticTableResultDto extends ApiResOkBaseDto {
  /**
   * 英雄宇宙任務表格
   */
  heroUniverseTaskItems: HeroUniverseTaskItem[];
}

/**
 * 用於獲取Table表格的DTO
 */
export class GetStaticTableDto {
  /**
   * Table名稱
   */
  staticTableName: StaticTableName;
}

/**
 * 獲取Table表格的結果的DTO
 */
export class GetStaticTableResultDto extends ApiResOkBaseDto {
  /**
   * Table的JSON字符串
   */
  tableItems: TableItem[];

  constructor(tableJson: TableItem[]) {
    super();
    this.tableItems = tableJson;
  }
}
