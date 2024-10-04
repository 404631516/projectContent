import Bot from './Bot';
import BrickBreakerClient from './NetClient/BrickBreaker/BrickBreakerClient';
import {
  GetNextQuestionResultType,
  PTCLBrickBreakerRankData,
  RPCBrickBreakerAvatarMove,
  RPCBrickBreakerPlayerAnswerFinished,
  RPCBrickBreakerPlayerGetNextQuestion,
} from './NetProtocol/BrickBreakerProtocol';
import {
  BrickBreakerAvatarData,
  BrickBreakerAvatarUpdateData,
  BrickBreakerAvatarUpdateType,
  BrickBreakerBossData,
  BrickBreakerGrid,
  BrickBreakerGridType,
} from './NetProtocol/BrickBreakerStructure';
import IBrickBreakerClient from './NetClient/BrickBreaker/IBrickBreakerClient';
import { MemberType, ServiceUserInfo, UserJoinGameResult } from './NetProtocol/CommonStructure';
import State from './Netcommon/StateMachine/State';
import StateMachine from './Netcommon/StateMachine/StateMachine';
import MssrComponent from './MssrComponent';
import botConfigJson from './botConfig.json';
import MathHelper from './MathHelper';
import { PTCLDisconnectReason, PTCLError } from './Netbase/Protocol';

/** state machine transition */
enum BrickBreakerBotEventType {
  /** 連線成功 */
  ConnectSuccessful,
  /** 回到Idle */
  Idle,
  /** 開始擲骰子 */
  TryMove,
  /** 答題開始 */
  StartAnswer,
  /** 下一題 */
  NextQuestion,
  /** 答題結束 */
  AnswerFinish,
  /** 表演遇到的事件 */
  Performing,
  /** 遊戲結束前, 主動斷線 */
  OnLeave,
  /** 遊戲結束 */
  OnGameEnd,
  /** 遇到Error */
  OnError,
  /** 重新開始建立連線 */
  StartConnect,
}

export default class BrickBreakerBot extends Bot implements IBrickBreakerClient {
  /** gameLogic */
  public brickBreakerClient!: BrickBreakerClient;

  /** 狀態機 */
  private stateMachine: StateMachine<BrickBreakerBot> = new StateMachine<BrickBreakerBot>();

  /** 弱連網連線實體 */
  public botMssrAgentComponent: MssrComponent = new MssrComponent(botConfigJson.mssrUrl, botConfigJson.teacherToken);

  /** 房間編號 */
  public roomId!: number;
  /** 房間密碼 */
  public roomPassword!: string;

  /** 登入強聯網及加入房間用的token */
  public roomUserToken!: string;

  /** 是否已收到遊戲開始通知 */
  public isGameStart: boolean = false;

  /** PerformingState根據要表演的事件類型, 根據此值, PerformingState持續時間不同 */
  public performingUpdateType: BrickBreakerAvatarUpdateType = BrickBreakerAvatarUpdateType.DoNothing;

  /** 強聯網server網址 */
  public socketServerUrl: string;

