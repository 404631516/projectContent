import MssrAgent from './MssrAgent';
import { GameProtocolName, RPCUserJoinGame } from './NetProtocol/GameProtocol';
import GameRoom from './GameRoom';
import GameUser from './GameUser';
import { Protocol, PTCLDisconnected } from './Netbase/Protocol';
import { Session } from './Netbase/Session';
import { NetComponent } from './Netcommon/NetApp';
import JwtValidator from './JwtValidator';
import { UserJoinGameResult, MemberType } from './NetProtocol/CommonStructure';
import { AsyncHelper } from './Netservice/AsyncHelper';
import ProfilerSystem from './Netservice/ProfilerSystem';

export class GameManager extends NetComponent {
  /** 遊戲清單 key: gameRoomId, value: GameRoom */
  private roomMap: Map<number, GameRoom> = new Map<number, GameRoom>();

  /** 玩家清單 key: uid, value: GameUser */
  private gameUserMap: Map<number, GameUser> = new Map<number, GameUser>();

  /** 生成中房間ID清單, 同時多個玩家要求創房間時, 避免重複生成房間 */
  private generatingGameRoomIds: Set<number> = new Set<number>();

  public create(): void {
    // setHandler
    this.setHandler(GameProtocolName.RPCUserJoinGame, this.onRPCPlayerJoinGame.bind(this));

    // redirectProtocolHandler
    this.session.setRedirectProtocolHandler((sn, ptcl) => {
      // 排除SystemProtocol
      if (ptcl.isSystemProtocol()) {
        return undefined;
      }
      // 尋找GameRoom
      return this.getUserGameRoom(sn.getId());
    });
  }

  public start(): void {
    //
  }

  public update(): void {
    this.roomMap.forEach((gameRoom) => {
      gameRoom.update();
    });
  }

  /** 找尋玩家對應遊戲
   * @param uid 玩家id
   */
  public getUserGameRoom(uid: number): GameRoom | undefined {
    const gameUser = this.gameUserMap.get(uid);
    if (gameUser === undefined) {
      return undefined;
    }
    // 找出對應gameRoom
    const gameRoomId = gameUser.getGameRoomId();
    return this.roomMap.get(gameRoomId);
  }

  /** 使用者建立連線 */
  public onConnected(sn: Session): void {
    //
  }

  /** 使用者斷線 */
  public onDisconnected(sn: Session, ptcl: PTCLDisconnected): void {
    const uid = sn.getId();
    const gameUser = this.gameUserMap.get(uid);
    // 防呆
    if (gameUser === undefined) {
      console.error(`GameManager.onDisconnected() error, uid ${uid} not found!`);
      return;
    }
    // 通知房間玩家斷線
    const gameRoomId = gameUser.getGameRoomId();
    const gameRoom = this.roomMap.get(gameRoomId);
    if (gameRoom) {
      gameRoom.onDisconnect(uid);
    }
    // 從gameUserMap移除
    this.gameUserMap.delete(uid);
  }

