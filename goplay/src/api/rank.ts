import { fetch, post } from '../api/http-server';

export const rankApi = {
  // 取得排行榜
  fetch: (paramObj: {} | undefined) => {
    return fetch('/rankContestPlayCount', paramObj);
  },
};
