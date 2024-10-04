import { UserResource, UserResourceNumType } from '../entity/user-resource.entity';
import { ApiResOkBaseDto } from './api.dto';

/**
 * 用戶資源數量 DTO。
 */
export class UserResourceDto {
  /**
   * 資源類型。
   * @type {UserResourceNumType}
   */
  type: UserResourceNumType;

  /**
   * 資源數量。
   * @type {number}
   */
  value: number;
}

/**
 * 用戶資源 DTO。
 */
export class UserResourcesDto {
  constructor(options?: { money?: number; crystal?: number; energy?: number }) {
    this.money = options?.money ?? 0;
    this.crystal = options?.crystal ?? 0;
    this.energy = options?.energy ?? 0;
  }

  /**
   * 金幣數量。
   * @type {number}
   */
  money: number;

  /**
   * 鑽石數量。
   * @type {number}
   */
  crystal: number;

  /**
   * 電池數量。
   * @type {number}
   */
  energy: number;

  /**
   * 檢查是否有任何資源。
   * @returns {boolean} 如果有任何資源，則返回 true；否則返回 false。
   */
  anyValue(): boolean {
    return this.money > 0 || this.crystal > 0 || this.energy > 0;
  }

  /**
   * 設置指定資源的數量。
   * @param {UserResourceNumType} type - 資源類型。
   * @param {number} value - 資源數量。
   * @returns {void}
   */
  setValue(type: UserResourceNumType, value: number): void {
    switch (type) {
      case UserResourceNumType.money:
        this.money = value;
        break;
      case UserResourceNumType.crystal:
        this.crystal = value;
        break;
      case UserResourceNumType.energy:
        this.energy = value;
    }
  }

  /**
   * 獲取指定資源的數量。
   * @param {UserResourceNumType} type - 資源類型。
   * @returns {number} 資源數量。
   */
  getValue(type: UserResourceNumType): number {
    switch (type) {
      case UserResourceNumType.money:
        return this.money;
      case UserResourceNumType.crystal:
        return this.crystal;
      case UserResourceNumType.energy:
        return this.energy;
    }
  }
}

/**
 * 用戶資源結果 DTO。
 */
export class UserResourceResultDto extends ApiResOkBaseDto {
  /**
   * 用戶資源。
   * @type {UserResource}
   */
  public userResource: UserResource;

  /**
   * 創建一個新的用戶資源結果 DTO。
   * @param {UserResource} userResource - 用戶資源。
   */
  constructor(userResource: UserResource) {
    super();
    this.userResource = userResource;
  }
}

/**
 * 資源數量 DTO。
 */
export class ResourceCountDto {
  /** 資源類型。 */
  type: UserResourceNumType;

  /** 資源值。 */
  value: number;
}
