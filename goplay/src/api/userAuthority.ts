import { fetch } from '../api/http-server';

/** 取得個人資訊權限 */
export const userAuthorityAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/userAuthority', paramObj);
  },
};
