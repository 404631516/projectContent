import { fetch } from '../api/http-server';

/** 取得排行榜和學習成果 */
export const homeRangeInfoAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/webLobbyPage', paramObj);
  },
};
