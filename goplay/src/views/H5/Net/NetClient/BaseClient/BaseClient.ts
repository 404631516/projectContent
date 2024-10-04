import axios from 'axios';
import {
  Protocol,
  PTCLDisconnected,
  PTCLDisconnectReason,
  PTCLError,
  PTCLNotifyConnect,
  SystemProtocolName,
} from '../../Netbase/Protocol';
import { getSessionProvider } from '../../Netbase/SessionSSEClient';
import { NetApp } from '../../Netcommon/NetApp';
import { ServiceUserInfo, UserJoinGameResult } from '../../NetProtocol/CommonStructure';
import { GameProtocolName, RPCUserJoinGame } from '../../NetProtocol/GameProtocol';
import { ProtocolQueue } from './ProtocolQueue';
import IBaseClient from './IBaseClient';

export default class BaseClient<ClientInterface extends IBaseClient> {
  /** NetApp */
  protected app!: NetApp;
  /** 通知外部表演interface */
  protected clientInterface: ClientInterface;
  /** contest user token */
  private token: string;
  /** nginx所在網址, 或是直連server所在網址 */
  private socketServerUrl: string;
  /** 是否已設定sessionCode */
  private hasSessionCode: boolean = false;
  /** 封包接收暫停器 */
  private broadcastProtocolQueue?: ProtocolQueue;

  /** 用來取得對應game server網址的url, 送弱聯網request, 回傳強聯網連線目標location */
  private readonly getGameServerLocationRouter: string = '/getSSE/getGameServerLocation';
  /** 強聯網GameServer連線位址 = socketServerUrl + gameServerLocation + '/sse' */
  private readonly sseRouter: string = '/sse';

  /** 剛斷線時navigator.onLine還是true, 稍等x秒再開始偵測 */
  private readonly startDetectOnlineDelaySec = 1;
  /** 斷線之後嘗試自動重連的秒數, 超過這個秒數就跳視窗請玩家確認網路連線 */
  private readonly autoConnectTimeoutSec = 10;
  /** 就算偵測到有網路, 還需等待數秒才能成功送出封包 */
  private readonly onlinePrepareDelaySec = 3;

  /** constructor
   * @param socketServerUrl 強連網網址, 後面加上不同'/routerName', 交給nginx導去對應伺服器
   * @param token contest user token
   * @param clientInterface clientInterface
   */
  constructor(socketServerUrl: string, token: string, clientInterface: ClientInterface) {
    this.socketServerUrl = socketServerUrl;
    this.token = token;
    this.clientInterface = clientInterface;
  }

  /** 取得強聯網連線目標url, 等待連線完成 */
  public async startConnecting(): Promise<boolean> {
    this.hasSessionCode = false;

    // 送一個弱聯網封包去要對應gameServer的location
    const getSSELocationUrl = this.socketServerUrl + this.getGameServerLocationRouter;
    const response = await axios.get(getSSELocationUrl, { params: { token: this.token } });
    // 防呆
    if (
      response === undefined ||
      response.data === undefined ||
      response.data.success === undefined ||
      response.data.url === undefined ||
      response.data.success === false
    ) {
      console.error(`get gameServer location failed! \n getSSELocationUrl = ${getSSELocationUrl}`);
      return false;
    }

    // 取得gameServerRouter
    const gameServerLocation = response.data.url;

    // 與socketServerUrl組合成完整game server url
    const gameServerUrl = this.socketServerUrl + gameServerLocation + this.sseRouter;

    // 生成一個Session
    const clientSession = getSessionProvider().createClientSession({ url: gameServerUrl, token: this.token });

    // 設定成只queue rpc以外的封包
    this.broadcastProtocolQueue = new ProtocolQueue(clientSession);

    // new NetApp
    this.app = new NetApp(clientSession);
    // 註冊要listen的Protocols
    this.setHandlers();
    // 開始建立連線
    await this.app.start();
    // 等待sessionCode設定好才算連線完成
    await this.pendingUntil(() => {
      return this.hasSessionCode;
    });
    return true;
  }

