import { put, fetch, post } from '../api/http-server';

/** 活動設定 */
export const partyEventEditAPI = {
  /** 取得設定 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/partyEventEditHeroj7', paramObj);
  },
  /** 上傳設定 */
  put: (paramObj: {} | undefined) => {
    return put('/partyEventEditHeroj7', paramObj);
  },
};

/** 上傳檔案(Base64) */
export const base64UploadAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/uploadBase64', paramObj);
  },
};
