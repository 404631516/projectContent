/** 遊戲結束 */
export enum EndType {
  None = -1,
  /** 答題成功 */
  AnswerSuccess = 1,
  /** 答題失敗 */
  AnswerFail = 2,
  /** 挑戰成功 */
  Success = 3,
  /** 挑戰失敗 */
  Fail = 4,
  /** 續命題成功 */
  ContinueSuccess = 5,
  /** 續命題失敗 */
  ContinueFail = 6,
}

/** 敵人波次模式 */
export enum EnemyWaveMode {
  /** 隨機 */
  Random = 1,
  /** 按照順序 */
  Order = 2,
}

/** 網頁路徑 */
export enum WebGameName {
  /** 測試遊戲 */
  TestGame = 'TestGame',
  /** 答題遊戲 (答題階段)*/
  AnswerGame = 'AnswerGame',
  /** 答題遊戲 (遊戲階段)*/
  AnswerPhaserGame = 'AnswerPhaserGame',
  /** 星球大戰 */
  PlanetGame = 'PlanetGame',
  /** 個人基地 */
  PersonalBaseGame = 'PersonalBaseGame',
  /** 因雄宇宙 */
  HeroUniverseGame = 'HeroUniverseGame',
}

/** 遊戲說明畫面(對應路由) */
export enum WebGameHelpName {
  /** 星球大戰說明 */
  PlanetGameHelp = 'PlanetGameHelp',
}
