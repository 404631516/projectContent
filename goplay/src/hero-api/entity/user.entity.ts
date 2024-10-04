import { UserOwnedUniqueUpdateAtEntity } from './base.entity';

export enum UserRole {
  /** 管理者 */
  Admin = 0,
  /** 學生 */
  Student = 1,
  /** 家長 */
  Parents = 2,
  /** 教師 */
  Teacher = 3,
  /** 校長 */
  Principal = 4,
  /** 代理商 */
  Agent = 5,
  /** 縣市管理員 */
  Mayor = 6,
}

export class User extends UserOwnedUniqueUpdateAtEntity {
  account: string;

  role: UserRole;

  username: string;

  password: string;

  avatarId: number;

  nickname: string;
}

/**
 * UserSession 實體。目前只存在於 Redis 中。可以用來存放使用者的登入狀態,或是其他需要快取的資料。
 */

export class UserSession {
  /**擁有者UID */
  uid: number;

  accessToken?: string;
}