  /** constructor
   * @param uid bot uid
   */
  constructor(uid: number, gatewayServerUrl: string) {
    super(uid);

    this.socketServerUrl = gatewayServerUrl;

    // 狀態機setTarget
    this.stateMachine.setTarget(this);

    // create states.
    const connectState = this.stateMachine.createState(ConnectState);
    const gameInitState = this.stateMachine.createState(GameInitState);
    const idleState = this.stateMachine.createState(IdleState);
    const tryMoveState = this.stateMachine.createState(TryMoveState);
    const startAnswerState = this.stateMachine.createState(StartAnswerState);
    const answeringState = this.stateMachine.createState(AnsweringState);
    const answerFinishState = this.stateMachine.createState(AnswerFinishState);
    const performingState = this.stateMachine.createState(PerformingState);
    const errorState = this.stateMachine.createState(ErrorState);
    const leaveState = this.stateMachine.createState(LeaveState);
    const gameEndState = this.stateMachine.createState(GameEndState);

    // set transition.
    this.stateMachine.setTransition(BrickBreakerBotEventType.ConnectSuccessful, gameInitState, connectState);
    this.stateMachine.setTransition(BrickBreakerBotEventType.Idle, idleState, gameInitState);
    this.stateMachine.setTransition(BrickBreakerBotEventType.TryMove, tryMoveState, idleState);
    this.stateMachine.setTransition(BrickBreakerBotEventType.StartAnswer, startAnswerState, tryMoveState);
    this.stateMachine.setTransition(BrickBreakerBotEventType.Performing, performingState, tryMoveState);

    this.stateMachine.setTransition(BrickBreakerBotEventType.NextQuestion, answeringState, startAnswerState);
    this.stateMachine.setTransition(BrickBreakerBotEventType.NextQuestion, answeringState, answeringState);
    this.stateMachine.setTransition(BrickBreakerBotEventType.AnswerFinish, answerFinishState, answeringState);
    this.stateMachine.setTransition(BrickBreakerBotEventType.Performing, performingState, answerFinishState);

    this.stateMachine.setTransition(BrickBreakerBotEventType.Idle, idleState, performingState);
    this.stateMachine.setTransition(BrickBreakerBotEventType.StartConnect, connectState, gameEndState);

    // any transition.
    this.stateMachine.setTransition(BrickBreakerBotEventType.OnError, errorState);
    this.stateMachine.setTransition(BrickBreakerBotEventType.OnLeave, leaveState);
    this.stateMachine.setTransition(BrickBreakerBotEventType.OnGameEnd, gameEndState);

    this.stateMachine.setTransition(BrickBreakerBotEventType.StartConnect, errorState, connectState);

    // 起始state
    this.stateMachine.initState(connectState);
  }

  /** login並更新自己的token */
  public async login(account: string, password: string): Promise<boolean> {
    return await this.botMssrAgentComponent.login(account, password);
  }

  /** 設定要加入房間的房號&密碼 */
  public setRoomInfo(roomId: number, password: string): void {
    this.roomId = roomId;
    this.roomPassword = password;
  }

  /** update */
  public update() {
    this.stateMachine.updateState();
  }

  //#region IBrickBreakerClient
  public onDisconnected(reason: PTCLDisconnectReason): void {
    // 一般斷線
    if (reason === PTCLDisconnectReason.Normal) {
      // 進入GameEndState
      this.stateMachine.triggerEvent(BrickBreakerBotEventType.OnGameEnd);
    }
    // ErrorState觸發
    else if (reason === PTCLDisconnectReason.Error) {
      return;
    }
    // 特殊斷線
    else {
      // 顯示錯誤訊息
      console.error(`onDropSession() reason: ${PTCLDisconnectReason[reason]}, uid = ${this.uid}`);
      this.stateMachine.triggerEvent(BrickBreakerBotEventType.OnError);
    }
  }

  public onReconnect(): void {
    // 表演
  }

  public onGameStart(): void {
    // 進入IdleState
    this.isGameStart = true;
  }

  public onAvatarUpdate(updateData: BrickBreakerAvatarUpdateData, avatarData: BrickBreakerAvatarData): void {
    // 表演
  }

  public onGridUpdate(grid: BrickBreakerGrid): void {
    // 表演
  }

  public onBossUpdate(bossData: BrickBreakerBossData): void {
    // 表演
  }

  public onRankData(ptclRankData: PTCLBrickBreakerRankData): void {
    // 表演
  }

  public onGameEnd(): void {
    // 進入GameEndState
    this.stateMachine.triggerEvent(BrickBreakerBotEventType.OnLeave);
  }

  //#endregion
}

