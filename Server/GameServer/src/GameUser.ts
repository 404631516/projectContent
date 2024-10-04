import { ServiceUserInfo } from './NetProtocol/CommonStructure';
import { GameManager } from './GameManager';
import { Protocol } from './Netbase/Protocol';

export default class GameUser {
  /** 對應玩家uid */
  private uid: number;
  /** 對應GameManager */
  private gameManager: GameManager;
  /** 對應房間 */
  private gameRoomId: number;
  /** 玩家基本資訊 */
  protected userInfo: ServiceUserInfo;

  /** constructor
   * @param userInfo 玩家基本資訊
   * @param gameManager 對應GameManager
   * @param gameRoom 對應房間
   */
  constructor(userInfo: ServiceUserInfo, gameManager: GameManager, gameRoomId: number) {
    this.uid = userInfo.uid;
    this.userInfo = userInfo;
    this.gameManager = gameManager;
    this.gameRoomId = gameRoomId;
  }

  /** 取得玩家uid */
  public getUid(): number {
    return this.uid;
  }

  /** 取得玩家基本資訊 */
  public getUserInfo(): ServiceUserInfo {
    return this.userInfo;
  }

  /** 取得對應房間 */
  public getGameRoomId(): number {
    return this.gameRoomId;
  }

  /** 對本玩家送出封包 */
  public send(ptcl: Protocol): Promise<boolean> {
    return this.gameManager.send(ptcl, this.uid);
  }
}
