import { fetch, post } from '../api/http-server';

// 任務相關api

/** 用戶取得所有自身任務資料
 * 將用戶全部的任務進度&任務狀態返回
 */
export const userTotalTaskAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7QuestUserTotal', paramObj);
  },
};

/** 用戶接取新任務
 * @param questGroupId 任務群組id
 */
export const takeTaskAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/heroj7QuestTake', paramObj, true);
  },
};

/** 用戶領取任務獎勵
 * @param questGroupId 任務群組id
 */
export const reapTaskAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/heroj7QuestReap', paramObj, true);
  },
};

/** 用戶放棄已失敗任務
 * @param questGroupId 任務群組id
 */
export const giveUpTaskAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/heroj7QuestGiveUp', paramObj, true);
  },
};