/** 建立連線 */
class ConnectState extends State<BrickBreakerBot> {
  public async onEnter() {
    // console.log(`ConnectState.onEnter() uid ${this.getTarget().uid}`);
    // 加房間用資料
    const contestRoomId = this.getTarget().roomId;
    const roomPassword = this.getTarget().roomPassword;
    const uid = this.getTarget().uid;
    const randomHeroId = 40106001 + Math.floor(Math.random() * 6);
    const playerInfo: ServiceUserInfo = {
      uid,
      name: 'name' + uid.toString(),
      school: 'school' + uid.toString(),
      heroId: randomHeroId,
      hid: randomHeroId,
      memberType: MemberType.Player,
      isOnline: true,
    };

    // 取得 房間賽事 token
    const signUpTokenResponse = await this.getTarget().botMssrAgentComponent.getSignUpToken(
      contestRoomId,
      roomPassword
    );
    // 防呆
    if (signUpTokenResponse.isSuccess === false) {
      console.error(
        `ConnectState.onEnter() error, getSignUpToken failed! uid = ${uid}, contestRoomId = ${contestRoomId}`
      );
      return;
    }
    // 設定加入房間用token
    this.getTarget().roomUserToken = signUpTokenResponse.signUpToken;
    // 設定強聯網連線實體
    this.getTarget().brickBreakerClient = new BrickBreakerClient(
      this.getTarget().socketServerUrl,
      this.getTarget().roomUserToken,
      this.getTarget()
    );

    // 建立連線
    const connectResult = await this.getTarget().brickBreakerClient.startConnecting();
    if (connectResult === false) {
      console.error(`ConnectState error, startConnecting() failed, uid ${this.getTarget().uid}`);
      return;
    }

    // 暫停接收廣播封包
    this.getTarget().brickBreakerClient.pauseBroadcastProtocol();

    // 送封包加入房間
    const token = this.getTarget().roomUserToken;
    const result = await this.getTarget().brickBreakerClient.sendRPCPlayerJoinGame(token, playerInfo);

    // 成功
    if (result === UserJoinGameResult.Success) {
      console.log(`uid ${uid} enter game ${contestRoomId}`);
      this.triggerEvent(BrickBreakerBotEventType.ConnectSuccessful);
    }
    // 失敗
    else {
      console.error(
        `ConnectState error, unexpected resultType: UserJoinGameResult.${UserJoinGameResult[result]}, uid ${
          this.getTarget().uid
        }`
      );
    }
  }
}

/** 連線成功後, 取得遊戲資訊, 收到PTCLGameStart後進入Idle */
class GameInitState extends State<BrickBreakerBot> {
  private isGetMapComplete = false;

  public async onEnter() {
    // 取得地圖等遊戲資訊
    const result = await this.getTarget().brickBreakerClient.sendRPCBrickBreakerGetGameInfo();
    // 防呆, PTCLError
    if (result instanceof PTCLError) {
      this.triggerEvent(BrickBreakerBotEventType.OnError);
      return;
    }

    // 取得房間現有玩家資訊
    const getAvatarDataResult = await this.getTarget().brickBreakerClient.sendRPCBrickBreakerGetAvatarDataList();
    // 防呆, PTCLError
    if (getAvatarDataResult instanceof PTCLError) {
      this.triggerEvent(BrickBreakerBotEventType.OnError);
      return;
    }

    // resume()
    this.getTarget().brickBreakerClient.resumeBroadcastProtocol();

    this.isGetMapComplete = true;
    // 若遊戲已開始, 觸發OnGameStart()
    if (result.isGameStart) {
      this.getTarget().onGameStart();
    }
  }

  public onUpdate(delta?: number): void {
    if (this.isGetMapComplete === false) {
      return;
    }
    // 若收到PTCLGameStart則進入IdleState
    if (this.getTarget().isGameStart) {
      this.triggerEvent(BrickBreakerBotEventType.Idle);
    }
  }
}

/** 在遊戲中Idle, 等一段隨機秒數後進入DrawDiceState */
class IdleState extends State<BrickBreakerBot> {
  private changeStateAt: number = 0;

  public onEnter() {
    // console.log('IdleState.onEnter()');
    // 等待隨機秒數後, 進入DrawDiceState
    const delayMilliSec = 1000 + Math.random() * 3000;
    this.changeStateAt = Date.now() + delayMilliSec;
  }

  public onUpdate(delta?: number): void {
    if (Date.now() > this.changeStateAt) {
      this.triggerEvent(BrickBreakerBotEventType.TryMove);
    }
  }
}

/** 骰骰子, 成功後進入MovingState */
class TryMoveState extends State<BrickBreakerBot> {
  /** 回傳封包 */
  private moveResult: RPCBrickBreakerAvatarMove | undefined;

  public async onEnter() {
    // console.log('TryMoveState.onEnter()');
    // 變數重置
    this.moveResult = undefined;
    const client = this.getTarget().brickBreakerClient;

    // 決定前進方向
    const targetGridId = this.getTargetGrid(client);

    // 送出觸發格子封包
    const result = await client.sendRPCMove(targetGridId);
    // 防呆, PTCLError
    if (result instanceof PTCLError) {
      this.triggerEvent(BrickBreakerBotEventType.OnError);
      return;
    }
    this.moveResult = result;
  }

