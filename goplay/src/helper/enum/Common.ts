/** response 狀態 */
export enum ResponseState {
  /** 取得成功狀態 */
  Success = 'success',
  /** 尚未開放 */
  AdlNotOpen = 'notAvailable',
  /** 無編輯權限 */
  AclAccessDeny = 'aclAccessDeny',
  /** 生物兵器是否已解鎖狀態 */
  WeaponLock = 'againstThatSystemRules',
  /** 因材網請求逾時 */
  AdlEduTimeout = 'AdlEdu_API_Timeout ',
  /** 因材網請求失敗 */
  AdlEduStatusFail = 'AdlEdu_API_StatusFail',
  /** 因材網請求回應錯誤 */
  AdlEduRequestFail = 'AdlEdu_API_RequestFail',
  /** token驗證錯誤 */
  InvalidateToken = 'invalidateToken',
  /** Cookie身分錯誤 */
  CookiePermissionDenied = 'cookiePermissionDenied',

  /** 初始化任務失敗 */
  QuestInitFaild = 'quest_InitFaild',
  /** 重置任務失敗 */
  QuestResetFaild = 'quest_ResetFaild',
  /** 此任務沒有在靜態表中 */
  QuestNoJsonDataError = 'quest_NoJsonDataError',
  /** 靜態表中不可接取任務 */
  QuestNotInTimeRangeError = 'quest_NotInTimeRangeError',
  /** 此任務已存在 */
  QuestQuestAlreadyExist = 'quest_QuestAlreadyExist',
  /** 此任務已完成 */
  QuestHaveQuestEnd = 'quest_HaveQuestEnd',
  /** 前置任務未完成 */
  QuestRequireQuestNotEnd = 'quest_RequireQuestNotEnd',
  /** 任務額外條件不符 */
  QuestNotReachedQuestTakesCondition = 'quest_NotReachedQuestTakesCondition',

  /** 任務資料錯誤 */
  QuestDBError = 'quest_DBError',
  /** 任務不存在 */
  QuestDataNullError = 'quest_DataNullError',
  /** 驗證任務未達領獎資格 */
  QuestAbleReapError = 'quest_AbleReapError',

  /** 任務不是失敗狀態 */
  QuestFlagStatusError = 'quest_FlagStatusError',

  /** 房間密碼錯誤 */
  ContestRoomPasswordIncorrect = 'contestRoomPasswordIncorrect',
  /** 房間人數已滿 */
  ContestRoomUserAlreadyMax = 'contestRoomUserAlreadyMax',
  /** 本賽事現在沒有開放房間 */
  ContestRoomAreAllInvalid = 'contestRoomAreAllInvalid',
  /** 您被該房間禁止進入 */
  ContestRoomUserHasBeenBanned = 'contestRoomUserHasBeenBanned',
  /** 觀戰房間不存在 */
  ContestRoomGameNotExist = 'contestRoomGameNotExist',
  /** 房間編號不存在 */
  ContestRoomNotFound = 'contestRoomNotFound',
  /** 房間已過期 */
  ContestRoomIsInvalid = 'contestRoomIsInvalid',
  /** 參賽房間已結束 */
  ContestRoomIsFinished = 'contestRoomIsFinished',
  /** 參加者加入拒絕編輯 */
  ContestGamingRoomEditDenied = 'contestGamingRoomEditDenied',
  /** 賽事模板已過期 */
  ContestIsExpired = 'contestIsExpired',
  /** 帳號異常 */
  SystemCode999 = 'systemCode999',

  /** 不是自己的信件 */
  NotSelfMail = 'mail_NotSelfMail',
  /** 無此信件資料 */
  MailDataNotFound = 'mail_DataNotFound',
  /** 此信件無道具領取 */
  MailNoItemCount = 'mail_NoItemCount',
  /** 此信件道具已領取 */
  MailAlreadyGet = 'mail_AlreadyGet',
  /** 未讀取或未領取的信件不可刪除 */
  DeleteMailFail = 'mail_DeleteMailFaild',

  /** 已經完成作答 */
  FormsAlreadyParticipated = 'formsAlreadyParticipated',
  /** 問卷未公開發佈 */
  FormsIsNotInPublishedTime = 'formsIsNotInPublishedTime',
  /** 作答題目不完整 */
  FormsAnswersIncomplete = 'formsAnswersIncomplete',
}

