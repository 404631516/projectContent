import { fetch } from '../api/http-server';

/** 取得'因雄崛起網頁用戶個人資訊 */
export const userInfoAdlEduAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/userInfoAdlEdu', paramObj);
  },
};

/** 取得'個人學習歷程資訊 */
export const contestGameRecordAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/contestGameRecord', paramObj);
  },
};
