import { fetch, post, put, remove } from '../api/http-server';

export const adlForumSchoolPostList = {
  // 星際論壇資訊(整個學校)
  fetch: (paramObj: {} | undefined) => {
    return fetch('/adlForumSchoolPostList', paramObj);
  },
};
export const adlForumUserPostList = {
  // 星際論壇資訊(個人提問)
  fetch: (paramObj: {} | undefined) => {
    return fetch('/adlForumUserPostList', paramObj);
  },
};
export const adlForumViewPostInfo = {
  // 取得單一提問資訊
  fetch: (paramObj: {} | undefined) => {
    return fetch('/adlForumViewPostInfo', paramObj);
  },
};
export const adlForumGetQuestion = {
  // 取得題目圖片
  fetch: (paramObj: {} | undefined) => {
    return fetch('/adlForumGetQuestion', paramObj);
  },
};

export const adlForumUserRecord = {
  // 取得用戶資訊
  fetch: (paramObj: {} | undefined) => {
    return fetch('/adlForumUserRecord', paramObj);
  },
};

export const adlForumPostStartComment = {
  // 開始進行論壇答題
  post: (paramObj: {} | undefined) => {
    return post('/adlForumPostStartComment', paramObj, true);
  },
};

export const adlForumPostFinishComment = {
  // 結束論壇答題
  post: (paramObj: {} | undefined) => {
    return post('/adlForumPostFinishComment', paramObj);
  },
};

export const adlForumInputComment = {
  // 輸入正確作答留言
  post: (paramObj: {} | undefined) => {
    return post('/adlForumInputComment', paramObj, true);
  },
};

export const adlForumPostQuest = {
  // 發布貼文
  post: (paramObj: {} | undefined) => {
    return post('/adlForumPostQuest', paramObj, true);
  },
  // 刪除貼文
  remove: (paramObj: {} | undefined) => {
    return remove('/adlForumPostQuest', paramObj, true);
  },
};

export const adlForumGetPostReward = {
  // 發文用戶領獎
  fetch: (paramObj: {} | undefined) => {
    return fetch('/adlForumGetPostReward', paramObj, true);
  },
};
