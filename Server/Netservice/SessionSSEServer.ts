import cors from 'cors';
import express from 'express';
import { AddressInfo } from 'net';
import SseStream from './SseStream';
import {
  IProtocol,
  Protocol,
  PTCLConnected,
  PTCLDisconnected,
  PTCLDisconnectReason,
  PTCLNotifyConnect,
} from '../Netbase/Protocol';
import { ProtocolView } from '../Netbase/ProtocolView';
import { ISessionConnectOption, Session } from '../Netbase/Session';
import { getSessionProvider as getClientSessionProvider } from '../Netbase/SessionSSEClient';
import ProfilerSystem from './ProfilerSystem';
import { ISessionSSEServerOption, ServerSessionProvider } from './ServerSessionProvider';
import SessionHelper from '../Netbase/SessionHelper';
import crypto from 'crypto';

class ClientSession extends Session {
  private sseStream: SseStream;
  private rpcResponses = new Map<number, express.Response>();

  /** key: ptclName, value: x秒內call了幾次 */
  private ptclCallAtMap: Map<string, number[]> = new Map<string, number[]>();

  /** 呼叫重置時間, 同一個ptcl在這個時間呼叫過幾次 */
  private readonly callCountResetMilliSec: number = 10000;
  /** 同一個ptcl在呼叫重置時間內, 呼叫次數上限, 超過則視作不正常的連線 */
  private readonly callCountMaxInResetTime: number = 15;

  constructor(sseStream: SseStream, uid: number, connectionId: number) {
    super();
    this.sseStream = sseStream;
    this.setId(uid);
    this.setConnectionId(connectionId);
  }

  public start(): Promise<boolean> {
    return Promise.resolve(true);
  }

  public send(ptcl: Protocol): Promise<boolean> {
    const data = JSON.stringify(ptcl);
    this.sseStream.write({
      event: 'm',
      data,
    });

    // 計算送出封包size
    if (ProfilerSystem.isEnable) {
      const sendSize = data.length;
      ProfilerSystem.onSend(sendSize);
    }

    return Promise.resolve(true);
  }

  public reply(ptcl: Protocol): Promise<boolean> {
    const res = this.rpcResponses.get(ptcl.header.rpcId);
    if (res == null) {
      console.error(`ClientSession.Reply fail, rpcId not exist ${JSON.stringify(ptcl)}`);
      return Promise.resolve(false);
    }
    this.rpcResponses.delete(ptcl.header.rpcId);
    res.json(ptcl);
    return Promise.resolve(true);
  }

  public rpc(ptcl: Protocol): Promise<Protocol> {
    throw new Error('Method not implemented.');
  }

  /** 把clientSession強制斷線
   * @param reason 強制斷線reason
   */
  public disconnect(reason: PTCLDisconnectReason): boolean {
    // 送PTCLDisconnected給client, 通知對方斷線
    const ptclDisconnected = new PTCLDisconnected();
    ptclDisconnected.reason = reason;
    this.send(ptclDisconnected);
    // server端主動斷線
    this.sseStream.close();
    return true;
  }

  public isConnected(): boolean {
    throw new Error('Method not implemented.');
  }

  /** 上線處理 */
  public onConnect(): void {
    const ptclNotifyConnect = new PTCLNotifyConnect();
    ptclNotifyConnect.connectionId = this.connectionId;
    this.send(ptclNotifyConnect);
  }

  /** rpc的封包加進rpcResponses map
   * @param ptcl
   * @param res
   */
  public pushRpcResponse(ptcl: Protocol, res: express.Response): void {
    if (this.rpcResponses.get(ptcl.header.rpcId)) {
      console.error(`ClientSession.CreateRpc fail, rpcId exist ${JSON.stringify(ptcl)}`);
      return;
    }
    this.rpcResponses.set(ptcl.header.rpcId, res);
  }

  /** 檢查短時間內重複傳送封包數量是否過量
   * @param ptclName 新進封包ptclName
   * @returns 若為true, 表示封包過量. 若為false, 表示封包正常
   */
  public isPTCLOverload(ptclName: string): boolean {
    const now = Date.now();

    // 該ptclName call的次數紀錄
    let ptclCallAt = this.ptclCallAtMap.get(ptclName);
    // 不曾call過這個ptcl, 紀錄now以後回傳
    if (ptclCallAt === undefined) {
      this.ptclCallAtMap.set(ptclName, [now]);
      return false;
    }

    // 第一筆呼叫時間
    const firstCallAt = ptclCallAt[0];
    // 比對第一筆呼叫時間, 若已超過timeout時間, 重置呼叫紀錄
    if (now - firstCallAt > this.callCountResetMilliSec) {
      ptclCallAt = [now];
      return false;
    }

    // 紀錄呼叫時間
    ptclCallAt.push(now);

    // 比較呼叫次數是否超出上限
    if (ptclCallAt.length <= this.callCountMaxInResetTime) {
      return false;
    }

    // 呼叫次數超出上限, 視為不正常呼叫, 斷線之
    console.warn(
      `same PTCL call count max! uid ${this.getId()}, ptclName: ${ptclName}, call count: ${ptclCallAt.length}`
    );
    return true;
  }
}

