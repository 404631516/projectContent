import axios from 'axios';
import Config from '@/config/setting';
import { Message, Load } from '@/helper/class/Common';
import i18n from '@/lang/i18n_ts';
import { ResponseState, ResponseTokenState } from '@/helper/enum/Common';
import router from '@/router';
import { I18n } from '@/helper/interface/Common';
import { syncTime, syncDayjs } from '@/manager/TimeSyncManager';
import md5 from 'md5-ts';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { handleV2APIError } from '@/helper/fnc/common';

const i18nData: I18n = JSON.parse(JSON.stringify(i18n.messages[`${Config.lang}`]));
const baseUrl = Config.HttpPath;

/** 封包發送次數紀錄 */
const requestQueue: Map<string, number> = new Map<string, number>();
/** 封包發送上限 */
const requestMax: number = 5;

/** ETS格式 */
type EtsDataType = Array<string | number>;
/** ETS資料 */
let etsData: EtsDataType | undefined;

// process.env.API_ROOT
axios.defaults.timeout = 100000;
axios.defaults.baseURL = baseUrl; // 域名

// http request 欄截(若有任務router，檢查條件符合的任務並夾帶)
axios.interceptors.request.use(
  async (config) => {
    // 檢查與Url相關且條件符合的因雄宇宙任務
    const relatedRunningTaskIdList: number[] = await router.app.$$store.dispatch(
      'getUrlRelatedRunningTaskIdList',
      `${config.url ?? ''}-${config.method ?? ''}`,
    );
    // 檢查與Url相關且條件符合的學習任務
    const relatedRunningStudyTaskIdList: number[] = await router.app.$$store.dispatch(
      'getUrlRelatedRunningStudyTaskIdList',
      config,
    );

    // 夾帶相關因雄宇宙任務到Header
    if (relatedRunningTaskIdList.length > 0) {
      config.headers['hero-universe-running-task-uid-list'] = JSON.stringify(relatedRunningTaskIdList);
    }
    // 夾帶相關學習任務到Header
    if (relatedRunningStudyTaskIdList.length > 0) {
      config.headers['study-running-task-uid-list'] = JSON.stringify(relatedRunningStudyTaskIdList);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// http request 欄截(設定headers及token，並判斷是否發送過多封包)
axios.interceptors.request.use(
  async (config) => {
    // 設定data
    config.data = JSON.stringify(config.data);

    // 設定headers
    config.headers = {
      'Content-Type': `application/json`,
      'Access-Control-Allow-Origin': baseUrl,
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': true,
    };

    // 設定使用者uid
    config.headers.uid = router.app.$$store.getters.userUid;

    // 判斷 set-cookies 後端是否有帶
    config.withCredentials = Config.isWithCredentials;
    if (config.withCredentials === false) {
      config.headers.token = router.app.$$store.getters.userToken;
    }

    // 防止短時間發送大量封包
    // 組成封包Key
    const requestKey = md5(`${config.url}:${config.method}:${config.data}:${JSON.stringify(config.params)}`);

    // 取得已發送次數
    const requestCount = requestQueue.get(requestKey);

    // 第一次發送
    if (requestCount === undefined) {
      requestQueue.set(requestKey, 1);
    }
    // 超過發送上限
    else if (requestCount >= requestMax) {
      // 等到可發送
      await AsyncHelper.pendingUntil(() => {
        return (requestQueue.get(requestKey) ?? 0) < requestMax;
      });

      // 累加發送次數
      requestQueue.set(requestKey, (requestQueue.get(requestKey) ?? 0) + 1);

      // 延遲再發 (防止跟server來回太快, 一樣造成短時間內發送大量封包)
      await AsyncHelper.sleep(1);
    }
    // 正常發送
    else {
      // 累加發送次數
      requestQueue.set(requestKey, (requestQueue.get(requestKey) ?? 0) + 1);
    }

    // 設定封包Key
    config.headers.requestKey = requestKey;

    // 設定etsid
    if (etsData !== undefined) {
      const etsid = syncDayjs().unix();
      config.headers.etsid = etsid;
      config.headers.phpsessionid = md5(`${etsid}:${router.app.$$store.getters.userToken}:${etsData}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 異常處理
axios.interceptors.response.use(
  (response) => {
    // 同步時間
    if (response.headers.servertime != null) {
      syncTime(response.headers.servertime);
    }

    // 取得封包Key
    const requestKey = response.config.headers.requestKey;
    // 扣除發送次數
    const requestCount = requestQueue.get(requestKey);
    if (requestCount !== undefined) {
      requestQueue.set(requestKey, Math.max(0, requestCount - 1));
    }

    // 判斷回傳狀態
    const dataStr = JSON.parse(response.request.response);
    switch (dataStr.result) {
      // Success 回傳狀態
      case ResponseState.Success:
        break;
      // InvalidateToken 回傳狀態
      case ResponseState.InvalidateToken:
        // 移除使用者資訊
        router.app.$$store.dispatch('onLogout');
        // Token ErroCode
        switch (dataStr.resMessage) {
          case ResponseTokenState.TokenExpired:
            Message.error('憑證過期');
            break;
          case ResponseTokenState.TokenDecodedFail:
            Message.error('憑證剖析失敗');
            break;
          case ResponseTokenState.TokenUserLoggedIn:
            Message.error('憑證用戶重複登入');
            break;
          case ResponseTokenState.TokenUserNotExist:
            Message.error('憑證用戶資料不存在');
            break;
          case ResponseTokenState.TokenMissing:
            Message.error('找不到憑證可以核對');
            break;
          default:
            break;
        }
        break;
      // Cookie錯誤
      case ResponseState.CookiePermissionDenied:
        // 移除使用者資訊
        router.app.$$store.dispatch('onLogout');
        Message.error('重複帳號錯誤');
        break;
    }
    return response;
  },
  (err) => {
    if (err && err.response) {
      switch (err.response.status) {
        case 404:
          Message.error(i18nData.errorMsg.noPage);
          break;
        case 500:
          Message.error(i18nData.errorMsg.serveError);
          break;
        case 503:
          Message.error(i18nData.errorMsg.serveFail);
          break;
        default:
          Message.error(`${i18nData.errorMsg.connectError}${err.response.status}`);
          break;
      }
    }
    // 伺服器斷線
    else {
      // 移除使用者資訊
      router.app.$$store.dispatch('onLogout');
      Message.error(i18nData.errorMsg.connectFail);
    }
    return Promise.resolve(err.response);
  },
);

export function fetch(url: string, params = {}, isSingle: boolean = false, newEtsData?: EtsDataType) {
  etsData = newEtsData;

  // 開啟操作阻擋
  if (isSingle) {
    Load.use(true);
  }

  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then(
        (response) => {
          resolve(response.data);
        },
        (err) => {
          reject(err);
        },
      )
      .finally(() => {
        Load.use(false);
      });
  });
}

export function post(url: string, data = {}, isSingle: boolean = false, newEtsData?: EtsDataType) {
  etsData = newEtsData;

  // 開啟操作阻擋
  if (isSingle) {
    Load.use(true);
  }

  return new Promise((resolve, reject) => {
    axios
      .post(url, data)
      .then(
        (response) => {
          resolve(response.data);
        },
        (err) => {
          reject(err);
        },
      )
      .finally(() => {
        Load.use(false);
      });
  });
}

export function remove(url: string, options = {}, isSingle: boolean = false, newEtsData?: EtsDataType) {
  etsData = newEtsData;

  // 開啟操作阻擋
  if (isSingle) {
    Load.use(true);
  }

  return new Promise((resolve, reject) => {
    axios
      .delete(url, { params: options })
      .then(
        (response) => {
          resolve(response.data);
        },
        (err) => {
          reject(err);
        },
      )
      .finally(() => {
        Load.use(false);
      });
  });
}

export function put(url: string, data = {}, isSingle: boolean = false, newEtsData?: EtsDataType) {
  etsData = newEtsData;

  // 開啟操作阻擋
  if (isSingle) {
    Load.use(true);
  }

  return new Promise((resolve, reject) => {
    axios
      .put(url, data)
      .then(
        (response) => {
          resolve(response.data);
        },
        (err) => {
          reject(err);
        },
      )
      .finally(() => {
        Load.use(false);
      });
  });
}

/**
 * fetch v2 api 在發送後會自動判斷是否成功並處理錯誤訊息
 * @param url - API路徑
 * @param params - 參數
 * @param targetObject - 目標物件
 * @param isSingle - 是否為單一操作
 * @param newEtsData - ETS資料
 * @returns 回傳結果
 */
export async function fetchV2<T>(
  url: string,
  params = {},
  targetObject: T,
  isSingle: boolean = false,
  newEtsData?: EtsDataType,
) {
  const response: any = await fetch(url, params, isSingle, newEtsData);
  if (response.result !== ResponseState.Success) {
    // 處理錯誤訊息
    handleV2APIError(response.result, response.message);
  }
  return deepAssignObjects<T>(targetObject, response);
}

/**
 * post v2 api 在發送後會自動判斷是否成功並處理錯誤訊息
 * @param url - API路徑
 * @param params - 參數
 * @param targetObject - 目標物件
 * @param isSingle - 是否為單一操作
 * @param newEtsData - ETS資料
 * @returns 回傳結果
 */
export async function postV2<T>(
  url: string,
  params = {},
  targetObject: T,
  isSingle: boolean = false,
  newEtsData?: EtsDataType,
) {
  const response: any = await post(url, params, isSingle, newEtsData);
  if (response.result !== ResponseState.Success) {
    // 處理錯誤訊息
    handleV2APIError(response.result, response.message);
  }
  return deepAssignObjects<T>(targetObject, response);
}

/**
 * remove v2 api 在發送後會自動判斷是否成功並處理錯誤訊息
 * @param url - API路徑
 * @param params - 參數
 * @param targetObject - 目標物件
 * @param isSingle - 是否為單一操作
 * @param newEtsData - ETS資料
 * @returns 回傳結果
 */
export async function removeV2<T>(
  url: string,
  params = {},
  targetObject: T,
  isSingle: boolean = false,
  newEtsData?: EtsDataType,
) {
  const response: any = await remove(url, params, isSingle, newEtsData);
  if (response.result !== ResponseState.Success) {
    // 處理錯誤訊息
    handleV2APIError(response.result, response.message);
  }
  return deepAssignObjects<T>(targetObject, response);
}

/**
 * put v2 api 在發送後會自動判斷是否成功並處理錯誤訊息
 * @param url - API路徑
 * @param params - 參數
 * @param targetObject - 目標物件
 * @param isSingle - 是否為單一操作
 * @param newEtsData - ETS資料
 * @returns 回傳結果
 */
export async function putV2<T>(
  url: string,
  params = {},
  targetObject: T,
  isSingle: boolean = false,
  newEtsData?: EtsDataType,
) {
  const response: any = await put(url, params, isSingle, newEtsData);
  if (response.result !== ResponseState.Success) {
    // 處理錯誤訊息
    handleV2APIError(response.result, response.message);
  }
  return deepAssignObjects<T>(targetObject, response);
}

/**
 * 將任意物件轉換為指定類型的物件。
 * @template T - 目標物件的類型。
 * @param {T} targetObject - 目標物件。
 * @param {any} sourceObject - 任意物件。
 * @returns {T} 轉換後的目標物件。
 */
function deepAssignObjects<T>(targetObject: any, sourceObject: any): T {
  Object.keys(sourceObject).forEach((key: string) => {
    if (typeof sourceObject[key] === 'string' && targetObject[key] instanceof Date) {
      targetObject[key] = new Date(sourceObject[key]);
    } else if (typeof sourceObject[key] === 'object' && targetObject[key] instanceof Object) {
      deepAssignObjects(targetObject[key], sourceObject[key]);
    } else {
      targetObject[key] = sourceObject[key];
    }
  });
  return targetObject;
}
