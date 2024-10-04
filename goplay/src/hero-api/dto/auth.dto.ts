import { ApiResOkBaseDto } from './api.dto';
import { User, UserRole } from '../entity/user.entity';

enum SignInDevice {
  /** 悅讀創享前端app(不可同時登入) */
  AppFront = 1,
  /** 網頁登入(可以同時登入) */
  Web = 3,
}

export class SignInDto {
  /**
   * 登入裝置(實為登入類型)
   */
  device: SignInDevice;

  /**
   * 帳號
   */
  account: string;

  /**
   * 密碼
   */
  password: string;
}

export class SignUpDto {
  /**
   * 帳號
   */
  account: string;

  /**
   * 使用者名稱
   */
  username: string;

  /**
   * 密碼
   */
  password: string;
}

/**
 * 註冊結果傳輸物件
 * @extends {ApiResOkBaseDto}
 */
export class SignUpResultDto extends ApiResOkBaseDto {
  constructor(user: User) {
    super();
    this.user = user;
  }

  /**
   * 使用者實體
   * @type {User}
   */
  user: User;
}

/**
 * 登入結果傳輸物件
 * @extends {ApiResOkBaseDto}
 */
export class SignInResultDto extends ApiResOkBaseDto {
  /**
   * mssr login的回傳格式data, 為一個json string, 包含token, 以及使用者基本資訊
   */
  data: string;
}

/**
 * 用戶自定義信息的資料傳輸物件 (DTO)。
 * 包含用戶的頭像 ID 和暱稱。
 */
export class UserCustomInfoDto {
  /**
   * 用戶的頭像 ID。
   * 這是一個可選的屬性。
   */
  avatarId?: number;

  /**
   * 用戶的暱稱。
   * 這是一個可選的屬性。
   */
  nickname?: string;

  /**
   * 用戶的帳號。
   * 這是一個可選的屬性。
   */
  account?: string;
}

/**
 * 用戶自定義信息結果的資料傳輸物件 (DTO)。
 * 繼承自 ApiResOkBaseDto 類。
 * 包含一個 User 物件。
 */
export class UserCustomInfoResultDto extends ApiResOkBaseDto {
  /**
   * 建構子。
   * 接收一個 User 物件作為參數，並將其賦值給 this.user。
   * @param {User} user - 一個 User 物件。
   */
  constructor(user: User) {
    super();
    this.user = user;
  }

  /**
   * 一個 User 物件。
   */
  user: User;
}
