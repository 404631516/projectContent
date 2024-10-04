import { fetch, post } from '../api/http-server';

export const contestWebGame = {
  // 開始賽事遊戲
  fetch: (paramObj: {} | undefined) => {
    return fetch('/contestWebGame', paramObj);
  },
  // 結算遊戲賽事
  post: (paramObj: {} | undefined) => {
    return post('/contestWebGame', paramObj);
  },
};

/** 取得賽事名稱清單 */
export const contestNameListAPI = {
  post: (paramObj: { contestIds: number[] }) => {
    return post('/contestNameList', paramObj);
  },
};

/**  驗證網頁賽事遊戲的答題, 並取得下一道題目 */
export const contestWebGameJudgeAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/contestWebGameJudge', paramObj);
  },
};

/** 紀錄開始作答時間 */
export const contestWebGameAnswerStartAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/contestWebGameAnsStart', paramObj);
  },
};

export const gamePlayerLog = {
  // 查詢某位用戶的某場賽事遊戲答題記錄(gameId)
  fetch: (paramObj: {} | undefined) => {
    return fetch('/gamePlayerLog', paramObj);
  },
  // 查詢某位用戶的某場賽事遊戲答題記錄(透過logId)
  post: (paramObj: {} | undefined) => {
    return post('/gamePlayerLog', paramObj);
  },
};

/** 取得房間遊戲的挑戰紀錄(MVP清單) */
export const contestRoomGameRecordAPI = {
  // 取得結算資料
  fetch: (paramObj: {} | undefined) => {
    return fetch('/contestRoomGameRecord', paramObj);
  },
};
