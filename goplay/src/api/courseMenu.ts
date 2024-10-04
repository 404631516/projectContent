import { fetch } from '../api/http-server';

/** 取得科目群組編號 */
export const subjectUnitMenuOptionsAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/subjectUnitMenuOptions', paramObj);
  },
};

/** 取得科目群組編號  */
export const subjectUnitGameLinkListAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/subjectUnitGameLinkList', paramObj);
  },
};

/** 取得 "學習點賽事" 對應的 "遊戲點課程連結" */
export const subjectUnitLearningLinkAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/subjectUnitLearningLink', paramObj);
  },
};

/** 取得 gameLinkId 對應的因材網學習點資料 */
export const gameLinkInfoAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/gameLinkInfo', paramObj);
  },
};
