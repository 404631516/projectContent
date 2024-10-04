import { fetch, put } from '../api/http-server';

/** 信箱系統資訊 */
export const mailNotificationAPI = {
  // 是否有新信件
  fetch: (paramObj: {} | undefined) => {
    return fetch('/mailNotification', paramObj);
  },
};

/** 撈取所有信件 */
export const mailInBoxAPI = {
  // 撈取所有信件
  fetch: (paramObj: {} | undefined) => {
    return fetch('/mailInbox', paramObj);
  },
};

/** 讀取信件 */
export const mailReadAPI = {
  // 讀取信件內文
  fetch: (paramObj: {} | undefined) => {
    return fetch('/mailRead', paramObj);
  },
};

/** 領取獎勵 */
export const mailGetItemAPI = {
  // 領取獎勵
  put: (paramObj: {} | undefined) => {
    return put('/mailGetItem', paramObj, true);
  },
};

/** 撈取所有未領取獎勵的信件 */
export const mailPackageIdListAPI = {
  // 撈取所有未領取獎勵的信件
  fetch: (paramObj: {} | undefined) => {
    return fetch('/mailPackageIdList', paramObj);
  },
};

/** 刪除信件 */
export const mailDelAPI = {
  // 刪除信件
  put: (paramObj: {} | undefined) => {
    return put('/mailDel', paramObj, true);
  },
};
