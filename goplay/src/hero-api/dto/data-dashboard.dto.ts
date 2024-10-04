import { ApiResOkBaseDto } from './api.dto';

/** 答題回歸分析圖request */
export class AnswerRegressionAnalysisDto {
  /**
   * 縣市ID(可選)。
   * 如果未選擇，伺服器將預設返回全部縣市。
   */
  countyId?: number;

  /**
   * 年級(可選)。
   * 如果未選擇，伺服器將預設返回全部年級。
   */
  gradeNum?: number;

  /**
   * 科目(可選)。
   * 如果未選擇，伺服器將預設返回全部科目。
   */
  subjectType?: number;
}

/** 答題回歸分析圖response */
export class AnswerRegressionAnalysisResultDto extends ApiResOkBaseDto {
  /** 遊戲資料 */
  data: GameData[];
}

/** 遊戲資料 */
export interface GameData {
  /** 遊戲次數 */
  gameNumber: number;
  /** 正確率 */
  correctRate: number;
  /** 樣本數 */
  entryCount: number;
}

/** 答題箱型圖 request */
export class AnswerBoxPlotDto {
  /** 全班學生的UID */
  playerId: number[];

  /**
   * 科目(可選)。
   * 如果未選擇，伺服器將預設返回全部科目。
   */
  subjectType?: number;

  //#region 比較的範圍(全班、全校、全國)
  // 以下有三個選項可用來指定[比較的範圍]：classId、schoolId、和空值。
  // - 若提供 classId，系統將比較全班範圍。
  // - 若提供 schoolId，系統將比較全校範圍。
  // - 若未提供 classId 或 schoolId，即空值，系統將自動比較全國範圍。

  /**
   * 班級ID，用於指定比較全班範圍。
   * 這是一個可選的屬性。
   */
  classId?: number;

  /**
   * 學校ID，用於指定比較全校範圍。
   * 這是一個可選的屬性。
   */
  schoolId?: number;
  //#endregion
}

/** 答題箱型圖 response */
export class AnswerBoxPlotResultDto extends ApiResOkBaseDto {
  /** 四分位數 */
  quartiles: Quartiles;
  /** 四分位距 */
  IQR: number;
  /** 平均正確率 */
  averageRate: number;
  /** 玩家正確率列表 */
  playerRates: PlayerRate[];
  /** 異常值列表 */
  outliers: number[];
}

/** 四分位數 */
export interface Quartiles {
  /** 第一四分位數 */
  Q1: number;
  /** 中位數 */
  median: number;
  /** 第三四分位數 */
  Q3: number;
}

/** 玩家正確率 */
export interface PlayerRate {
  /** 玩家UID */
  playerId: number;
  /** 正確率 */
  rate: number;
}
