import { SearchOptionData } from '@/components/BackEndManagement/StatisticReport/SearchOptionData';
import type { Dayjs } from 'dayjs';
import { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import { ChartTarget, ChartType, ComType } from '../enum/TeacherAdmin';
import { ApiCountyList, ApiSchoolList } from './BackEndManagementStatisticReport';
// API 時間格式
export interface DateData {
  /** 查詢開始時間 */
  startDay: string;
  /** 查詢結束時間 */
  endDay: string;
}

/** 後台查詢設定 */
export interface SearchBarSetting {
  /** 固定學校 */
  fixSchool: number;
  /** 固定行政區域 */
  fixCounty: number;
  /** 可搜尋選項 */
  searchOption: SearchOptionData[];
}
/** 搜尋需要資料 */
export interface SearchData {
  /** 後端需要資料 */
  apiData: TeacherAdminApiData;
  /** 要搜尋的選項 */
  searchOption: ChartTarget[];
}
/**取得圖表資料 API 格式 */
export interface TeacherAdminApiData {
  /** 要取得層級 */
  comType: ComType;
  /** 參數1 */
  comValue1: number | string | null;
  /** 參數2 */
  comValue2: number | string | null;
  /** 查詢開始時間 */
  startDay: string;
  /** 查詢結束時間 */
  endDay: string;
}
/**開始查詢初始圖表資料 */
export interface SearchAPIResponse {
  /** 開始時間 */
  startDay: string;
  /** 結束時間 */
  endDay: string;
  /** 登入次數 */
  loginCountList: LoginCountList[];
  /** 登入人數 */
  loginUserList: LoginUserList[];
  /** 學習時數 */
  onlineTimeDataList: OnlineTimeDataList[];
  /** 星際論壇問答數 */
  postCommentList: PostCommentList[];
  /** 各科目學習時數 */
  subjectTimeList: SubjectTimeList[];
  /** 行政區登入次數*/
  loginCountByCountyList: ApiCountyList[];
  /** 行政區學習時數 */
  onlineTimeDataByCountyList: ApiCountyList[];
  /** 學校登入次數 */
  loginCountBySchoolList: ApiSchoolList[];
  /** 學校學習時數 */
  onlineTimeDataBySchoolList: ApiSchoolList[];
}
/** 班級資料 */
export interface ClassItem {
  /** 班級 ID */
  classId: number;
  /** 中文名稱 */
  classString: string;
  /** 班級號碼(為了排序) */
  classNum: number;
}
/** 年級資料 */
export interface GradeItem {
  /** 年級 */
  grade: number;
  /** 年級中文 */
  gradeString: string;
  /** 年級擁有班級 */
  classChildren: ClassItem[];
}
/** 學校資料 */
export interface SchoolClass {
  /** 學年 id */
  academicYearId: number;
  /** 學年中文 */
  academicYearTitle: string;
  /** 擁有年級 */
  gradeChildren: GradeItem[];
}
/** 後端储存的資料 */
export interface ClassListItem {
  /** 班級 id */
  classId: number;
  /** 班級 */
  classroom: string;
  /** 學年 */
  academicYear: number;
}
/** 學生資料 */
export interface Student {
  /** 學生 id */
  uid: number;
  /** 學生名稱 */
  name: string;
}
/** 圖表列表 */
export interface ChartList {
  /** 類別 */
  type: ChartType;
  /** 名稱 */
  title: ChartTarget;
  /** 資料 */
  data: BaseChartData | undefined;
}

/** 基礎圖表 */
export interface BaseChartData {
  /** tooltip 單位 */
  tooltipUnit: string;
}
/** 柱狀圖 */
export interface BarChartData extends BaseChartData {
  /** X軸 */
  x: string[];
  /** y軸 */
  yData: BarSeriesOption[];
  /** y軸單位 */
  yUnit: string;
}
/** 線圖 */
export interface LineChartData extends BaseChartData {
  /** X軸 */
  x: string[];
  /** y軸 */
  yData: LineSeriesOption[];
  /** y軸單位 */
  yUnit: string;
}
/** 餅圖 */
export interface PieChartData extends BaseChartData {
  /** 餅圖資料 */
  data: Array<{ value: number | string; name: string }>;
  /** 是否有資料 */
  isEmpty: boolean;
}
/** API 各科目學習 */
export interface SubjectTimeList {
  subjectType: number;
  count: number;
  name: string;
}
/** API 星際論壇 */
export interface PostCommentList {
  dayId: string;
  count: number;
  postCount: number;
  commentCount: number;
}
/** API 登入次數 */
export interface LoginCountList {
  dayId: string;
  count: number;
}
/** API 登入人數 */
export interface LoginUserList {
  dayId: string;
  count: number;
}
/** API 學習時數 */
export interface OnlineTimeDataList {
  dayId: string;
  count: number;
}
/** 時間區間 */
export interface RangeDate {
  /** 開始時間 */
  startDate: Date | string | Dayjs;
  /** 結束時間 */
  endDate: Date | string | Dayjs;
}

/** 學生資料 */
export interface StudentData {
  /** uid */
  uid: number;
  /** 名稱 */
  name: string;
}
