export enum ChartTarget {
  LoginUser = '登入人數',
  LoginCount = '登入次數',
  SchoolLoginCount = '各學校總登入次數',
  CountyLoginCount = '各縣市總登入次數',
  ForumDataCount = '星際論壇發問/回答數',
  OnlineTime = '學習時數',
  CountyOnlineTime = '各縣市總學習時數',
  SchoolOnlineTime = '各學校總學習時數',
  SubjectTime = '學習比例',
  ContestDailyRecord = '賽事使用次數',
  LoginDailyRecord = '使用者登入次數',
  SubjectUnitPlayedRank = '學習知識點各科目挑戰排行',
}

export enum ComType {
  /**學生 */
  Student = 0,
  /**班級 */
  Class = 1,
  /**學校 */
  School = 2,
  /**縣市 */
  City = 3,
  /**全國 */
  Country = 4,
  /**無限制(為了篩選用) */
  None = 'all',
}

export enum ChartType {
  /**柱狀圖 */
  Bar = 'Bar',
  /**線圖*/
  Line = 'Line',
  /**餅圖*/
  Pie = 'Pie',
}

/** 歷程類型 */
export enum ContestGameRecordType {
  /** 答題歷程 */
  AnswerRecord = 0,
  /** 賽事歷程 */
  ContestRecord,
}

/** 歷程類型中文名稱 */
export enum ContestGameRecordName {
  /** 答題歷程 */
  AnswerRecord = '答題歷程',
  /** 賽事歷程 */
  ContestRecord = '賽事歷程',
}
