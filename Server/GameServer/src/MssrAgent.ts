import axios, { AxiosInstance } from 'axios';
import { CreateContestRoomGameResponse } from './NetProtocol/CommonStructure';
import mssrConfigJson from '../mssrConfig.json';

/** 負責與Mssr弱連網server溝通, 收送http封包 */
export default class MssrAgent {
  private static axios: AxiosInstance = axios.create({
    baseURL: mssrConfigJson.url,
    headers: {
      'Content-Type': 'application/json',
      token: mssrConfigJson.token,
    },
  });

  /** 開局
   * @param contestId 賽事Id
   * @param contestRoomId token內提供的房間Id
   * @returns 包含成功與否 & gameLog verifyCode的回傳格式
   */
  public static async createGame(contestRoomId: number, contestId: number): Promise<CreateContestRoomGameResponse> {
    // 通知mssr開局
    const params = new Map<string, any>();
    params.set('contestRoomId', contestRoomId);
    params.set('contestId', contestId);
    // 送http封包給mssr server
    const response = await this.post('/contestRoomGame', params);
    // 防呆
    if (response === undefined) {
      console.error(`MssrAgent.createGame() error, response is undefined! gameRoomId = ${contestRoomId}`);
      return {
        isSuccess: false,
        verifyCode: '',
      };
    }
    // 回傳
    return {
      isSuccess: true,
      verifyCode: response.data.verifyCode,
    };
  }

  //#region Http-Request-Methods
  /** get.
   * @param router 伺服器服務子路徑, ex:'login'
   * @param params 請求參數.
   * @param enableRetry 當 '請求逾時|連線異常' 是否重試(預設啟用).
   * @returns null 表示請求錯誤, 成功會返回Mssr伺服器回應值.
   */
  public static async get(router: string, params: Map<string, any> = new Map<string, any>()): Promise<any> {
    const response = await this.axios.get(router, { params: this.stringifyParams(params) });

    if (response.data.result === 'success') {
      return response;
    } else {
      console.error(
        `MssrAgent.get() error, result not success! result: ${response.data.result}, router: ${router}, params: ${params}`
      );
      return undefined;
    }
  }

  /** post.
   * @param router 伺服器服務子路徑, ex:'login'
   * @param params 請求參數.
   * @param enableRetry 當 '請求逾時|連線異常' 是否重試(預設啟用).
   * @param errorMsg 客製化錯誤訊息
   * @returns null 表示請求錯誤, 成功會返回Mssr伺服器回應值.
   */
  public static async post(router: string, params: Map<string, any> = new Map<string, any>()): Promise<any> {
    const response = await this.axios.post(router, this.stringifyParams(params));

    if (response.data.result === 'success') {
      return response;
    } else {
      console.error(
        `MssrAgent.post() error, result not success! result: ${response.data.result}, router: ${router}, params: ${params}`
      );
      return undefined;
    }
  }

  /** put.
   * @param router 伺服器服務子路徑, ex:'login'
   * @param params 請求參數.
   * @param enableRetry 當 '請求逾時|連線異常' 是否重試(預設啟用).
   * @param errorMsg 客製化錯誤訊息
   * @returns null 表示請求錯誤, 成功會返回Mssr伺服器回應值.
   */
  public static async put(router: string, params: Map<string, any> = new Map<string, any>()): Promise<any> {
    const response = await this.axios.put(router, this.stringifyParams(params));

    if (response.data.result === 'success') {
      return response;
    } else {
      console.error(
        `MssrAgent.put() error, result not success! result: ${response.data.result}, router: ${router}, params: ${params}`
      );
      return undefined;
    }
  }

  /** 把封包轉成object格式, 非 'number & string' 的 Param資料轉成json.
   * @param params http請求的參數資料.
   */
  private static stringifyParams(params: Map<string, any>): object {
    // 將特殊型別的value轉成string
    params.forEach((value) => {
      if (typeof value !== 'number' && typeof value !== 'string') {
        value = JSON.stringify(value);
      }
    });
    // 轉成object
    const result: Record<string, any> = {};
    params.forEach((value, key) => {
      result[key] = value as string;
    });
    return result;
  }
  //#endregion
}

//#region 結算相關格式
/** 結束遊戲, 傳給server紀錄玩家成績(gamePlayerLog). 欄位名字不可改, 會影響router成績上傳 */
export interface PlayerScore {
  /** cid */
  playerId: number;
  /** 總分 */
  score: number;
  /** 使用平台, Unity enum RuntimePlatform */
  platform: number;
  /** 遊戲結束後有沒有剩血量 */
  isSurvivor: boolean;
  /** 所選英雄hid */
  hid: number;
  /** 隊伍編號 */
  teamId: number;
  /** key: 第幾題, value: 該題詳細資料 */
  quizAnswer: { [k: string]: PlayerAnswerLog };
}

/** gamePlayerLog裡一題的紀錄 */
export interface PlayerAnswerLog {
  /** 題目 */
  qid: string;
  /** 答題選項 */
  answer: number;
  /** 剩餘時間 */
  answerTime: number;
  /** 答題所花秒數, 即(題目秒數-剩餘時間) */
  usedTime: number;
  /** Unix時間, 本回合結束時間點(20XX年X月X日X時X分X秒) */
  unixTime: number;
  // /** 本題所得分數 */
  // score: number;
}
//#endregion