/** Token ErroCode */
export enum ResponseTokenState {
  /** 憑證過期(cookie版本才會出現) */
  TokenExpired = 'tokenExpired',
  /** 憑證剖析失敗 */
  TokenDecodedFail = 'tokenDecodedFail',
  /** 憑證用戶重複登入 */
  TokenUserLoggedIn = 'tokenUserLogged-in',
  /** 憑證用戶資料不存在 */
  TokenUserNotExist = 'tokenUserNotExist',
  /** 找不到憑證可以核對 */
  TokenMissing = 'tokenMissing',
}

/** 生物兵器ErroCode */
export enum ResponseWeaponState {
  /** 非此用戶持有生物兵器 */
  WeaponNotOwn = 'WeaponNotOwn',
  /** 此生物兵器不存在 */
  WeaponIsNull = 'WeaponIsNull',
  /** 此生物兵器升級失敗 */
  WeaponUpgradeError = 'WeaponUpgradeError',
  /** 此生物兵器不可解鎖 */
  WeaponUnlock = 'WeaponUnlock',
  /** 金幣不足 */
  GoldNotBuy = 'GoldNotBuy',
  /** 晶球不足 */
  CrystalNotBuy = 'CrystalNotBuy',
}

/** HTTP封包狀態 */
export enum HttpReadyState {
  /** 客戶端已被建立，但 open() 方法尚未被呼叫 */
  Unsent = 0,
  /** open() 方法已被呼叫 */
  Opened,
  /** send() 方法已被呼叫，而且可取得 header 與狀態 */
  HeadersReceived,
  /** 回應資料下載中，此時 responseText 會擁有部分資料 */
  Loading,
  /** 完成下載操作 */
  Done,
}

/** HTTP連線狀態 */
export enum HttpStatus {
  /** OK */
  OK = 200,
}

/** 組隊類別 */
export enum TeamType {
  /** 單淘汰賽 */
  Tournament = 1,
  /** 積分賽 */
  PVE = 2,
  /** 多人連線對抗賽 */
  MVS = 3,
  /** 快速配對 */
  QuickMatch = 4,
  /** 自由開局，可開多重賽事 */
  Mix = 5,
  /** 金鑰模式 (使用key進入同一遊戲房) */
  KeyMatch = 6,
  /** web 遊戲模式 */
  WebGame = 7,
  /** 魔王賽 */
  WorldBoss = 8,
  /** 因材網魔王賽 (題目來自於因才網題庫) */
  AdlWorldBoss = 9,
  /** 房間賽 */
  Room = 10,
  /** 自由開房間(參考模板) */
  FreeRoom = 11,
}

/** 遊戲類別 */
export enum GameType {
  /** 一對一單對單 */
  PKG = 1,
  /** 走位戰 */
  Blocking = 2,
  /** 跑酷戰 */
  Parkour = 3,
  /** 決鬥 */
  Duel = 4,
  /** 聊天室 */
  Chat = 5,
  /** 猜拳小遊戲 */
  Jankenpon = 6,
  /** 打地鼠 */
  MoleBuster = 7,
  /** 健身 */
  Fitness = 8,
  /** 程式積木 */
  CodeBlock = 9,
  /** 聊天模式 */
  ChatRoom = 10,
  /** 塔防 */
  WebTowerDefense = 11,
  /** 消消樂 */
  WebBejeweled = 12,
  /** 射擊 */
  WebShooter = 13,
  /** 打地鼠 */
  WebHamster = 14,
  /** 網頁遊戲隨機 */
  WebAdlGameBox = 15,
  /** 跑酷 */
  WebParkour = 16,
  /** 釣魚 */
  WebFishing = 17,
  /** 炸彈人 */
  WebBomberMan = 18,
  /** 敲敲答答 */
  WebBrickBreaker = 19,
  /** 泡泡龍 */
  WebBubbleDragon = 20,
  /** 翻翻牌 */
  WebMatchingCard = 21,
  /** 小豬大野狼 */
  WebPiggy = 22,
  /** 貪食蛇 */
  WebSnake = 23,
  /** 垂直跑酷 */
  WebVerticalParkour = 24,
  /** 太空侵略者 */
  WebSpaceInvaders = 25,
  /** 2048 */
  WebPuzzle2048 = 26,
}