  /** 找出移動目標gridId
   * @param client 對應BrickBreakerClient
   */
  private getTargetGrid(client: BrickBreakerClient): number {
    // TODO 尋路

    // 找出上下左右格子
    const uid = this.getTarget().uid;
    const allPossiblePos = client.getPossiblePositions(uid);
    const targetGridIds: number[] = [];
    // 排除不可前進格子
    allPossiblePos.forEach((gridId) => {
      const grid = client.getGrid(gridId);
      if (
        grid.gridType === BrickBreakerGridType.UnbreakableBrick1 ||
        grid.gridType === BrickBreakerGridType.UnbreakableBrick2 ||
        grid.gridType === BrickBreakerGridType.UnbreakableBrick3 ||
        grid.isUnlock === false
      ) {
        return;
      }
      targetGridIds.push(gridId);
    });

    // 防呆, 理論上不會發生, 除非地圖設計有誤
    if (targetGridIds.length === 0) {
      console.error(`TryMoveState error, no possible next position! uid: ${uid}`);
      this.triggerEvent(BrickBreakerBotEventType.OnError);
      return 0;
    }

    // 隨機骰前進方向
    const randomIndex = Math.floor(Math.random() * targetGridIds.length);
    return targetGridIds[randomIndex];
  }

  public onUpdate(delta?: number): void {
    // 封包還沒回傳就return
    if (this.moveResult === undefined) {
      return;
    }

    // 取得updateType
    const updateType = this.moveResult.outAvatarUpdateData.updateType;
    // 防呆, 格子觸發失敗
    if (this.moveResult.outIsSuccess === false) {
      // 格子觸發失敗
      console.log(
        `bot ${this.getTarget().uid} TryMoveState() trigger grid failed! updateType = ${
          BrickBreakerAvatarUpdateType[updateType]
        }`
      );
      this.triggerEvent(BrickBreakerBotEventType.OnError);
      return;
    }
    // 針對不同事件類型做不同反應
    switch (updateType) {
      // 答題
      case BrickBreakerAvatarUpdateType.StartAnswer:
        this.triggerEvent(BrickBreakerBotEventType.StartAnswer);
        break;
      // 表演
      default:
        this.getTarget().performingUpdateType = updateType;
        this.triggerEvent(BrickBreakerBotEventType.Performing);
        break;
    }
  }
}

/** 表演階段, 等待表演秒數結束後回到Idle */
class StartAnswerState extends State<BrickBreakerBot> {
  private changeStateAt: number = 0;

  private hasReply: boolean = false;

  public async onEnter() {
    // console.log('StartAnswerState.onEnter()');
    // 變數重置
    this.hasReply = false;
    // 答題前表演delay時間
    const delayMilliSec: number = 3000;
    // 設定表演結束時間, 等待表演結束
    this.changeStateAt = Date.now() + delayMilliSec;
    // 要題目
    await this.getTarget().brickBreakerClient.sendRPCBrickBreakerPlayerGetNextQuestion(0, 0);
    this.hasReply = true;
  }

  public onUpdate(delta?: number): void {
    if (Date.now() > this.changeStateAt && this.hasReply) {
      this.triggerEvent(BrickBreakerBotEventType.NextQuestion);
    }
  }
}

/** 表演階段, 等待表演秒數結束後回到Idle */
class AnsweringState extends State<BrickBreakerBot> {
  /** 答題時間點 */
  private answerAt: number = 0;
  /** 是否已達題 */
  private hasSendAnswer = false;
  /** 答題收到的result */
  private answerResult: RPCBrickBreakerPlayerGetNextQuestion | undefined;

  /** 答題思考時間(毫秒) */
  private readonly thinkTimeMin = 1000;
  /** 答題思考時間(毫秒) */
  private readonly thinkTimeMax = 10000;

  public onEnter() {
    // console.log('AnsweringState.onEnter()');
    // 變數重置
    this.hasSendAnswer = false;
    this.answerResult = undefined;
    // 設定表演結束時間, 等待表演結束
    this.answerAt = Date.now() + MathHelper.random(this.thinkTimeMin, this.thinkTimeMax);
  }

