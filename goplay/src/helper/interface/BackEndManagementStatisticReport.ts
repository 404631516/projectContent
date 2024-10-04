/** 行政區 */
export interface CountyData {
  /** 中文名稱 */
  countyName: string;
  /** id */
  countyId: number;
}
/** APi 圖表行政區相關的 key */
export interface ApiCountyList {
  /** id */
  countyId: number;
  /** 中文行政區 */
  countyName: string;
  /** 數量 */
  count: number;
}
/** APi 圖表學校相關的 key */
export interface ApiSchoolList {
  /** id */
  schoolId: number;
  /** 學校名稱 */
  schoolName: string;
  /** 數量 */
  count: number;
}