/** 因雄崛起專用遊戲類別 */
export enum HeroJ7GameType {
  /** 全部 (用於搜尋選項) */
  Total = 0,
  /** 塔防 */
  TowerDefense = GameType.WebTowerDefense,
  /** 打地鼠 */
  Hamster = GameType.WebHamster,
  /** 消消樂 */
  Bejeweled = GameType.WebBejeweled,
  /** 射擊 */
  Shooter = GameType.WebShooter,
  /** 隨機 (答題遊戲類別為隨機, 由Client端決定) */
  Random = GameType.WebAdlGameBox,
  /** 跑酷 */
  Parkour = GameType.WebParkour,
  /** 釣魚 */
  Fishing = GameType.WebFishing,
  /** 炸彈超人 */
  BomberMan = GameType.WebBomberMan,
  /** 敲敲答答 */
  BrickBreaker = GameType.WebBrickBreaker,
  /** 泡泡龍 */
  BubbleDragon = GameType.WebBubbleDragon,
  /** 翻翻牌 */
  MatchingCard = GameType.WebMatchingCard,
  /** 小豬大野狼 */
  Piggy = GameType.WebPiggy,
  /** 貪食蛇 */
  Snake = GameType.WebSnake,
  /** 垂直跑酷 */
  VerticalParkour = GameType.WebVerticalParkour,
  /** 太空侵略者 */
  SpaceInvaders = GameType.WebSpaceInvaders,
  /** 2048 */
  Puzzle2048 = GameType.WebPuzzle2048,
}

/** 賽事篩選遊戲類別名稱 */
export enum GameTypeName {
  /** 全部 */
  Total = '全部',
  /** 塔防 */
  TowerDefense = '塔防',
  /** 打地鼠 */
  Hamster = '打地鼠',
  /** 消消樂 */
  Bejeweled = '消消樂',
  /** 射擊 */
  Shooter = '射擊',
  /** 隨機 */
  Random = '隨機',
  /** 跑酷 */
  Parkour = '跑酷',
  /** 釣魚 */
  Fishing = '釣魚',
  /** 炸彈超人 */
  BomberMan = '炸彈超人',
  /** 敲敲答答 */
  BrickBreaker = '敲敲答答',
  /** 泡泡龍 */
  BubbleDragon = '因雄氣泡',
  /** 翻翻牌 */
  MatchingCard = '記憶對決',
  /** 蔬食防線 */
  Piggy = '蔬食防線',
  /** 貪食蛇 */
  Snake = '貪食蛇',
  /** 垂直跑酷 */
  VerticalParkour = '迷宮跑酷',
  /** 太空侵略者 */
  SpaceInvaders = '太空侵略者',
  /** 2048 */
  Puzzle2048 = '2048',
}

/** 遊戲所屬類型 */
export enum GameBoxType {
  /** 無所屬 */
  None,
  /** 隨機遊戲 */
  AdlGameBox,
  /** 開局遊戲 */
  RoomGameBox,
}

/** 網頁遊戲類型 */
export enum WebGameMode {
  None = 0,
  /** 世界大賽 */
  WorldContest = 1,
  /** 星球大戰 */
  PlanetWar = 2,
}

/** 網頁遊戲類型名稱 */
export enum WebGameModeName {
  None = 0,
  /** 魔王賽 */
  WorldContest = '魔王挑戰',
  /** 星球大戰 */
  PlanetWar = '星球大戰',
  /** 表宇宙 */
  OuterWar = '表宇宙',
  /** 裡宇宙 */
  InnerWar = '裡宇宙',
  /** 個人基地佈置 */
  Adornment = '個人基地佈置',
  /** 坦克大戰 */
  BrickBreaker = '敲敲答答',
}

/** Session儲存資料的Key */
export enum SessionStorageKey {
  /** 音樂開關 */
  OpenWebAudio = 'openWebAudio',
  /** 賽事LOG ID */
  GameLogId = 'gameLogId',
}

/** Cookie存取字串值 */
export enum CookieStr {
  /** 是否登入判斷 (由server設定) */
  Login = 'logined',
  /** 因材網帳號登入判斷 */
  AdlGame = 'AdlGame',
  /** 題庫編輯跳轉權限token對應值 */
  QuizEdit = 'User-Token',
}

/** LocalStorage 存取字串值 */
export enum LocalStorageStr {
  /** 使用者資訊 */
  UserInfo = 'useInfo',
}

