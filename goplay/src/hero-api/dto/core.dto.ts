import { ApiResOkBaseDto } from './api.dto';

/**
 * 代表一個分頁結果的資料傳輸物件。
 */
export abstract class PagedResultDto<T> extends ApiResOkBaseDto {
  constructor(data: PagedData<T>) {
    super();
    this.page = data.page;
    this.pageSize = data.pageSize;
    this.total = data.total;
    this.entities = data.entities;
  }

  /**
   * 頁數。
   */
  page: number;
  /**
   * 每頁顯示筆數。
   */
  pageSize: number;
  /**
   * 總筆數。
   */
  total: number;
  /**
   * 分頁結果。
   */
  entities: T[];
}

export class UserIdDto {
  /**
   * 使用者 ID。
   */
  uid: number;
}

// 必須載入使用的資料庫驅動
/**
 * 分頁選項介面。
 */
export interface PaginationOptions {
  page: number; // 頁碼
  pageSize: number; // 每頁顯示的數量
  orderBy?: string; // 排序欄位
  desc?: boolean; // 是否為降冪排序
}
/**
 * 分頁資料介面。
 * @template T - 實體的類型。
 */

export interface PagedData<T> {
  page: number; // 頁碼
  pageSize: number; // 每頁顯示的數量
  total: number; // 總數
  entities: T[]; // 實體陣列
}
/**
 * 查找或創建結果介面。
 * @template T - 實體的類型。
 */

export interface FindOrCreateResult<T> {
  entity: T;
  created: boolean;
}

/**
 * 查詢條件介面。
 */
export enum FilterOperator {
  Equal = 'Equal',
  NotEqual = 'NotEqual',
  GreaterThan = 'GreaterThan',
  GreaterThanOrEqual = 'GreaterThanOrEqual',
  LessThan = 'LessThan',
  LessThanOrEqual = 'LessThanOrEqual',
  Like = 'Like',
  IsNull = 'IsNull',
  IsNotNull = 'IsNotNull',
}

/**
 * 列表數據的 DTO 物件。
 */
export class ListDataDto {
  /**
   * 頁數。
   * @type {number}
   */
  page: number;

  /**
   * 每頁顯示筆數。
   * @type {number}
   */
  pageSize: number;

  /**
   * 排序欄位。
   * @type {string}
   * @optional
   */
  sortField?: string;

  /**
   * 是否倒序排序。
   * @type {boolean}
   * @optional
   */
  sortDescending?: boolean;

  /**
   * 使用者 ID。
   * @type {number}
   * @optional
   */
  uid?: number;

  /**
   * 篩選條件運算符。
   * @type {FilterOperator}
   * @optional
   */
  filterOperator?: FilterOperator;

  /**
   * 篩選欄位。
   * @type {string}
   * @optional
   */
  filterField?: string;

  /**
   * 篩選值。
   * @type {string}
   * @optional
   */
  filterValue?: string;
}

export class Base64FileDto {
  base64File: string;
}
