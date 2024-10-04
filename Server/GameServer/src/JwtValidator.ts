import jwt from 'jsonwebtoken';
import { ContestRoomUserInfo } from './NetProtocol/CommonStructure';
import mssrConfigJson from '../mssrConfig.json';

export default class JwtValidator {
  private static readonly salt: string = mssrConfigJson.jwtSalt;

  /** 驗證token
   * @param token token
   * @returns 回傳token資料內容(ContestRoomUserInfo), 失敗就回傳undefined
   */
  public static verify(token: string): ContestRoomUserInfo | undefined {
    // 回傳格式
    let result: ContestRoomUserInfo | undefined;
    // 驗證salt並decode
    jwt.verify(token, this.salt, (err, decoded) => {
      // 驗證失敗就回傳undefined
      if (err) {
        result = undefined;
        return;
      }
      // 將解碼資料內容填入result
      result = decoded as ContestRoomUserInfo;
    });
    // 回傳
    return result;
  }
}
