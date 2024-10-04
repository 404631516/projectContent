import { ButtonType } from 'element-ui/types/button';
import { FilterType } from '../enum/DataGrid';

export interface Column {
  /** 欄位顯示的標籤 */
  label: string;
  /** 欄位的鍵值，對應要獲取的資料 */
  key: string;
  /** 是否可排序 */
  sortable: boolean;
  /** 欄位內容轉換顯示的函數 */
  transform?: (value: any) => string;
  /** 欄位查詢的類別 */
  filterType?: FilterType;
  /** 欄位寬度（可選） */
  width?: number;
  /** 是否為展開顯示的欄位 */
  expand?: boolean;
  /** 預設查詢值（可選） */
  defaultFieldValue?: string;
  /** 改變查詢值的回調函數（可選） */
  onFilterValueChange?: (value: string) => void;
  /** 查詢條件列舉（可選） */
  filterEnum?: FilterEnum[];
}

/** 表格參數 */
export interface FilterEnum {
  /** 表格欄位 */
  label: string;
  /** 表格鍵值 */
  value: string;
}

/** 按鈕操作類型 */
export interface Action {
  /** 按鈕顯示的文字 */
  text: string;
  /** 按鈕顯示的圖示 */
  icon?: string;
  /** 對應的事件 ID */
  eventId: string;
  /** 按鈕類型類型有
   * primary（會顯示藍色），
   * success（會顯示綠色），
   * info（會顯示灰色），
   * warning（會顯示黃色），
   * danger（會顯示紅色）。
   * text（會顯示文字）。
   */
  type: ButtonType;
  /** 提示文字 */
  tip: string;
}
