// tslint:disable
// @ts-nocheck
export enum ApiResult {
  Success = 'success',
  Error = 'error',
}

/**
 * 代表一個包含結果字串的回應物件。
 */
export class ApiResDto {
  /**
   * 結果字串。
   * @example 'success'
   */
  public result: string;
  /**
   * 錯誤訊息。
   * @example '如果結果不是 success，這是錯誤訊息'
   */
  public message?: string;
  /**
   * 建立 `ApiRes` 的新實例。
   * @param result - 結果字串。
   */
  constructor(result: string) {
    this.result = result;
  }
}

/**
 * 代表一個包含結果物件的成功回應物件。
 */
export class ApiResOkDto extends ApiResDto {
  /**
   * 建立 `ApiResOk` 的新實例。
   * @param result - 結果物件。
   */
  constructor(result: object) {
    super('success');
    if (result) Object.assign(this, result);
  }
}

/**
 * 代表一個不包含結果的成功回應物件。
 */
export class ApiResOkBaseDto extends ApiResDto {
  /**
   * 建立 `ApiResOkBase` 的新實例。
   */
  constructor() {
    super('success');
  }
}

/**
 * 代表一個 API 錯誤。
 */
export class ApiErrorDto extends ApiResDto {
  /**
   * 建立 `ApiError` 的新實例。
   * @param result - 結果字串。
   * @param message - 錯誤訊息。
   */
  constructor(result: string, message: string) {
    super(result);
    this.message = message;
  }
}

/**
 * 代表一個包含錯誤訊息的錯誤回應物件。
 */
export class ApiResErrorDto extends ApiErrorDto {
  /**
   * 建立 `ApiResError` 的新實例。
   * @param message - 錯誤訊息。
   */
  constructor(public message: string) {
    super('error', message);
  }
}
