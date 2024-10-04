import { fetch, post, put, remove } from '../api/http-server';

/** 賽事列表 */
export const contestListAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/contestList_v2', paramObj);
  },
};

/** 賽事詳細資訊 */
export const contestDetailAPI = {
  // 賽事詳細資訊頁
  post: (paramObj: {} | undefined) => {
    return post('/contest_v2', paramObj);
  },
};

/** 賽事紀錄 */
export const contestScoreAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/contestPlayerRecord', paramObj);
  },
};

/** 題庫列表 */
export const quizSetListAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/quizSetList', paramObj);
  },
};

/** 賽事編輯清單 */
export const contestEditListAPI = {
  // 導師專區賽事列表
  post: (paramObj: {} | undefined) => {
    return post('/contestEditList', paramObj);
  },
};

/** 賽事編輯 */
export const contestEditAPI = {
  /** 讀取編輯賽事列表 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/contestEdit', paramObj);
  },
  /** 創建賽事 */
  post: (paramObj: {} | undefined) => {
    return post('/contestEdit', paramObj, true);
  },
  /** 更新編輯賽事 */
  put: (paramObj: {} | undefined) => {
    return put('/contestEdit', paramObj);
  },
  /** 刪除賽事 */
  remove: (paramObj: {} | undefined) => {
    return remove('/contestEdit', paramObj);
  },
};

/** 學創賽事題庫or因材網學習點題庫 */
export const contestQuizBaseEditorAPI = {
  // 取得賽事使用題庫
  fetch: (paramObj: {} | undefined) => {
    return fetch('/contestQuizBaseEditor', paramObj);
  },
  // 上傳題庫
  post: (paramObj: {} | undefined) => {
    return post('/contestQuizBaseEditor', paramObj);
  },
};

/** 因材網賽事題庫 */
export const contestEventGameLinkIdAPI = {
  // 取得賽事使用題庫
  fetch: (paramObj: {} | undefined) => {
    return fetch('/contestEventGameLinkId', paramObj);
  },
  // 上傳題庫
  post: (paramObj: {} | undefined) => {
    return post('/combineContestGameLink', paramObj);
  },
};

/** 將測試賽事發佈成正式賽事 */
export const releaseTestingContestAPI = {
  put: (paramObj: {} | undefined) => {
    return put(`/releaseTestingContest?contestId=${paramObj}`);
  },
};

/** 開放賽事獎勵 */
export const releaseContestRankAPI = {
  put: (paramObj: {} | undefined) => {
    return put(`/releaseContestRank?contestId=${paramObj}`);
  },
};

/** 房間模板清單 */
export const contestRoomBossReferListAPI = {
  // 導師專區房間模板列表
  post: (paramObj: {} | undefined) => {
    return post('/contestRoomBossReferList', paramObj);
  },
};

/** 取得已創建的房間列表 */
export const contestRoomEditListAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/contestRoomEditList', paramObj);
  },
};

/** 編輯房間資料 */
export const contestRoomEditAPI = {
  // 取得房間編輯需要資訊
  fetch: (paramObj: {} | undefined) => {
    return fetch('/contestRoomEdit', paramObj);
  },
  // 送出修改
  put: (paramObj: {} | undefined) => {
    return put('/contestRoomEdit', paramObj);
  },
};

/** 客製賽事房間查詢 */
export const customContestRoomSearchAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/customContestRoomSearch', paramObj);
  },
};
/** 加入賽事房間 */
export const officialContestRoomUserSignUpAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/officialContestRoomUserSignUp', paramObj);
  },
};

/** 客製房間創建 */
export const customContestRoomEditAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/customContestRoomEdit', paramObj, true);
  },
};

/** 發送客製房間的邀請函 */
export const contestRoomInvitation = {
  post: (paramObj: {} | undefined) => {
    return post('/contestRoomInvitation', paramObj, true);
  },
};

/** 加入賽事房間 */
export const customContestRoomUserSignUpAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/customContestRoomUserSignUp', paramObj);
  },
};

/** 觀戰賽事房間 */
export const contestRoomSpectatorSignUpAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/contestRoomSpectatorSignUp', paramObj);
  },
};

/** 賽事房間用戶身分是否已存在 */
export const officialContestRoomUserCheckAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/officialContestRoomUserCheck', paramObj);
  },
};

/** 賽事排行榜 */
export const contestRankScoreAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/contestRankScoreList', paramObj);
  },
};

/** 取得競賽排名參與次數排行 */
export const rankContestPlayCountAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/rankContestPlayCount', paramObj);
  },
};

/** 取得競賽玩家積分排行 */
export const userContestRankScoreAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/rankUserContestPoint', paramObj);
  },
};

/** 取得英雄排行 */
export const rankUserHeroPointAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/rankUserHeroPoint', paramObj);
  },
};

/** 取得學校排行 */
export const everySchoolSystemRankAPI = {
  // 學校參與度
  fetch: (paramObj: {} | undefined) => {
    return fetch('./everySchoolSystemRank', paramObj);
  },
};

/** 佈置積分排行 */
export const adornmentPointRankAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/rankUserFarmMapPoint', paramObj);
  },
};

/** 領取賽事排行獎勵 */
export const rankRewardAPI = {
  put: (paramObj: {} | undefined) => {
    return put('/contestGetRankReward', paramObj);
  },
};

/** 教師指派任務排行 */
export const rankUserAdlEduTeacherMissionPointAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/rankUserAdlEduTeacherMissionPoint', paramObj);
  },
};

/** 教師指派任務完成比率 */
export const rankUserAdlEduTeacherMissionRatePointAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/rankUserAdlEduTeacherMissionRatePoint', paramObj);
  },
};

/** 取得賽事紀錄 */
export const contestRoomOverviewAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/contestRoomOverview', paramObj);
  },
};

/** 取得賽事邀請通知列表 */
export const contestRoomInviteListAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/contestRoomInviteList', paramObj);
  },
};