class ServerSession extends Session {
  private clientSessions = new Map<number, ClientSession>();
  private option: ISessionSSEServerOption;
  /** 玩家下線後回收的connectionId, 若有新玩家上線就優先從此清單派connectionId給他 */
  private unuseConnectionIds: number[] = [];
  /** unuseConnectionIds為空時要派的connectionId, 派完後++ */
  private nextConnectionId: number = 0;

  constructor(option: ISessionSSEServerOption) {
    super();
    this.option = option;
    this.setType(Session.serverSession);

    if (this.option.app == null) {
      const app = express();
      app.use(cors());
      app.use(express.urlencoded());
      app.use(express.json());
      this.option.app = app;
      option.app = app;
      const listener = app.listen(option.port, () => {
        const address = listener.address() as AddressInfo;
        console.log(`Create express server ready on port ${address.port}, SSE path ${this.option.path}`);
      });
    }

    // 建立SSE連線
    this.option.app.get(this.option.path, (req, res) => {
      // 取得UID
      const uid = this.getUid(req);
      if (uid === undefined) {
        // TODO 錯誤: 無效Token
        return res.json({ success: false, message: 'invalidToken' });
      }

      // 踢掉舊的
      const oldSession = this.clientSessions.get(uid);
      if (oldSession) {
        console.log('duplicate connect, uid: ' + uid);
        // service斷線處理
        this.onClientSessionDisconnect(oldSession);
        // 通知對方斷線
        oldSession.disconnect(PTCLDisconnectReason.DuplicateConnection);
      }

      // 建立SSE stream
      const sseStream = new SseStream(req);
      sseStream.pipe(res);

      // new ClientSession, 記住connectionId, 之後client端送封包會拿connectionId來驗證
      const clientSession = new ClientSession(sseStream, uid, this.getNewConnectionId());
      this.clientSessions.set(uid, clientSession);
      // ProfilerSystem 紀錄連線數
      if (ProfilerSystem.isEnable) {
        ProfilerSystem.updateConnectionCount(this.clientSessions.size);
      }

      // 連線成功通知
      this.invoke(clientSession, new PTCLConnected());

      // 傳送PTCLNotifyConnect, 帶有本次連線的connectionId, client端收到此包後才算連線完成
      clientSession.onConnect();

      // 註冊關閉事件
      res.on('close', () => {
        // ClientSession斷線處理
        this.onClientSessionDisconnect(clientSession);
        // 回收無人使用之connectionId
        this.unuseConnectionIds.push(clientSession.connectionId);
        // sseStream關閉
        sseStream.unpipe(res);
        sseStream.end();
      });
    });

    // 收到PTCL, 丟給對應clientSession處理
    this.option.app.post(this.option.path, (req, res) => {
      // TODO 定義統一個回傳格式
      if (req.header('Content-Type') !== 'application/json') {
        return res.json({ success: false, message: 'onlySupportJsonContentType' });
      }

      // 取得UID
      const uid = this.getUid(req);
      if (uid === undefined) {
        // 錯誤: 無效Token
        return res.json({ success: false, message: 'invalidToken' });
      }

      const clientSession = this.clientSessions.get(uid);
      if (clientSession == null) {
        // TODO 定義統一個回傳格式
        return res.json({ success: false, message: 'sessionNotExist' });
      }

      // TODO 檢查JSON 格式
      const ptclRaw = req.body as IProtocol;
      if (ptclRaw.header == null || ptclRaw.header.ptclName == null) {
        return res.json({ success: false, message: `invalidProtocol ${req.body}` });
      }

      // 封包hash比對: 跟header.sessionId(實際上為內容hash)做比對, 確認傳上來的封包是否有被竄改過
      const signString = SessionHelper.getPTCLSignString(req.body, clientSession.connectionId);
      // md5
      const hashValue = crypto.createHash('md5').update(signString).digest('hex');
      // 比對md5結果是否相同
      if (hashValue !== req.header('Connection-Id')) {
        console.error(`PTCLSignString verify failed! uid: ${uid}, ptclName: ${ptclRaw.header.ptclName}`);
        // 封包遭到竄改
        return res.json({ success: false, message: `invalidProtocol ${req.body}` });
      }

      const ptcl = ProtocolView.generateProtocol(ptclRaw.header.ptclName, ptclRaw);
      if (ptcl == null) {
        return res.json({ success: false, message: `invalidProtocol ${req.body}` });
      }

      // 計算收到封包size
      if (ProfilerSystem.isEnable) {
        const receiveSize = req.get('content-length');
        ProfilerSystem.onReceive(Number(receiveSize));
      }

      ptcl.setId(clientSession.getId());

      // 檢查是否需要RPC
      if (ptcl.header.rpcId != null) {
        clientSession.pushRpcResponse(ptcl, res);
        this.invoke(clientSession, ptcl);
      } else {
        this.invoke(clientSession, ptcl);
        res.json({ success: true });
      }
    });

    // 每個PTCL進來多做的檢查
    this.setCustomHandler((sn, ptcl) => {
      const clientSession: ClientSession = sn as ClientSession;
      const ptclName = ptcl.getName();
      // 檢查短時間內重複傳送封包, 若有不正常封包傳送就斷線
      const isOverload = clientSession.isPTCLOverload(ptclName);
      if (isOverload) {
        // 斷線
        clientSession.disconnect(PTCLDisconnectReason.CallCountMax);
      }
      return isOverload === false;
    });
  }

