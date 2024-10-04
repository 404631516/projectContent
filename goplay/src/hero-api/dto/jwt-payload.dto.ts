/**
 * JWT 載荷資料傳輸物件
 * @class
 * @public
 */
export interface JwtPayloadDto {
  /**
   * 使用者名稱
   * @type {string}
   */
  account: string;

  /**
   * 使用者 ID
   * @type {number}
   */
  uid: number;
}