//#region 賽事相關
/** 賽事狀態 */
export enum ContestStateType {
  /** 尙未開放報名 */
  NoApply = 1,
  /** 開放報名 */
  OpenApply = 2,
  /** 報名截止 */
  StopApply = 3,
  /** 遊戲進行中 */
  Progress = 4,
  /** 遊戲結束 */
  GameOver = 5,
  /** (棄用)開放報名或遊戲尚未結束 */
  RegistrationAndGame = 6,
  /** 即將開始 */
  ComingSoon = 7,
}

/** 賽事狀態名稱 */
export enum ContestStateName {
  /** 尙未開放報名 */
  NoApply = '尚未報名',
  /** 開放報名 */
  OpenApply = '開放報名',
  /** 報名截止 */
  StopApply = '停止報名',
  /** 遊戲進行中 */
  Progress = '進行中',
  /** 遊戲結束 */
  GameOver = '遊戲結束',
  /** (棄用)開放報名或遊戲尚未結束 */
  RegistrationAndGame = '遊戲尚未結束',
  /** 即將開始 */
  ComingSoon = '即將開始',
}

/** 賽事狀態色碼 */
export enum ContestStateColor {
  /** 尙未開放報名 */
  NoApply = '#008000',
  /** 開放報名 */
  OpenApply = '#FFD83E',
  /** 報名截止 */
  StopApply = '#808080',
  /** 遊戲進行中 */
  Progress = '#90E53D',
  /** 遊戲結束 */
  GameOver = '#FF6A6ACC',
  /** (棄用)開放報名或遊戲尚未結束 */
  RegistrationAndGame = '#008000',
  /** 即將開始 */
  ComingSoon = '#56E0E5',
}

/** 賽事狀態色碼 */
export enum ContestStateTextColor {
  /** 尙未開放報名 */
  NoApply = '#008000',
  /** 開放報名 */
  OpenApply = '#034856',
  /** 報名截止 */
  StopApply = '#808080',
  /** 遊戲進行中 */
  Progress = '#28532D',
  /** 遊戲結束 */
  GameOver = '#880202',
  /** (棄用)開放報名或遊戲尚未結束 */
  RegistrationAndGame = '#008000',
  /** 即將開始 */
  ComingSoon = '#034856',
}

/** 賽事排序類別 */
export enum ContestSortType {
  /** 創建時間 */
  CreateAt = 0,
  /** 賽事開始時間 */
  GameStart = 1,
}

/** 賽事排序方式 */
export enum ContestSortOrder {
  /** 前到後 */
  Ascending = 0,
  /** 後到前 */
  Descending = 1,
}

/** 賽事卡片種類 */
export enum ContestCardType {
  /** 魔王挑戰頁面 */
  WorldContest = 1,
  /** 後台一般魔王賽 */
  BackEndWorldBoss = 2,
  /** 後台新魔王賽教師版 */
  BackEndRoomContestTCH = 3,
  /** 後台新魔王賽管理員版 */
  BackEndRoomContestSUP = 4,
  /** 後台派任務條件 */
  BackEndTaskCondition = 5,
}

/** 排行獎勵狀態 */
export enum RankRewardState {
  /** 沒有可領取 */
  UnableGet = 0,
  /** 可領取 */
  AbleGet = 1,
  /** 已領取 */
  AlreadyGet = 2,
  /** 未設定 */
  Unset = -1, //
  /** 賽事尚未結算 */
  UnReleased = -2,
  /** 沒有成績資料 */
  NoScoreData = -3,
}

/** 房間排序類別 */
export enum RoomSortType {
  /** 房間id */
  ContestRoomId = 0,
  /** 創建時間 */
  CreatedAt = 1,
}

/** 房間遊戲狀態 */
export enum RoomStateType {
  /** 未開賽 */
  NotStarted = 1,
  /** 進行中 */
  GameStarted = 2,
  /** 已結束 */
  GameFinished = 3,
  /** 房間過期 */
  OverTime = 4,
  /**　未正確結算 */
  ErrorFinished = 5,
}

/** 房間遊戲狀態名稱 */
export enum RoomStateName {
  /** 未開賽 */
  NotStarted = '未開賽',
  /** 進行中 */
  GameStarted = '進行中',
  /** 已結束 */
  GameFinished = '已結束',
  /** 房間過期 */
  OverTime = '賽局過期',
  /**　未正確結算 */
  ErrorFinished = '未正確結算',
}