  /** 玩家要求加入遊戲
   * @param sn 連線
   * @param rpc 加入遊戲封包
   */
  public async onRPCPlayerJoinGame(sn: Session, rpc: RPCUserJoinGame): Promise<void> {
    const uid = sn.getId();

    // 防呆重複送的情況
    if (this.gameUserMap.has(uid)) {
      console.error(`onRPCPlayerJoinGame() error, user already join! uid: ${uid}`);
      rpc.outResult = UserJoinGameResult.UserAlreadyExist;
      sn.reply(rpc);
      return;
    }

    // 防呆 uid
    if (uid !== rpc.inUserInfo.uid) {
      console.error(`onRPCPlayerJoinGame() error, sn.id ${uid}, playerInfo.uid ${rpc.inUserInfo.uid}`);
      rpc.outResult = UserJoinGameResult.SessionIdNotMatchUid;
      sn.reply(rpc);
      return;
    }

    // 取得contestRoomUserInfo
    const contestRoomUserInfo = JwtValidator.verify(rpc.inRoomUserToken);
    // 防呆 送來的token有誤
    if (contestRoomUserInfo === undefined) {
      console.error(`onRPCPlayerJoinGame() error, verify inRoomUserToken failed! uid ${uid}`);
      rpc.outResult = UserJoinGameResult.RoomUserTokenVerifyFailed;
      sn.reply(rpc);
      return;
    }

    // 防呆, 依照contestRoomUserId 檢查memberType, 觀戰者的contestRoomUserId = -1
    const expectedMemberType = contestRoomUserInfo.contestRoomUserId <= 0 ? MemberType.Spectator : MemberType.Player;
    if (rpc.inUserInfo.memberType !== expectedMemberType) {
      console.error(`onRPCPlayerJoinGame error, unexpected memberType ${rpc.inUserInfo.memberType}, uid ${uid}`);
      rpc.outResult = UserJoinGameResult.UnexpectedMemberType;
      sn.reply(rpc);
      return;
    }

    const gameRoomId = contestRoomUserInfo.contestRoomId;
    const contestId = contestRoomUserInfo.contestId;

    // 若有同房號的房間正在生成, 等待它生成 成功/失敗
    if (this.generatingGameRoomIds.has(gameRoomId)) {
      await AsyncHelper.pendingUntil(() => this.generatingGameRoomIds.has(gameRoomId) === false);
    }

    // 尋找對應id的遊戲
    let gameRoom = this.roomMap.get(gameRoomId);

    // 找不到就create
    if (gameRoom === undefined) {
      this.generatingGameRoomIds.add(gameRoomId);

      // new GameRoom
      gameRoom = new GameRoom(this);
      console.log('new GameRoom ' + gameRoomId);
      // 等待init
      const roomInitResult = await gameRoom.init(gameRoomId, contestId, contestRoomUserInfo.gameType);
      // 防呆 init失敗
      if (roomInitResult !== UserJoinGameResult.Success) {
        console.error(
          `onRPCPlayerJoinGame() create room failed, gameRoom.init() failed! uid ${uid}, gameRoomId ${gameRoomId}`
        );
        rpc.outResult = roomInitResult;
        sn.reply(rpc);
        // 生成失敗, 從生成中房間Id清單移除
        this.generatingGameRoomIds.delete(gameRoomId);
        return;
      }

      // 通知mssr開局
      const createGameResponse = await MssrAgent.createGame(gameRoomId, contestId);
      // 防呆
      if (createGameResponse.isSuccess === false) {
        console.error(
          `onRPCPlayerJoinGame() create room failed, contestRoomData undefined! uid ${uid}, gameRoomId ${gameRoomId}`
        );
        rpc.outResult = UserJoinGameResult.MssrCreateGameFailed;
        sn.reply(rpc);
        // 生成失敗, 從生成中房間Id清單移除
        this.generatingGameRoomIds.delete(gameRoomId);
        return;
      }

      gameRoom.verifyCode = createGameResponse.verifyCode;
      // 加入gameMap
      this.roomMap.set(gameRoomId, gameRoom);
      // ProfilerSystem 紀錄房間數
      if (ProfilerSystem.isEnable) {
        ProfilerSystem.updateRoomCount(this.roomMap.size);
      }
      // 生成成功, 從生成中房間Id清單移除
      this.generatingGameRoomIds.delete(gameRoomId);
    }

    // 加入玩家
    const gameUser = new GameUser(rpc.inUserInfo, this, gameRoomId);
    this.gameUserMap.set(uid, gameUser);

    // 加入房間
    const roomJoinUserResult = await gameRoom.joinUser(gameUser);
    rpc.outResult = roomJoinUserResult;
    sn.reply(rpc);
  }

  /** 遊戲結束, 移除gameUsers, 移除GameRoom
   * @param gameRoomId
   */
  public onGameFinish(gameRoomId: number): void {
    // 防呆
    if (this.roomMap.has(gameRoomId) === false) {
      console.error(`onGameFinish() error, gameRoom ${gameRoomId} not found!`);
      return;
    }
    // 移除GameRoom
    this.roomMap.delete(gameRoomId);
    // ProfilerSystem 紀錄房間數
    if (ProfilerSystem.isEnable) {
      ProfilerSystem.updateRoomCount(this.roomMap.size);
    }
  }

  /** 廣播給複數對象
   * @param ptcl 要廣播的封包
   * @param target 廣播對象
   */
  public send(ptcl: Protocol, target?: number | number[]): Promise<boolean> {
    return this.session.send(ptcl, target);
  }
}
