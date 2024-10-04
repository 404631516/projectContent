// tslint:disable
// @ts-nocheck
/**
 * 代表一個可恢復的值，該值可以隨時間增加。
 * @interface
 */
export interface RecoverableValue {
  /**
   * 目前的可恢復值數量。
   * @type {number}
   */
  currentValue: number;

  /**
   * 上次恢復時間的時間戳記。
   * @type {Date}
   */
  lastRecoveryDate: Date;

  /**
   * 恢復一個單位所需的時間（以秒為單位）。
   * @type {number}
   */
  recoveryTime: number;

  /**
   * 每次恢復的單位數量。
   * @type {number}
   */
  recoveryNum: number;

  /**
   * 可恢復值的最大數量。
   * @type {number}
   */
  maxValue: number;
}

/**
 * 工具類別。
 */
export class TimeHelper {
  /** 一分鐘的秒數。 */
  public static oneMinute = 60;
  /** 一小時的秒數。 */
  public static oneHours = TimeHelper.oneMinute * 60;
  /** 一天的秒數。 */
  public static oneDay = 24 * TimeHelper.oneHours;

  /** 時間偏移量。 */
  private static bias = 0.0;

  /** 每秒的毫秒數。 */
  public static millisecondPerSecond: number = 1000;

  /**
   * 取得現在時間。
   * @returns {Date} 現在時間。
   */
  public static getNow(): Date {
    return new Date(Date.now() + TimeHelper.bias);
  }

  /**
   * 判斷兩個時間是否相同。
   * @param {Date} date1 - 第一個時間。
   * @param {Date} date2 - 第二個時間。
   * @param {number} maxTimeDifference - 允許的最大時間差（毫秒）。
   * @returns {boolean} 如果兩個時間相同，則返回 true；否則返回 false。
   */
  public static isSameTime(date1: Date, date2: Date, maxTimeDifference: number = 1000): boolean {
    if (!date1 || !date2) {
      return false;
    }
    const timeDifference = Math.abs(date1.getTime() - date2.getTime());
    return timeDifference <= maxTimeDifference;
  }

  /**
   * 判斷指定的時間是否為空。
   * @param {Date} date - 指定的時間。
   * @returns {boolean} 如果指定的時間為空，則返回 true；否則返回 false。
   */
  public static isEmptyDate(date: Date): boolean {
    return date == undefined || date.getTime() == 0;
  }

  /**
   * 設定現在時間。
   * @param {Date} date 現在時間。
   */
  public static setNow(date: Date): void {
    TimeHelper.bias = date.getTime() - Date.now();
  }

  /**
   * 判斷日期加上指定時間是否過期(現在時間超過加成後時間)。
   * @param date 日期。
   * @param seconds 過期秒數。
   * @returns 是否過期。
   */
  public static isDateExpired(date: Date, seconds: number): boolean {
    if (!date) {
      return true;
    }

    const now = TimeHelper.getNow();
    const expireDate = new Date(date.getTime() + seconds * 1000);
    return now >= expireDate;
  }

  /**
   * 取得空日期。
   * @returns {Date} 空日期。
   */
  public static getEmptyDate(): Date {
    return new Date(0);
  }

  /**
   * 在指定日期上增加秒數。
   * @param {Date} date 指定日期。
   * @param {number} seconds 增加的秒數。
   * @returns {Date} 增加秒數後的日期。
   */
  public static addSecondsToDate(date: Date, seconds: number): Date {
    if (date == undefined) {
      return TimeHelper.getEmptyDate();
    }
    return new Date(date.getTime() + seconds * 1000);
  }

  /**
   * 計算可恢復數值。
   * @param {RecoverableValue} recoverValue - 可恢復值。
   * @returns {number} 可恢復數量。
   */
  public static getRecoveryCount(recoverValue: RecoverableValue): number {
    const now = TimeHelper.getNow();
    const lastRecoverDate = recoverValue.lastRecoveryDate;
    const recoveryTime = recoverValue.recoveryTime;
    const diff = now.getTime() - lastRecoverDate.getTime();
    const recoverCount = Math.floor(diff / (recoveryTime * 1000));
    return recoverCount > 0 ? recoverCount : 0;
  }

  /**
   * 取得下一次恢復時間。
   * @param {RecoverableValue} recoverValue - 可恢復值。
   * @returns {Date} 下一次恢復時間。
   */
  public static nextRecoverTime(recoverValue: RecoverableValue): Date {
    const recoverCount = TimeHelper.getRecoveryCount(recoverValue);
    // 目前就可以恢復
    if (recoverCount > 0 && recoverValue.currentValue < recoverValue.maxValue) {
      return TimeHelper.getNow();
    }
    const lastRecoverDate = recoverValue.lastRecoveryDate;
    const recoveryTime = recoverValue.recoveryTime;

    // 計算下一次恢復時間
    const nextRecoverTime = new Date(lastRecoverDate.getTime() + recoveryTime * 1000);
    return nextRecoverTime;
  }

  /**
   * 根據當前時間和上次恢復時間來恢復可恢復值。
   * @param {RecoverableValue} recoverValue - 要恢復的可恢復值。
   * @returns {RecoverableValue} 更新後的可恢復值。
   */
  public static recoverValue(recoverValue: RecoverableValue): RecoverableValue {
    const now = TimeHelper.getNow();

    const lastRecoverDate = recoverValue.lastRecoveryDate;
    const recoveryTime = recoverValue.recoveryTime;
    const maxValue = recoverValue.maxValue;
    const currentValue = recoverValue.currentValue;
    const recoveryNum = recoverValue.recoveryNum;

    // 如果上次恢復時間為空，則直接返回最大值。
    if (lastRecoverDate == undefined || lastRecoverDate.getTime() == 0) {
      return {
        currentValue: maxValue,
        lastRecoveryDate: now,
        recoveryTime,
        maxValue: maxValue,
        recoveryNum: recoveryNum,
      };
    }

    const diff = now.getTime() - lastRecoverDate.getTime();
    // 計算恢復次數
    const recoveryCount = Math.floor(diff / (recoveryTime * 1000));

    // 目前已經超過最大,返回目前值
    const newValue =
      currentValue > maxValue ? currentValue : Math.min(currentValue + recoveryCount * recoveryNum, maxValue);

    const newLastRecoverDate = new Date(lastRecoverDate.getTime() + recoveryCount * recoveryTime * 1000);

    return {
      currentValue: newValue,
      lastRecoveryDate: newLastRecoverDate,
      recoveryTime: recoveryTime,
      maxValue: maxValue,
      recoveryNum: recoveryNum,
    };
  }
}