/** 房間結算狀態 */
export enum RoomFinishState {
  /** 未設定 */
  Unset = -1,
  /** 未結算 */
  NotFinished = 0,
  /** 已結算 */
  IsFinished = 1,
}

/** 房間週期種類 */
export enum RoomCycleType {
  /** 單場 */
  Single = 1,
  /** 週期 */
  Cycle = 2,
}

/** 房間週期種類 */
export enum RoomCycleTypeName {
  /** 單場 */
  Single = '單場',
  /** 週期 */
  Cycle = '週期',
}

/** 年級代號 */
export enum GradeType {
  /** 預設為0 (ex: google登入使用者) */
  g0 = 0,
  /** 一年級 */
  g1,
  /** 二年級 */
  g2,
  /** 三年級 */
  g3,
  /** 四年級 */
  g4,
  /** 五年級 */
  g5,
  /** 六年級 */
  g6,
  /** 七年級 */
  g7,
  /** 八年級 */
  g8,
  /** 九年級 */
  g9,
  /** 十年級 */
  g10,
  /** 十一年級 */
  g11,
  /** 十二年級 */
  g12,
}

/** 年級名稱 */
export enum GradeTypeName {
  /** 預設為0 (ex: google登入使用者) */
  g0 = '全部',
  /** 一年級 */
  g1 = '一',
  /** 二年級 */
  g2 = '二',
  /** 三年級 */
  g3 = '三',
  /** 四年級 */
  g4 = '四',
  /** 五年級 */
  g5 = '五',
  /** 六年級 */
  g6 = '六',
  /** 七年級 */
  g7 = '七',
  /** 八年級 */
  g8 = '八',
  /** 九年級 */
  g9 = '九',
  /** 十年級 */
  g10 = '十',
  /** 十一年級 */
  g11 = '十一',
  /** 十二年級 */
  g12 = '十二',
}

/** 學期代號 */
export enum SemesterType {
  /** 上學期 */
  FirstSemester = 1,
  /** 下學期 */
  SecondSemester = 2,
}

/** 學期名稱 */
export enum SemesterTypeName {
  /** 上學期 */
  FirstSemester = '上',
  /** 下學期 */
  SecondSemester = '下',
}

/** 科目代號 */
export enum SubjectType {
  /** 國語文 */
  Chinese = 1,
  /** 數學 */
  Math = 2,
  /** 自然 */
  Science = 3,
  /** 英語 */
  English = 4,
  /** 自主學習 */
  SelfLearning = 8,
}

/** 科目色碼 */
export enum SubjectBackgroundColor {
  /** 國語文 */
  Chinese = '#76c555',
  /** 數學 */
  Math = '#ec8abe',
  /** 自然 */
  Science = '#4898FF',
  /** 英語 */
  English = '#ae87ff',
  /** 自主學習 */
  SelfLearning = '#55c5c1',
}
//#endregion

//#region 排行榜相關
/** 排行榜類型 */
export enum ResultRankType {
  /** 總排行 */
  Total = 1,
  /** 個人 */
  Personal = 2,
}

/** 排行榜分頁類型 */
export enum RankingTabType {
  /** 排行榜 */
  TotalRankList = 0,
  /** 學生排行榜 */
  StudentRankList = 1,
  /** 老師排行榜 */
  TeacherRankList = 2,
  /** 個人基地排行榜 */
  PersonalBaseRankList = 3,
}

/** 排行榜分頁名稱 */
export enum RankingTabName {
  /** 排行榜 */
  TotalRankList = '排行榜',
  /** 學生排行榜 */
  StudentRankList = '學生排行榜',
  /** 老師排行榜 */
  TeacherRankList = '老師排行榜',
  /** 個人基地排行榜 */
  PersonalBaseRankList = '個人基地排行榜',
}

