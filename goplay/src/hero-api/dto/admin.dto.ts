import { User } from '../entity/user.entity';
import { PagedResultDto } from './core.dto';
import { UserResource, UserResourceNumType } from '../entity/user-resource.entity';
import { ApiResOkBaseDto } from './api.dto';
import { LogAdminOperation, LogUserResource } from '../entity/log.entity';

/**
 * 更改密碼的資料傳輸物件。
 */
export class ChangePasswordDto {
  /**
   * 帳號。
   */
  account: string;

  /**
   * 密碼。
   */
  password: string;
}

/**
 * 使用者列表結果的資料傳輸物件。
 */
export class UserPagedResultDto extends PagedResultDto<User> {
  /**
   * 使用者列表。
   */
  declare entities: User[];
}

/**
 * 管理員操作紀錄列表結果的資料傳輸物件。
 */
export class LogAdminOperationPagedResultDto extends PagedResultDto<LogAdminOperation> {
  /** Log列表 */
  declare entities: LogAdminOperation[];
}

/**
 * UserResource紀錄列表結果的資料傳輸物件。
 */
export class LogUserResourcePagedResultDto extends PagedResultDto<LogUserResource> {
  /** Log列表 */
  declare entities: LogUserResource[];
}

/**
 * 使用者資源列表結果的資料傳輸物件。
 */
export class UserResourcePagedResultDto extends PagedResultDto<UserResource> {
  declare entities: UserResource[];
}

/**
 * 管理員使用者資源操作類型。
 */
export enum AdminUserResourceOperation {
  /** 添加資源。 */
  Add = 'add',
  /** 減少資源。 */
  Subtract = 'subtract',
  /** 設置資源。 */
  Set = 'set',
}

/**
 * 管理員使用者資源 DTO。
 */
export class AdminUserResourceDto {
  /** 操作類型。 */
  operation: AdminUserResourceOperation;

  /** 使用者 ID。 */
  uid: number;

  /** 資源類型。 */
  type: UserResourceNumType;

  /** 資源值。 */
  value: number;
}

/**
 * 管理員使用者資源結果 DTO。
 */
export class AdminUserResourceResultDto extends ApiResOkBaseDto {
  /**
   * 建構子。
   * @param userResource 使用者資源。
   */
  constructor(userResource: UserResource) {
    super();
    this.userResource = userResource;
  }

  /** 使用者資源。 */
  userResource: UserResource;
}
