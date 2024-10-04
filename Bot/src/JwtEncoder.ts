import jwt from 'jsonwebtoken';
import botConfigJson from './botConfig.json';
import { ContestRoomUserInfo } from './NetProtocol/CommonStructure';

export default class JwtEncoder {
  private static readonly salt: string = botConfigJson.jwtSalt;

  public static encode(userInfo: ContestRoomUserInfo) {
    return jwt.sign(userInfo, this.salt);
  }
}