/** 排行榜統計數據類型 */
export enum RankingRankType {
  /** 學校參與度 */
  UntilSchoolParticipation,
  /** 學校上週參與度 */
  UntilSchoolLastWeekParticipation,
  /** 競賽參與次數 */
  ContestParticipationTimes,
  /** 學生上週競賽積分 */
  StudentLastWeekContestPoints,
  /** 學生累積競賽積分 */
  StudentUntilContestPoints,
  /** 學生上週英雄積分 */
  StudentLastWeekHeroPoints,
  /** 學生累積英雄積分 */
  StudentUntilHeroPoints,
  /** 老師上週競賽積分 */
  TeacherLastWeekContestPoints,
  /** 老師累積競賽積分 */
  TeacherUntilContestPoints,
  /** 老師上週英雄積分 */
  TeacherLastWeekHeroPoints,
  /** 老師累積英雄積分 */
  TeacherUntilHeroPoints,
  /** 老師任務派送積分 */
  TeacherTaskPoint,
  /** 老師任務派送完成率 */
  TeacherTaskRatePoint,
  /** 裝飾積分排行 */
  AdornmentRankPoints,
}

/** 排行榜副標題 */
export enum RankingSubTitle {
  /** 學校參與度 */
  UntilSchoolParticipation = '學校參與度',
  /** 學校上週參與度 */
  UntilSchoolLastWeekParticipation = '學校上週參與度',
  /** 競賽參與次數 */
  ContestParticipationTimes = '競賽參與次數',
  /** 學生上週競賽積分 */
  StudentLastWeekContestPoints = '上週競賽積分',
  /** 學生累積競賽積分 */
  StudentUntilContestPoints = '累積競賽積分',
  /** 學生上週英雄積分 */
  StudentLastWeekHeroPoints = '上週英雄積分',
  /** 學生累積英雄積分 */
  StudentUntilHeroPoints = '累積英雄積分',
  /** 老師上週競賽積分 */
  TeacherLastWeekContestPoints = '上週競賽積分',
  /** 老師累積競賽積分 */
  TeacherUntilContestPoints = '累積競賽積分',
  /** 老師上週英雄積分 */
  TeacherLastWeekHeroPoints = '上週英雄積分',
  /** 老師累積英雄積分 */
  TeacherUntilHeroPoints = '累積英雄積分',
  /** 老師任務派送積分 */
  TeacherTaskPoint = '派送任務完成數',
  /** 老師任務派送完成率 */
  TeacherTaskRatePoint = '派送任務完成率',
  /** 裝飾積分排行 */
  AdornmentRankPoints = '裝飾積分排行',
  /** 學生上週裝飾積分 */
  StudentLastWeekAdornmentRankPoints = '學生上週裝飾積分',
  /** 老師上週裝飾積分 */
  TeacherLastWeekAdornmentRankPoints = '老師上週裝飾積分',
}

/** 排行榜規則類型 */
export enum RankRuleType {
  // 學創
  Enableets = 1, // bestScore
  // 因材網
  AdlEdu = 2, // totalScore
}
//#endregion

//#region 遊戲 & 結算 相關
/** 題庫來源 */
export enum QuizSource {
  None = -1,
  /** 學創 */
  Enableets = 0,
  /** 因材網 */
  AdlEdu = 1,
}
//#endregion

//#region GA
/** GA 事件 (CategoryId 對應編號)  */
export enum GATagCategoryIdType {
  /** 觀看公告 */
  BulletinWatch = 101,
  /** 跳轉至因材網登入 */
  LinkAdlLogin = 201,
  /** 因材網連結學習單元 */
  AdlLinkUnit = 202,
  /** 因材網跳轉答題遊戲 */
  AdlLinkGame = 203,
  /** 因雄崛起連結教材 */
  HeroLinkTeaching = 204,
  /** 因材網連結星際論壇 */
  AdlLinkForum = 205,
  /** 因材網連結答題結算 */
  AdlLinkAnswerResult = 206,
  /** 答題資訊統計 */
  Heroj7Game = 207,
  /** 小遊戲統計 */
  Heroj7PlayGame = 208,

  /** 取得 首頁總資訊 */
  Heroj7GetDBStartData = 241,
  /** 取得 學校班級資訊 */
  Heroj7SchoolClass = 242,
  /** 統計 總登入次數 */
  Heroj7Login = 243,
  /** 統計 學習時數相關 */
  Heroj7Time = 244,
  /** 統計 點擊次數相關 */
  Heroj7DataCount = 245,
}

/** GA 事件 (ActionId 對應編號)  */
export enum GATagActionIdType {
  /** 公告 */
  BulletinWatch = 10101,

