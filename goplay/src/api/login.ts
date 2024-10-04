import { post, fetch } from '../api/http-server';

/** 登入 */
export const loginUserAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/login', paramObj);
  },
};

/** OpenId登入 */
export const loginOpAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/loginOp', paramObj);
  },
};

/** 登出 */
export const logoutUserAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/logout', paramObj);
  },
};

/** 取得因材網課程單元遊戲點對應的賽事編號 */
export const adlEduAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/subjecUnitContestId', paramObj);
  },
};

/** 宇宙能量 */
export const universeEnergyAPI = {
  // 取得當前宇宙能量
  fetch: (paramObj: {} | undefined) => {
    return fetch('/universeEnergy', paramObj);
  },
  // 扣除宇宙能量
  post: (paramObj: {} | undefined) => {
    return post('/universeEnergy', paramObj);
  },
};

/** 宇宙能量資訊 */
export const universeEnergyInfoAPI = {
  // 取得扣除宇宙能量資訊
  fetch: (paramObj: {} | undefined) => {
    return fetch('/universeEnergyInfo', paramObj);
  },
};

/** 紀錄GA事件 */
export const eventTriggerUseAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/eventTriggerUse', paramObj);
  },
};

/** 取得公告 */
export const bulletinDataAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/bulletin', paramObj);
  },
};

/** 取得Web介面設定 */
export const webAppConfigAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7WebAppConfig', paramObj);
  },
};

/** 取得個人成就2022 */
export const userInfo2022API = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/userInfo2022', paramObj);
  },
};
