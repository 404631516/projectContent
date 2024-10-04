// tslint:disable
// @ts-nocheck
import { TimeHelper } from '../core/time.helper';
import { UserOwnedUniqueUpdateAtEntity } from './base.entity';

/**
 * 玩家資源類別。
 */
export enum UserResourceNumType {
  money = 'money',
  crystal = 'crystal',
  energy = 'energy',
}

/**
 * 玩家資源時間類別。
 * 恢復類型的時間名稱必須跟對應的Num名稱一致
 */
export enum UserResourceTimeType {
  lastGirlUnlockTime = 'lastGirlUnlockTime',
  energy = 'energyRecoverTime',
}

/**
 * 玩家資源回復類型。
 * 恢復類型的名稱必須跟對應的名稱一致
 */
export enum UserResourceRecoverType {
  energy = 'energy',
}

/**
 * 恢復資源資訊
 */
export interface RecoverInfo {
  maxValue: number;
  recoveryTime: number;
  recoveryNum: number;
}

/**
 * 玩家資源類別
 */

export class UserResource extends UserOwnedUniqueUpdateAtEntity {
  /**
   * 現金
   * @type {number}
   */
  money: number = 0;

  /**
   * 鑽石
   * @type {number}
   */
  crystal: number = 0;

  /**
   * 電池
   * @type {number}
   */
  energy: number = 0;

  /**
   * 電池回復時間
   * @type {Date}
   */
  energyRecoverTime: Date = new Date(0);

  /** 電池上限 */
  energyMax: number = 0;

  /** 電池能量恢復時間減少 */
  decreaseEnergyRecoverTime: number = 0;

  /**
   * 取得指定類型的資源值
   * @param {UserResourceNumType} type 資源類型
   * @returns {number} 資源值
   */
  getValue(type: UserResourceNumType): number {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: any = this;
    if (self[type] === undefined) {
      throw new Error(`getValue invalid type: ${type}`);
    }

    if (typeof self[type] !== 'number') {
      throw new Error(`getValue invalid type: ${type} ${typeof self[type]}`);
    }

    return self[type];
  }

  /**
   * 設定指定類型的資源值
   * @param {UserResourceNumType} type 資源類型
   * @param {number} value 資源值
   * @returns {void}
   */
  setValue(type: UserResourceNumType, value: number): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: any = this;
    if (self[type] === undefined) {
      throw new Error(`setValue invalid type: ${type}`);
    }

    if (typeof self[type] !== 'number') {
      throw new Error(`setValue invalid type: ${type}`);
    }

    self[type] = value;
  }

  /**
   * 取得指定類型的資源欄位名稱
   * @param {UserResourceNumType} type 資源類型
   * @returns {string} 資源欄位名稱
   */
  getResourceTypeField(type: UserResourceNumType): string {
    return type.toString();
  }

  /**
   * 取得指定類型的時間值
   * @param {UserResourceTimeType} type 時間類型
   * @returns {Date} 時間值
   */
  getTime(type: UserResourceTimeType): Date {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: any = this;
    if (self[type] === undefined) {
      return undefined;
    }
    if (!(self[type] instanceof Date || self[type] == null)) {
      throw new Error(`getTime invalid type: ${type}`);
    }
    return self[type] as Date;
  }

  /**
   * 設定指定類型的時間值
   * @param {UserResourceTimeType} type 時間類型
   * @param {Date} value 時間值
   * @returns {void}
   */
  setTime(type: UserResourceTimeType, value: Date): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: any = this;
    if (value != null && !(value instanceof Date)) {
      throw new Error(`setTime invalid type: ${type}`);
    }
    self[type] = value;
  }

  /**
   * 檢查指定類型的時間是否已過期
   * @param {UserResourceTimeType} type 時間類型
   * @param {number} seconds 過期時間（秒）
   * @returns {boolean} 是否已過期
   */
  isTimeExpired(type: UserResourceTimeType, seconds: number): boolean {
    const date = this.getTime(type);
    return TimeHelper.isDateExpired(date, seconds);
  }

  /**
   * 取得指定類型的時間欄位名稱
   * @param {UserResourceTimeType} type 時間類型
   * @returns {string} 時間欄位名稱
   */
  getTimeTypeField(type: UserResourceTimeType): string {
    return type.toString();
  }

  /**
   * 獲取可恢復類型。
   * @param {UserResourceNumType} type - 用戶資源數量類型。
   * @returns {UserResourceRecoverType} 如果可恢復，則返回對應的可恢復類型；否則返回 undefined。
   */
  public static getRecoverableType(type: UserResourceNumType): UserResourceRecoverType {
    return UserResourceRecoverType[type];
  }

  /**
   * 取得指定類型的恢復時間類型
   * @param {UserResourceNumType} type 資源類型
   * @returns {UserResourceTimeType} 恢復時間類型
   */
  public static getRecoverTimeType(type: UserResourceNumType): UserResourceTimeType {
    return UserResourceTimeType[type];
  }

  /**
   * 恢復指定的可恢復資源。
   * @param {UserResourceNumType} numType - 要恢復的資源類型。
   * @param {UserResourceTimeType} timeType - 要更新的時間類型。
   * @param {number} recoveryTime - 恢復一個單位所需的時間（以秒為單位）。
   * @param {number} maxValue - 可恢復資源的最大數量。
   * @returns {void}
   */
  public recoverResource(
    numType: UserResourceNumType,
    timeType: UserResourceTimeType,
    recoveryInfo: RecoverInfo
  ): void {
    const currentValue = this.getValue(numType);
    const lastRecoveryDate = this.getTime(timeType);

    const result = TimeHelper.recoverValue({
      currentValue,
      lastRecoveryDate,
      recoveryTime: recoveryInfo.recoveryTime,
      maxValue: recoveryInfo.maxValue,
      recoveryNum: recoveryInfo.recoveryNum,
    });

    this.setValue(numType, result.currentValue);
    this.setTime(timeType, result.lastRecoveryDate);
  }
}
