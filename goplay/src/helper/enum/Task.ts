/** 任務狀態 */
export enum TaskState {
  /** 可承接 */
  CanAccept = 0,
  /** 進行中 */
  Running = 1,
  /** 可領取 */
  Passed = 2,
  /** 已完成 */
  End = 3,
  /** 失敗 */
  Fail = 4,
}

/** 任務要求行為 */
export enum TaskReqKey {
  /** 每天魔王賽開啟次數 */
  gameTimes = 'gameTimes',
  /** 每天各科目學習總次數 */
  allSubject = 'allSubject',
  /** 每天科目學習次數(後接科目id) */
  subject = 'subject_',
  /** 每天星球大戰次數 */
  learning = 'learning',

  /** (因材)影片瀏覽時間(後接科目id) */
  video_time = 'video_time_',
  /** (因材)練習題時間(後接科目id) */
  prac_time = 'prac_time_',
  /** (因材)動態評量時間(後接科目id) */
  da_time = 'da_time_',
  /** (因材)單元測驗時間(後接科目id) */
  unit_time = 'unit_time_',
  /** (因材)題庫縱貫時間(後接科目id) */
  idct_time = 'idct_time_',
  /** (因材)老師指派任務 */
  adl_mission_record = 'adl_mission_record',
}