  /** 註冊要監聽的Protocols */
  protected setHandlers(): void {
    this.app.setHandler(GameProtocolName.PTCLGameStart, this.clientInterface.onGameStart.bind(this.clientInterface));
    this.app.setHandler(GameProtocolName.PTCLGameEnd, this.clientInterface.onGameEnd.bind(this.clientInterface));
    // 斷線處理
    this.app.setHandler<PTCLDisconnected>(SystemProtocolName.PTCLDisconnected, (sn, ptcl) => {
      this.app.visitComponent((component) => {
        component.onDisconnected(sn, ptcl);
      });
      this.clientInterface.onDisconnected(ptcl.reason);
    });
    // 收到PTCLNotifyConnect後, 設定sessionCode
    this.app.setHandler<PTCLNotifyConnect>(SystemProtocolName.PTCLNotifyConnect, (sn, ptcl) => {
      sn.setConnectionId(ptcl.connectionId);
      // 收到PTCLNotifyConnect後才算是連線完成
      this.hasSessionCode = true;
    });
  }

  /** 加入房間 */
  public async sendRPCPlayerJoinGame(roomUserToken: string, playerInfo: ServiceUserInfo): Promise<UserJoinGameResult> {
    // 填入資料
    const rpc: RPCUserJoinGame = new RPCUserJoinGame();
    rpc.inRoomUserToken = roomUserToken;
    rpc.inUserInfo = playerInfo;
    // 送RPC
    const result = await this.sendRPC<RPCUserJoinGame>(rpc);
    // rpc防呆
    if (result instanceof PTCLError) {
      console.error(`RPCUserJoinGame result is PTCLError, PTCLError.message: ${result.message}`);
      return UserJoinGameResult.PTCLError;
    }
    return result.outResult;
  }

  /** 送rpc, 等待reply
   * @param rpc
   * @returns
   */
  public async sendRPC<T extends Protocol>(rpc: T): Promise<T | PTCLError> {
    return (await this.app.getSession().rpc(rpc)) as T | PTCLError;
  }

  /** 主動斷線 */
  public disconnect(reason: PTCLDisconnectReason): void {
    this.app.getSession().disconnect(reason);
  }

  /** 是否自動重連
   * @returns 若為true表示網路已回復, 若為false表示放棄自動重連
   */
  public async isAutoConnect(): Promise<boolean> {
    // 剛斷線時navigator.onLine還是true, 稍等x秒再開始偵測
    await this.sleep(this.startDetectOnlineDelaySec);

    // 等待秒數
    let isTimeup = false;
    this.sleep(this.autoConnectTimeoutSec).then(() => {
      isTimeup = true;
    });

    // 等待網路回復, 或超過等待時間
    await this.pendingUntil(() => {
      return navigator.onLine || isTimeup;
    });

    // 就算navigator偵測到有網路, 還需等待數秒才能成功送出封包
    if (navigator.onLine) {
      await this.sleep(this.onlinePrepareDelaySec);
      return true;
    }

    // 若為true表示網路已回復, 若為false表示放棄自動重連
    return false;
  }

  /** 暫停處理broadcastProtocol */
  public pauseBroadcastProtocol(): void {
    // 防呆
    if (this.broadcastProtocolQueue === undefined) {
      console.error('BaseClient.broadcastProtocolPause() error, broadcastProtocolPauser undefined!');
      return;
    }
    this.broadcastProtocolQueue.pause((ptcl) => {
      return ptcl.header.rpcId === Protocol.invalidId;
    });
  }

  /** 解除暫停, 並一次處理之前暫停期間接收的broadcastProtocol */
  public resumeBroadcastProtocol(): void {
    // 防呆
    if (this.broadcastProtocolQueue === undefined) {
      console.error('BaseClient.broadcastProtocolResume() error, broadcastProtocolPauser undefined!');
      return;
    }
    this.broadcastProtocolQueue.resume();
  }

  //#region 由於引用AsyncHelper會有client端、server端、phaser端路徑不同的問題, 在這邊自己實作
  /** async wait for given seconds
   * @param seconds sleep seconds
   */
  public sleep(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  /** pending a promise until the given function returns true
   * @param func function to determine resolve
   * @param thisArg object as parameter (optional)
   */
  public async pendingUntil(func: (this: void) => boolean, thisArg?: undefined): Promise<void> {
    while (true) {
      await this.sleep(0.1);

      if (func.call(thisArg)) {
        return Promise.resolve();
      }
    }
  }
  //#endregion
}