  /** 跳轉至因材網登入 */
  LinkAdlLoginBefore = 20101,
  /** 因材網登入完畢跳轉回來 */
  LinkAdlLoginAfter = 20102,
  /** 因材網連結學習單元 */
  AdlLinkUnit = 20201,
  /** 因材網轉跳答題遊戲 */
  AdlLinkGame = 20301,
  /** 因雄崛起連結教材 */
  HeroLinkTeaching = 20401,
  /** 因材網連結星際論壇 */
  AdlLinkForum = 20501,
  /** 因材網連結答題結算 */
  AdlLinkAnswerResult = 20601,

  /** 開始遊戲 */
  Heroj7GameStart = 20701,
  /** 答題結束 */
  Heroj7AnswerEnd = 20702,
  /** 續命題結束 */
  Heroj7ContinueEnd = 20703,
  /** 結算結束  */
  Heroj7GameFinish = 20704,

  /** 選擇小遊戲類型 */
  Heroj7PlayGameType = 20801,
  /** 選擇遊戲輪盤模式 */
  Heroj7GameWheelMode = 20802,

  /** 取得首頁總資訊 */
  Heroj7GetDBStartData = 24101,
  /** 教師取得班級列表 */
  Heroj7GetClassList = 24201,
  /** 取得班級內學生列表 */
  Heroj7GetStudentList = 24202,
  /** 取得總登入次數 */
  Heroj7GetDBLoginCount = 24301,
  /** 取得總登入人數 */
  Heroj7GetDBLoginUser = 24302,
  /** 取得在線總時間 */
  Heroj7GetDBOnlineTime = 24401,
  /** 取得總學習時數 */
  Heroj7GetDBStudyTime = 24402,
  /** 取得各科目學習時數 */
  Heroj7GetDBSubjectTime = 24403,
  /** 取得星際論壇發問回答次數 */
  Heroj7GetDBForumDataCount = 24501,
}

/** GA事件文字說明 */
export enum GATagActionStrType {
  /** 公告 */
  BulletinWatch = '公告',
  /** 跳轉至因材網登入 */
  LinkAdlLoginBefore = '跳轉至因材網登入',
  /** 因材網登入完畢跳轉回來 */
  LinkAdlLoginAfter = '因材網登入完畢跳轉回來',
  /** 因材網連結學習單元 */
  AdlLinkUnit = '因材網連結學習單元',
  /** 因材網轉跳答題遊戲 */
  AdlLinkGame = '因材網轉跳答題遊戲',
  /** 因雄崛起連結教材 */
  HeroLinkTeaching = '因雄崛起連結教材',
  /** 因材網連結星際論壇 */
  AdlLinkForum = '因材網連結星際論壇',
  /** 因材網連結答題結算 */
  AdlLinkAnswerResult = '因材網連結答題結算',

  /** 開始遊戲 */
  Heroj7GameStart = '開始遊戲',
  /** 答題結束 */
  Heroj7AnswerEnd = '答題結束',
  /** 續命題結束 */
  Heroj7ContinueEnd = '續命題結束',
  /** 結算結束 */
  Heroj7GameFinish = '結算結束',

  /** 選擇小遊戲類型 */
  Heroj7PlayGameType = '選擇小遊戲類型',
  /** 選擇遊戲輪盤模式 */
  Heroj7GameWheelMode = '選擇遊戲輪盤模式',

  /** 取得首頁總資訊 */
  Heroj7GetDBStartData = '取得首頁總資訊',
  /** 教師取得班級列表 */
  Heroj7GetClassList = '教師取得班級列表',
  /** 取得班級內學生列表 */
  Heroj7GetStudentList = '取得班級內學生列表',
  /** 取得總登入次數 */
  Heroj7GetDBLoginCount = '取得總登入次數',
  /** 取得總登入人數 */
  Heroj7GetDBLoginUser = '取得總登入人數',
  /** 取得在線總時間 */
  Heroj7GetDBOnlineTime = '取得在線總時間',
  /** 取得總學習時數 */
  Heroj7GetDBStudyTime = '取得總學習時數',
  /** 取得各科目學習時數 */
  Heroj7GetDBSubjectTime = '取得各科目學習時數',
  /** 取得星際論壇發問回答次數 */
  Heroj7GetDBForumDataCount = '取得星際論壇發問回答次數',
}

