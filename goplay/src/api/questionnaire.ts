import { get } from 'js-cookie';
import { post, put, remove, fetch } from './http-server';

/** 問卷資料編輯 */
export const formsEditorAPI = {
  // 編輯者創建問卷
  post: (paramObj: {} | undefined) => {
    return post('/formsEditor', paramObj);
  },
  // 編輯者存檔(更新)問卷內容
  put: (paramObj: {} | undefined) => {
    return put('/formsEditor', paramObj);
  },
  // 編輯者取得問卷內容
  fetch: (paramObj: {} | undefined) => {
    return fetch('/formsEditor', paramObj);
  },
  // 編輯者刪除問卷(已經發佈的問卷無法刪除)
  remove: (paramObj: {} | undefined) => {
    return remove('/formsEditor', paramObj);
  },
};

/** 問卷發佈 */
export const formsPublishAPI = {
  // 編輯者發佈問卷
  post: (paramObj: {} | undefined) => {
    return post('/formsEditorPublish', paramObj);
  },
};

/** 問卷題目編輯 */
export const questionEditorAPI = {
  // 編輯者新增問卷題目
  post: (paramObj: {} | undefined) => {
    return post('/formsQuestionEditor', paramObj);
  },
  // 編輯者更新題目內容(儲存)
  put: (paramObj: {} | undefined) => {
    return put('/formsQuestionEditor', paramObj);
  },
  // 編輯者刪除題目問卷題目
  remove: (paramObj: {} | undefined) => {
    return remove('/formsQuestionEditor', paramObj);
  },
};

/**　問卷題目複製 */
export const questionCopyAPI = {
  // 編輯者複製問卷題目
  post: (paramObj: {} | undefined) => {
    return post('/formsQuestionCopy', paramObj);
  },
};

/** 問卷題目開關 */
export const questionCloseAPI = {
  // 編輯者關閉問卷題目
  post: (paramObj: {} | undefined) => {
    return post('/formsQuestionClose', paramObj);
  },
  // 編輯者開啟問卷題目
  put: (paramObj: {} | undefined) => {
    return put('/formsQuestionClose', paramObj);
  },
};

/** 取得問卷說明 */
export const formsReadAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/formsRead', paramObj);
  },
};

/** 取得問卷題目 */
export const formsAnswerAPI = {
  post: (paramObj: {} | undefined) => {
    return post('/formsAnswer', paramObj);
  },

  put: (paramObj: {} | undefined) => {
    return put('/formsAnswer', paramObj, true);
  },
};

/** 回顧問卷 */
export const formsReviewFilledRewardAPI = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/formsReviewFilledReward', paramObj);
  },
};

/** 用戶端問卷 */
export const formsListAPI = {
  // 用戶取得問卷清單
  post: (paramObj: {} | undefined) => {
    return post('/formsList', paramObj);
  },
};

/** 教師端問卷 */
export const formsEditorListAPI = {
  // 編輯者取得問卷清單
  post: (paramObj: {} | undefined) => {
    return post('/formsEditorList', paramObj);
  },
};

/** 下載結果數據 */
export const formsEditorReport = {
  // 編輯者發佈問卷
  fetch: (paramObj: {} | undefined) => {
    return fetch('/formsEditorReport', paramObj);
  },
};
