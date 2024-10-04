import { fetch } from '../api/http-server';

/** 取得縣市內學校列表. (admin才有此權限)*/
export const heroj7GetSchoolList = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7GetSchoolList', paramObj);
  },
};

/** 取得管理者首頁總資訊*/
export const heroj7GetAdminStartData = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7GetAdminStartData', paramObj);
  },
};

/** 取得縣市編號*/
export const heroj7GetCountyId = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7GetCountyId', paramObj);
  },
};
/** 學校登入次數 */
export const heroj7AdminGetLoginCountBySchool = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7AdminGetLoginCountBySchool', paramObj);
  },
};
/** 學校學習時數 */
export const heroj7AdminGetOnlineTimeBySchool  = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7AdminGetOnlineTimeBySchool', paramObj);
  },
};
/** 縣市登入次數 */
export const heroj7AdminGetLoginCountByCounty = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7AdminGetLoginCountByCounty', paramObj);
  },
};
/** 縣市學習時數 */
export const heroj7AdminGetOnlineTimeByCounty  = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7AdminGetOnlineTimeByCounty', paramObj);
  },
};
