/** 遊戲類型 */
export enum GameType {
  /** 與mssrServer同步之GameType編號及名稱 */
  BrickBreaker = 19,
}

/** 房間設定資料 */
export interface CreateContestRoomGameResponse {
  /** 是否成功開局 */
  isSuccess: boolean;
  /** 上傳gameLog時拿來驗證的verifyCode */
  verifyCode: string;
}

/** 建立連線/加入房間用資料, 將jwt解成這種格式 */
export interface ContestRoomUserInfo {
  contestRoomUserId: number;
  contestRoomId: number;
  contestId: number;
  uid: number;
  gameType: GameType;
}

/** 顯示用資料(學校 姓名 所選英雄等) */
export interface ServiceUserInfo {
  uid: number;
  school: string;
  name: string;
  heroId: number;
  hid: number;
  memberType: MemberType;
  isOnline: boolean;
}

export enum MemberType {
  Player = 0,
  Spectator = 1,
}

/** RPCUserJoinGame的回傳格式 */
export enum UserJoinGameResult {
  Success,
  GameTypeError,
  MssrCreateGameFailed,
  RoomUserTokenVerifyFailed,
  UserAlreadyExist,
  SessionIdNotMatchUid,
  IsRoomFinished,
  RoomDataNotFound,
  RoomDataError,
  GameLogicInitError,
  UnexpectedMemberType,
  PTCLError,
}

//#region 題目相關
/** 作答格式 */
export interface AnswerInfo {
  /** 選擇答案 (1 base, 未選 = -1) */
  answerIndex: number;
  /** 答題使用時間 */
  usedSecond: number;
}

export interface QuestionData {
  /** 封包結果 */
  result: ResponseState;
  /** 封包資料 */
  resMessage: string;

  /** 總題目數 */
  questTotalCount: number;
  /** 題目排序ID */
  questOrder: number;

  /** 題目資料 */
  quizData: QuizData;

  /** 是否答對 */
  isCorrect: boolean;
  /** 題目得分 */
  answerScore: number;

  /** 是否一般答題結束 */
  isRoundOneEnd: boolean;
  /** 是否答題結束 */
  isFinished: boolean;
}

/** 弱連網取得的題目格式, 跟vue在使用的格式有微妙的不同,
 * 為避免使用時搞混所以獨立一個structure
 */
export interface OriginQuizData {
  /** 題目ID */
  qid: string;
  /** 題目 */
  questionMain: string;
  /** 鏈結url */
  questionSub: string;
  /** 選項 */
  option: {
    answer: string;
    option1: string;
    option2: string;
    option3: string;
  };
  /** 題庫來源 */
  quizSource: QuizSource;
  /** 作答限時 */
  seconds: number;
}

/** vue顯示題目及選項所使用的資料格式 */
export interface QuizData {
  /** 題目ID */
  qid: string;
  /** 題目 */
  questionMain: string;
  /** 鏈結url */
  questionSub: string;
  /** 選項 */
  options: AnswerOptions;
  /** 題庫來源 */
  quizSource: QuizSource;
  /** 作答限時 */
  seconds: number;
}

/** 答案選項 */
export interface AnswerOptions {
  /** 選項1 */
  option1: string;
  /** 選項2 */
  option2: string;
  /** 選項3 */
  option3: string;
  /** 選項4 */
  option4: string;
}

/** 題庫來源 */
export enum QuizSource {
  None = -1,
  /** 學創 */
  Enableets = 0,
  /** 因材網 */
  AdlEdu = 1,
}

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
}
//#endregion
