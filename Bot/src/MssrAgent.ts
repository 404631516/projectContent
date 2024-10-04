import { AxiosInstance } from 'axios';

/** 負責與Mssr弱連網server溝通, 收送http封包 */
export default class MssrAgent {
  /** get.
   * @param router 伺服器服務子路徑, ex:'login'
   * @param params 請求參數.
   * @param enableRetry 當 '請求逾時|連線異常' 是否重試(預設啟用).
   * @returns null 表示請求錯誤, 成功會返回Mssr伺服器回應值.
   */
  public static async get(axiosInstance: AxiosInstance, router: string, params: Map<string, any>): Promise<any> {
    const response = await axiosInstance.get(router, { params: this.stringifyParams(params) });

    if (response.data.result === 'success') {
      return response;
    } else {
      console.error(
        `MssrAgent.get() error, result not success! resMessage: ${response.data.resMessage}, result: ${response.data.result}, router: ${router}, params: ${params}`
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
  public static async post(axiosInstance: AxiosInstance, router: string, params: Map<string, any>): Promise<any> {
    const response = await axiosInstance.post(router, this.stringifyParams(params));

    if (response.data.result === 'success') {
      return response;
    } else {
      console.error(
        `MssrAgent.post() error, result not success! resMessage: ${response.data.resMessage}, result: ${response.data.result}, router: ${router}, params: ${params}`
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
  public static async put(axiosInstance: AxiosInstance, router: string, params: Map<string, any>): Promise<any> {
    const response = await axiosInstance.put(router, this.stringifyParams(params));

    if (response.data.result === 'success') {
      return response;
    } else {
      console.error(
        `MssrAgent.put() error, result not success! resMessage: ${response.data.resMessage}, result: ${response.data.result}, router: ${router}, params: ${params}`
      );
      return undefined;
    }
  }

  /** 把封包轉成object格式, 非 'number & string' 的 Param資料轉成json.
   * @param params http請求的參數資料.
   */
  private static stringifyParams(params: Map<string, any> = new Map<string, any>()): object {
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
}
