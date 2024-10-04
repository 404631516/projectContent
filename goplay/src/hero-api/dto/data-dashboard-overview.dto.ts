import { ApiResOkBaseDto } from './api.dto';

/** 管理員總覽資料 response */
export class AdminOverviewDataResultDto extends ApiResOkBaseDto {
  /**
   * 建立一個總管理員覽資料 response。
   * @param data 表示要從中創建管理員總覽資料 response的數據。
   */
  constructor(data?: AdminOverviewDataResultDto) {
    super();
    Object.assign(this, data);
  }

  /** 總帳號數量 */
  totalAccountCount: number;

  /** 總登入次數 */
  totalLoginCount: number;

  /** 總答題次數 */
  totalAnswerCount: number;

  /** 總在線時間 */
  totalOnlineTime: number;

  /** 各科總答題次數 */
  totalSubjectAnswerCount: string;

  /** 各縣市總帳號數量 */
  totalCountyAccountCount: string;

  /** 各遊戲模式遊玩總次數 */
  totalGameModePlayCount: string;

  /** 更新日期 */
  updatedAt: Date;
}

/** 教師總覽資料 response */
export class TeacherOverviewDataResultDto extends ApiResOkBaseDto {
  /**
   * 建立一個教師總覽資料 response。
   * @param data 表示要從中創建教師總覽資料 response的數據。
   */
  constructor(data?: TeacherOverviewDataResultDto) {
    super();
    Object.assign(this, data);
  }

  /** 校總帳號數量 */
  schoolTotalAccountCount: number;

  /** 校總登入次數 */
  schoolTotalLoginCount: number;

  /** 校總答題次數 */
  schoolTotalAnswerCount: number;

  /** 校總在線時間 */
  schoolTotalOnlineTime: number;

  /** 校各科答題次數(一年內) */
  schoolSubjectAnswerCountOneYear: string;

  /** 校各遊戲模式遊玩總次數(一年內) */
  schoolGameModePlayCountOneYear: string;

  /** 校英雄解鎖排行(一年內) */
  schoolHeroRankingOneYear: string;

  /** 更新日期 */
  updatedAt: Date;
}

/**
 * 學生總覽JSON資料。
 * - 用於class-validator的驗證。
 */
export class StudentOverviewJsonData {
  /**
   * 建立一個學生總覽JSON資料。
   * @param data 表示要從中創建學生總覽JSON資料的數據。
   */
  constructor(data?: StudentOverviewJsonData) {
    Object.assign(this, data);
  }
  /** 學生玩各科答題遊玩次數 */
  totalStudentSubjectPlayCount: string;

  /** 學生玩各遊戲模式遊玩次數 */
  totalStudentGameModePlayCount: string;
}

/**
 * 學生總覽資料。
 * - 用於class-validator的驗證。
 */
export class StudentOverviewData {
  /**
   * 建立一個學生總覽資料。
   * @param data 表示要從中創建學生總覽資料的數據。
   */
  constructor(data?: StudentOverviewData) {
    Object.assign(this, data);
  }

  /** JSON資料 */
  jsonData: string;

  /** 學生UID */
  id: number;

  /** 更新日期 */
  updatedAt: string;
}

/** 學生總覽資料 response */
export class StudentOverviewDataResultDto extends ApiResOkBaseDto {
  /** 學生玩各科答題遊玩次數 */
  totalStudentSubjectPlayCount: string;

  /** 學生玩各遊戲模式遊玩次數 */
  totalStudentGameModePlayCount: string;

  /** 更新日期 */
  updatedAt: Date;
}
