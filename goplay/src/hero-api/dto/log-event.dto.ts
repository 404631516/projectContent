// tslint:disable
// @ts-nocheck
import { LogUserResourceOptions } from '../entity/log.entity';
import { UserResourceTimeType, UserResourceNumType, UserResource } from '../entity/user-resource.entity';
import { UserEvent } from './event.dto';

/**
 * 表示日誌事件的唯一識別碼。
 */
export enum LogEventId {
  /** 使用者資源增加事件。 */
  UserResourceIncrease = 'UserResourceIncrease',
  /** 使用者資源減少事件。 */
  UserResourceDecrease = 'UserResourceDecrease',
  /** 使用者資源時間更新事件。 */
  UserResourceTimeUpdate = 'UserResourceTimeUpdate',
  /** Custom UserResourceEvent */
  CustomUserResourceEvent = 'CustomUserResourceEvent',
}

/**
 * 表示取得資源的方式。
 */

export enum EventResourceLogType {
  /** 單元測試 */
  UnitTest = 'UnitTest',
  /** 管理員增加 */
  Admin = 'Admin',
  /** 初始值。 */
  Initial = 'Initial',
  /** Unlock Hero。 */
  UnlockHero = 'UnlockHero',
}

/**
 * 表示使用者資源事件。
 */
export interface UserResourceEvent extends UserEvent {
  /** 資源類型。 */
  resourceType: UserResourceNumType;
  /** 事件類型。 */
  logType: EventResourceLogType;
  /** 更新後的資源值。 */
  updatedValue: number;
  /** 變更的資源量。 */
  changeAmount: number;
  /** 綁定的dataId */
  dataId: number;
}

/**
 * 表示使用者資源減少事件。
 */
export interface UserResourceDecreaseEvent extends UserResourceEvent {}

/**
 * 表示使用者資源增加事件。
 */
export interface UserResourceIncreaseEvent extends UserResourceEvent {}

/**
 * 表示使用者資源時間更新事件。
 */
export interface UserResourceTimeUpdateEvent extends UserEvent {
  resourceType: UserResourceTimeType;
  value: Date;
  logType: EventResourceLogType;
  dataId: number;
}

/**
 * 表示Custom使用者資源事件。
 */
export interface CustomUserResourceEvent extends LogUserResourceOptions {
  uid: number;
}