/** GA事件文字說明 */
export enum GATagCategoryStrType {
  /** 公告 */
  BulletinWatch = '觀看公告',
  /** 跳轉至因材網登入 */
  LinkAdlLoginBefore = '用戶登入',
  /** 用戶登入 */
  LinkAdlLoginAfter = '用戶登入',
  /** 因材網連結學習單元 */
  AdlLinkUnit = '因材網連結學習單元',
  /** 因材網轉跳答題遊戲 */
  AdlLinkGame = '因材網轉跳答題遊戲',
  /** 因雄崛起連結教材 */
  HeroLinkTeaching = '因雄崛起連結教材',
  /** 因材網連結星際論壇 */
  AdlLinkForum = '因材網連結星際論壇',
  /** 因材網連結答題結算 */
  AdlLinkAnswerResult = '因材網連結答題結算',

  /** 開始遊戲 */
  Heroj7GameStart = '開始遊戲',
  /** 答題結束 */
  Heroj7AnswerEnd = '答題結束',
  /** 續命題結束 */
  Heroj7ContinueEnd = '續命題結束',
  /** 結算結束 */
  Heroj7GameFinish = '結算結束',

  /** 選擇小遊戲類型 */
  Heroj7PlayGame = '小遊戲統計',

  /** 取得首頁總資訊 */
  Heroj7GetDBStartData = '取得首頁總資訊',
  /** 教師取得班級列表 */
  Heroj7GetClassList = '教師取得班級列表',
  /** 取得班級內學生列表 */
  Heroj7GetStudentList = '取得班級內學生列表',
  /** 取得總登入次數 */
  Heroj7GetDBLoginCount = '取得總登入次數',
  /** 取得總登入人數 */
  Heroj7GetDBLoginUser = '取得總登入人數',
  /** 取得在線總時間 */
  Heroj7GetDBOnlineTime = '取得在線總時間',
  /** 取得總學習時數 */
  Heroj7GetDBStudyTime = '取得總學習時數',
  /** 取得各科目學習時數 */
  Heroj7GetDBSubjectTime = '取得各科目學習時數',
  /** 取得星際論壇發問回答次數 */
  Heroj7GetDBForumDataCount = '取得星際論壇發問回答次數',
}
//#endregion

//#region 其他
/** 身份權限 */
export enum UserRole {
  /** 管理者 */
  SUP = 0,
  /** 學生 */
  STU = 1,
  /** 家長 */
  PTS = 2,
  /** 老師 */
  TCH = 3,
  /** 校長 */
  PPL = 4,
  /** 代理商 */
  AGT = 5,
  /**縣市管理者 */
  MYR = 6,
  /** 未登入 */
  None = -1,
}

/** 產品編號 */
export enum AppIdType {
  /** adl產品編號 */
  AdlEdu_VSP_Student = 10205,
}

/** 裝置銀幕寬度 */
export enum ScreenType {
  /** 手機 */
  Phone = 435,
  /** 平板 */
  Tablet = 1024,
  /** 電腦 */
  Computer = 1920,
}

/** 宇宙能量類別 */
export enum UniverseEnergyType {
  /** 星球大戰 */
  PlanetWar = 'planetWar',
  /** 小遊戲直接出發 */
  GoStraight = 'goStraight',
  /** 小遊戲強制穿越 */
  ForcedCrossing = 'forcedCrossing',
}

/** 台灣區域 */
export enum CountyType {
  None = 0,
  TP = 1,
  KL,
  NTPC,
  ILC,
  HC,
  HCC,
  TYC,
  MLC,
  TC,
  CHC,
  NTCT,
  CY,
  CYC,
  YLC,
  TN,
  KH,
  NR,
  PHC,
  PTC,
  TTCT,
  HLC,
  KM,
  MATSU,
  MOE,
}

/** DBBoolean */
export enum DBBoolean {
  False = 0,
  True = 1,
}

/** 分業廣播 */
export enum BroadcastEventType {
  /** 登出 */
  logout = 'logout',
  /** 登入 */
  login = 'login',
}
//#endregion

/** 星球大戰 大關編號 */
export enum PlanetWarType {
  /** 塔防 - 表宇宙 */
  Outter = 1,
  /** 逆塔防 - 裡宇宙 */
  Inner = 2,
  /** 逆塔防 - 因雄宇宙 */
  HeroUniverse = 3,
}
