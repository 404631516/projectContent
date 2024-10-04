import { UserJoinGameResult } from './NetProtocol/CommonStructure';
import GameRoom from './GameRoom';
import GameUser from './GameUser';
import { Protocol } from './Netbase/Protocol';
import { ProtocolHandler } from './Netbase/ProtocolObservable';

/** 一個GameRoom掛一個GameLogic, 依特定規則決定遊戲類別XXXGameLogic */
export abstract class BaseGameLogic {
  /** 對應的GameRoom */
  private gameRoom: GameRoom;

  constructor(gameRoom: GameRoom) {
    this.gameRoom = gameRoom;
  }

  /** 取得賽事id */
  public get contestId(): number {
    return this.gameRoom.contestId;
  }
  /** 取得verifyCode */
  public get verifyCode(): string {
    return this.gameRoom.verifyCode;
  }

  /** init */
  public abstract init(gameRoomId: number, contestId: number): Promise<UserJoinGameResult>;

  public abstract update(): void;

  /** 玩家加入房間 */
  public abstract joinPlayer(gameUser: GameUser): Promise<UserJoinGameResult>;

  /** 觀戰者加入房間 */
  public abstract joinSpectator(gameUser: GameUser): Promise<UserJoinGameResult>;

  /** 玩家斷線 */
  public abstract onDisconnect(uid: number): void;

  /** 結束遊戲, 關閉房間 */
  protected finishGameRoom(): void {
    // 通知gameRoom, 關閉房間
    this.gameRoom.onGameFinish();
  }

  /**
   * 設定handler
   * @param type 要監聽的protocol type
   * @param handler handler
   */
  protected setHandler<T extends Protocol>(ptclName: string, handler: ProtocolHandler<T>): void {
    this.gameRoom.setHandler(ptclName, handler);
  }

  /** 對房間內所有人廣播
   * @param ptcl 要廣播的封包
   * @param ignore 不用廣播的uid清單
   * @returns session send是否成功
   */
  protected roomBroadcast(ptcl: Protocol, ignore: number[] = []): Promise<boolean> {
    return this.gameRoom.roomBroadcast(ptcl, ignore);
  }
}