  public async onUpdate(delta?: number): Promise<void> {
    // 答題成功後進入下個state, 這個if之所以放前面是為了避免Bot已摧毀、而Promise未結束的情況, 可能導致報錯, 所以強迫等下次update再處理
    if (this.answerResult) {
      // 防呆
      if (this.answerResult.outResultType !== GetNextQuestionResultType.Success) {
        const resultType = GetNextQuestionResultType[this.answerResult.outResultType];
        console.error(`AnsweringState answer failed! resultType = ${resultType}, uid = ${this.getTarget().uid}`);
        this.triggerEvent(BrickBreakerBotEventType.OnError);
        return;
      }
      // 答題結束
      if (this.answerResult.outQuestionData.isFinished) {
        this.triggerEvent(BrickBreakerBotEventType.AnswerFinish);
        return;
      }
      // 再答下一題
      this.triggerEvent(BrickBreakerBotEventType.NextQuestion);
    }

    // 時間到了就答題
    if (Date.now() > this.answerAt && this.hasSendAnswer === false) {
      this.hasSendAnswer = true;
      // 答題並要下一題
      const answerIndex = 1;
      const result = await this.getTarget().brickBreakerClient.sendRPCBrickBreakerPlayerGetNextQuestion(answerIndex, 0);
      // 防呆, PTCLError
      if (result instanceof PTCLError) {
        this.triggerEvent(BrickBreakerBotEventType.OnError);
        return;
      }
      this.answerResult = result;
    }
  }
}

/** 表演階段, 等待表演秒數結束後回到Idle */
class AnswerFinishState extends State<BrickBreakerBot> {
  private answerFinishedResult: RPCBrickBreakerPlayerAnswerFinished | undefined;

  public async onEnter() {
    // console.log('AnswerFinishState.onEnter()');
    // 變數重置
    this.answerFinishedResult = undefined;

    // 等待答題結束
    const result = await this.getTarget().brickBreakerClient.sendRPCBrickBreakerPlayerAnswerFinished();
    // 防呆, PTCLError
    if (result instanceof PTCLError) {
      this.triggerEvent(BrickBreakerBotEventType.OnError);
      return;
    }

    this.answerFinishedResult = result;
    this.getTarget().performingUpdateType = this.answerFinishedResult.avatarUpdateData.updateType;
  }

  public onUpdate(delta?: number): void {
    if (this.answerFinishedResult) {
      // 防呆
      if (this.answerFinishedResult.isSuccess === false) {
        console.error(`bot ${this.getTarget().uid} send AnswerFinished error, isSuccess is false!`);
        this.triggerEvent(BrickBreakerBotEventType.OnError);
        return;
      }
      this.triggerEvent(BrickBreakerBotEventType.Performing);
    }
  }
}

/** 表演階段, 等待表演秒數結束後回到Idle */
class PerformingState extends State<BrickBreakerBot> {
  private changeStateAt: number = 0;

  public onEnter() {
    // 取得更新事件類型
    const updateType = this.getTarget().performingUpdateType;
    // console.log(`PerformingState.onEnter() bot ${this.getTarget().uid} updateType ${BrickBreakerAvatarUpdateType[updateType]}`);

    // 根據更新事件類型不同, delay時間不同
    let delayMilliSec: number;
    switch (updateType) {
      case BrickBreakerAvatarUpdateType.Freeze:
        delayMilliSec = 13000;
        break;
      default:
        delayMilliSec = 3000;
        break;
    }
    // 設定表演結束時間, 等待表演結束
    this.changeStateAt = Date.now() + delayMilliSec;
  }

  public onUpdate(delta?: number): void {
    if (Date.now() > this.changeStateAt) {
      this.triggerEvent(BrickBreakerBotEventType.Idle);
    }
  }
}

/** 遭遇錯誤state */
class ErrorState extends State<BrickBreakerBot> {
  public onEnter() {
    const gameRoomId = this.getTarget().roomId;
    const uid = this.getTarget().uid;
    console.error(`ErrorState gameRoomId ${gameRoomId}, uid ${uid}`);
    // 斷線
    this.getTarget().brickBreakerClient.disconnect(PTCLDisconnectReason.Error);
  }
}

/** 主動斷線state */
class LeaveState extends State<BrickBreakerBot> {
  public onEnter() {
    // 斷線
    this.getTarget().brickBreakerClient.disconnect(PTCLDisconnectReason.Normal);
  }
}

/** 遊戲結束state */
class GameEndState extends State<BrickBreakerBot> {
  public onEnter() {
    const gameRoomId = this.getTarget().roomId;
    const uid = this.getTarget().uid;
    console.log(`GameEnd gameRoomId ${gameRoomId}, uid ${uid}`);
  }
}