  /** ClientSession斷線處理
   * @param clientSession
   */
  private onClientSessionDisconnect(clientSession: Session): void {
    // 取得最新的ClientSession
    const currentClientSession = this.clientSessions.get(clientSession.getId());
    if (currentClientSession === undefined) {
      console.error(`onClientSessionDisconnect() error, currentClientSession undefined! uid: ${clientSession.getId()}`);
      return;
    }
    // 已處理過斷線, return
    if (clientSession.connectionId !== currentClientSession.connectionId) {
      return;
    }
    // 通知內部PTCLDisconnected
    this.invoke(clientSession, new PTCLDisconnected());
    // 從map移除
    this.clientSessions.delete(clientSession.getId());
    // ProfilerSystem 紀錄連線數
    if (ProfilerSystem.isEnable) {
      ProfilerSystem.updateConnectionCount(this.clientSessions.size);
    }
  }

  public start(): Promise<boolean> {
    return Promise.resolve(true);
  }

  public disconnect(reason: PTCLDisconnectReason): boolean {
    throw new Error('Method not implemented.');
  }

  public isConnected(): boolean {
    throw new Error('Method not implemented.');
  }

  public async send(ptcl: Protocol, target?: number | number[]): Promise<boolean> {
    if (target === undefined) {
      console.error(`Session.Send fail, target is undefined`);
      return false;
    }

    if (typeof target === 'number') {
      const uid = target as number;
      const clientSession = this.clientSessions.get(uid);
      if (clientSession === undefined) {
        console.error(`Session.Send fail, target id [${uid}] is not found `);
        return false;
      }
      return await clientSession.send(ptcl);
    } else {
      const uids = target as number[];
      let isSuccess = false;
      const sessions = new Array<Session>();
      uids.forEach((uid) => {
        isSuccess = true;
        const clientSession = this.clientSessions.get(uid);
        if (clientSession !== undefined) {
          sessions.push(clientSession);
        }
      });
      await Promise.all(sessions.map((sn) => sn.send(ptcl)));
      return isSuccess;
    }
  }

  public rpc(ptcl: Protocol): Promise<Protocol> {
    throw new Error('Method not implemented.');
  }

  public reply(ptcl: Protocol): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  private getUid(req: express.Request): number | undefined {
    // 取得Token
    const token = req.header('token');
    if (token === undefined) {
      // 錯誤: Header找不到Token
      return undefined;
    }

    // 取得UID
    const uid = this.option.uidDecoder(token);
    if (isNaN(uid)) {
      // 錯誤: Token轉碼失敗
      return undefined;
    }

    return uid;
  }

  /** 取得新連線要派發的connectionId */
  private getNewConnectionId(): number {
    // 取出當前無人使用的connectionId
    const reuseConnectionId = this.unuseConnectionIds.pop();
    // 回傳當前無人使用的connectionId
    if (reuseConnectionId !== undefined) {
      return reuseConnectionId;
    }
    // 若connectionId都派光了, 則再生成新的connectionId派出
    else {
      const newConnectionId = this.nextConnectionId;
      this.nextConnectionId++;
      return newConnectionId;
    }
  }
}

class SessionSSEProvider extends ServerSessionProvider {
  private app = express();

  constructor() {
    super();
  }

  public createClientSession(option: ISessionConnectOption): Session {
    return getClientSessionProvider().createClientSession(option);
  }

  public createServer(option: ISessionSSEServerOption): Session {
    const serverSession = new ServerSession(option);
    return serverSession;
  }
}

const sseSessionProvider = new SessionSSEProvider();

export function getSessionProvider() {
  return sseSessionProvider;
}
