import { RankingTabType, UserRole } from '../enum/Common';
import { ChartTarget } from '../enum/TeacherAdmin';
export type HomeChartDataKey = 'dayId' | 'count' | 'name';

// 按鈕資料類型
export interface BtnListItem {
  name: string;
  link: string;
  directions: string;
  img: string;
  subStandard: string;
}
/**圖表數量相關資料 */
export interface HomeChartCount {
  /** 上週總使用時數 */
  onlineCount: string;
  /** 上週總使用 */
  useCount: string;
}

/** 首頁圖表資料 */
export interface HomeChartData {
  /** 標題 */
  title: ChartTarget;
  /** 圖表 API 資料  */
  chartData: Array<Record<HomeChartDataKey, string>>;
}

/** 首頁排行資料 */
export interface PublicRankList {
  /** 排行名稱 */
  title: string;
  /** 排行資料 */
  rankList: PublicRankData[];
  /** 排行榜分頁類型 */
  rankType: RankingTabType;
}

/** 首頁排行榜資料 */
export interface PublicRankData {
  /** 名次 */
  rank: number;
  /** 名字或學校名稱 */
  name: string;
  /** 縣市名稱 */
  county?: string;
  /** 學校名稱 */
  schoolName?: string;
  /** 班級 */
  className?: string;
  /** 分數 */
  count: string;
  /** 分數單位 */
  countUnit: string;
}

/** 首頁最新消息API資料 */
export interface NewsData {
  /** 最新消息內容 */
  detail: string;
  /** 日期 */
  editedAt: string;
  /** 標題 */
  title: string;
  /** 每則消息 ID */
  topicId: number;
  /** 相關連結 無連結回傳 '' */
  url: string;
}

/** Menu 資料格式 */
export interface MenuData {
  /** Menu 顯示的字 */
  name: string;
  /** Menu 前往地址 */
  link: string;
  /** Menu 判斷是甚麼類型(外部內部或是彈窗) */
  type: string;
  /** 甚麼權限才能看到 */
  userRole: UserRole[];
  /**子目錄 */
  children: MenuData[];
}
