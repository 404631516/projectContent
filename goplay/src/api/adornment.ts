import { fetch, post, put, remove } from '../api/http-server';

/** 房間佈置頁面列表 */
export const farmMapDataAPI = {
  /** 讀取已解鎖頁面列表 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/farmMapData', paramObj);
  },

  /** 解鎖頁面 */
  post: (paramObj: {} | undefined) => {
    return post('/farmMapData', paramObj, true);
  },
};

/** 房間佈置頁面 */
export const farmMapUnitAPI = {
  /** 讀取頁面裝飾物列表 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/farmMapUnit', paramObj);
  },

  /** 移除物品 */
  remove: (paramObj: {} | undefined) => {
    return remove('/farmMapUnit', paramObj);
  },

  /** 解鎖頁面 */
  post: (paramObj: {} | undefined) => {
    return post('/farmMapUnit', paramObj);
  },

  /** 位移物品 */
  put: (paramObj: {} | undefined) => {
    return put('/farmMapUnit', paramObj);
  },
};

/** 房間佈置頁面 */
export const farmMapUnitAllAPI = {
  /** 讀取所有頁面裝飾物列表 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/farmMapUnitAll', paramObj);
  },
};

/** 房間佈置商店 */
export const heroj7StoreAPI = {
  /** 購買佈置道具 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7Store', paramObj, true);
  },

  /** 販賣佈置道具 */
  post: (paramObj: {} | undefined) => {
    return post('/heroj7Store', paramObj, true);
  },
};

/** 房間佈置背包 */
export const getVSPBackpackAPI = {
  /** 取得背包內佈置道具 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/getVSPBackpack', paramObj);
  },
};

/** 取得同班同學英雄列表 */
export const farmMapClassmateAPI = {
  /** 取得同班同學英雄列表 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/farmMapClassmate', paramObj);
  },
};
