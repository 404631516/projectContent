import { BaseGameLogic } from './BaseGameLogic';
import BrickBreakerGameLogic from './Games/BrickBreaker/BrickBreakerGameLogic';
import { UserJoinGameResult, GameType, MemberType } from './NetProtocol/CommonStructure';
import { PTCLGameEnd } from './NetProtocol/GameProtocol';
import { GameManager } from './GameManager';
import GameUser from './GameUser';
import { Protocol } from './Netbase/Protocol';
import { ProtocolObservable } from './Netbase/ProtocolObservable';

export default class GameRoom extends ProtocolObservable {
  /** 本房間在gameManager裡的key */
  private gameRoomId!: number;

  /** 賽事id */
  private _contestId!: number;
  public get contestId(): number {
    return this._contestId;
  }

  /** verifyCode */
  private _verifyCode!: string;
  public set verifyCode(verifyCode: string) {
    this._verifyCode = verifyCode;
  }
  public get verifyCode(): string {
    return this._verifyCode;
  }

  /** 房間玩家清單 */
  private gameUsers: Map<number, GameUser> = new Map<number, GameUser>();

  /** GameManager */
  private gameManager: GameManager;

  /** 一個GameRoom掛一個GameLogic, 依特定規則決定遊戲類別XXXGameLogic */
  private gameLogic!: BaseGameLogic;

  constructor(gameManager: GameManager) {
    super();

    this.gameManager = gameManager;
  }

  /** init
   * @param gameRoomId 此房間對應的gameRoomId
   * @param contestId 此房間對應的賽事id
   * @param gameType 遊戲類型
   */
  public async init(gameRoomId: number, contestId: number, gameType: GameType): Promise<UserJoinGameResult> {
    this.gameRoomId = gameRoomId;
    this._contestId = contestId;

    // 根據遊戲設定資料, 決定要new的gameLogic類型
    switch (gameType) {
      case GameType.BrickBreaker:
        this.gameLogic = new BrickBreakerGameLogic(this);
        return this.gameLogic.init(gameRoomId, contestId);
      default:
        console.error(`GameRoom.init() error, unexpected gameType ${gameType}! gameRoomId = ${gameRoomId}`);
        return UserJoinGameResult.GameTypeError;
    }
  }

  /** update */
  public update(): void {
    if (this.gameLogic === undefined) {
      return;
    }
    this.gameLogic.update();
  }

  /** 玩家加入遊戲
   * @param gameUser 新玩家
   * @returns 是否成功加入房間
   */
  public async joinUser(gameUser: GameUser): Promise<UserJoinGameResult> {
    // 防呆
    const uid = gameUser.getUid();
    if (this.gameUsers.has(uid)) {
      console.error(`GameRoom.joinUser() error, gameUser ${uid} already exist!`);
      return UserJoinGameResult.UserAlreadyExist;
    }
    // user加入gameUsers名單
    this.gameUsers.set(uid, gameUser);

    // 遊戲邏輯對RPCPlayerJoinGame的處理, 依身分不同call不同function
    switch (gameUser.getUserInfo().memberType) {
      case MemberType.Player:
        return this.gameLogic.joinPlayer(gameUser);
      case MemberType.Spectator:
        return this.gameLogic.joinSpectator(gameUser);
      default:
        console.error(`GameRoom.joinUser() error, unexpected memberType: ${gameUser.getUserInfo().memberType}`);
        return UserJoinGameResult.UnexpectedMemberType;
    }
  }

  /** 收到玩家斷線訊息
   * @param uid 斷線玩家uid
   */
  public onDisconnect(uid: number): void {
    // 防呆
    if (this.gameUsers.has(uid) === false) {
      console.error(`GameRoom.onDisconnected error, gameUsers uid ${uid} not found! this.gameUsers.keys:`);
      console.error(this.gameUsers.keys());
      return;
    }

    // 通知gameLogic
    this.gameLogic.onDisconnect(uid);

    // 從gameUsers移除
    this.gameUsers.delete(uid);
  }

  /** 廣播PTCL給房間內的線上玩家
   * @param ptcl 要廣播的封包
   * @param ignore 要排除的uid
   */
  public roomBroadcast(ptcl: Protocol, ignore: number[] = []): Promise<boolean> {
    // 房間全部人名單
    const allUids = Array.from(this.gameUsers.keys());
    // 排除特定不想廣播的人
    const targetUids = allUids.filter((uid) => ignore.includes(uid) === false);
    // 送出廣播
    return this.gameManager.send(ptcl, targetUids);
  }

  /** gameLogic通知遊戲結束, 統一發送PTCLGameEnd, 並通知gameManager */
  public async onGameFinish(): Promise<void> {
    console.log(`Game ${this.gameRoomId} finished`);

    // broadcast PTCLGameEnd
    const ptcl = new PTCLGameEnd();
    await this.roomBroadcast(ptcl);

    this.gameManager.onGameFinish(this.gameRoomId);
  }
}
