import { fetch, post, put } from '../api/http-server';

/** 英雄系統 首次解鎖 */
export const heroFirstChoiceAPI = {
  /** 首次解鎖英雄 */
  post: (paramObj: {} | undefined) => {
    return post('/heroFirstChoice', paramObj, true);
  },
};

/** 英雄系統 英雄列表 */
export const heroListAPI = {
  /** 取得玩家英雄列表 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroList', paramObj);
  },
  /** 解鎖英雄 */
  post: (paramObj: {} | undefined) => {
    return post('/heroList', paramObj, true);
  },
};

/** 英雄系統 英雄積分 */
export const heroTotalPointAPI = {
  /** 取得用戶的英雄總積分 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroTotalPoint', paramObj);
  },
};

/** 英雄系統 英雄隊伍 */
export const heroTeamAPI = {
  /** 列出玩家擁有的英雄 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroTeamHeroj7', paramObj);
  },
};

/** 英雄裝備 */
export const heroEquipAPI = {
  /** 變更 英雄隊伍裝備 */
  put: (options: {} | undefined) => {
    return put('/heroEquip', options, true);
  },
};

/** 個人基地拜訪 取得玩家英雄列表 */
export const heroListVisitorAPI = {
  /** 玩家擁有的英雄列表 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroListVisitor', paramObj);
  },
};
