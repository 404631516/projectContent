import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import EventSource from 'eventsource';
import {
  ErrorSystemError,
  IProtocol,
  Protocol,
  PTCLConnected,
  PTCLDisconnected,
  PTCLDisconnectReason,
  PTCLError,
} from './Protocol';
import SessionHelper from './SessionHelper';
import { ProtocolView } from './ProtocolView';
import { ISessionConnectOption, Session, SessionProvider } from './Session';
import { Md5 } from 'ts-md5';

class RpcId {
  public static create(): number {
    const rpcId = RpcId.counter;
    if (RpcId.counter > RpcId.max) {
      RpcId.counter = 0;
    } else {
      RpcId.counter++;
    }
    return rpcId;
  }

  private static readonly max = 4096;
  private static counter = 0;
}

class SessionSSEClient extends Session {
  private eventSource: EventSource | undefined;
  private option: ISessionConnectOption;
  private axios: AxiosInstance;

  constructor(option: ISessionConnectOption) {
    super();
    this.setType(Session.clientSession);
    this.option = option;
    const config: AxiosRequestConfig = {
      baseURL: this.option.url,
    };
    config.headers = { 'Content-Type': 'application/json' };
    config.headers.token = this.option.token;
    this.axios = axios.create(config);
  }

  public start(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let tryConnect = true;
      let isConnected = false;
      this.eventSource = new EventSource(this.option.url, { headers: { token: this.option.token } });

      // TODO 優化封包處理,不要重複程式碼
      this.eventSource.addEventListener('m', (packet): void => {
        try {
          const ptclRaw: Protocol = JSON.parse(packet.data);
          if (ptclRaw == null || ptclRaw.header == null || ptclRaw.header.ptclName == null) {
            throw { result: 'ProtocolParse', resMessage: 'Can not parse protocol, data = ' + packet.data };
          }

          const ptcl = ProtocolView.generateProtocol(ptclRaw.header.ptclName, ptclRaw);
          if (ptcl != null) {
            this.invoke(this, ptcl);
          }
        } catch (e) {
          console.error(e);
          const ptcl = new PTCLError();
          ptcl.message = typeof e === 'string' ? e : JSON.stringify(e);
          this.invoke(this, ptcl);

          const resMessage = ptcl.message;
          throw { result: 'systemError', resMessage };
        }
      });

      this.eventSource.onopen = () => {
        isConnected = true;
        tryConnect = false;
        this.invoke(this, new PTCLConnected());
        resolve(true);
      };

      this.eventSource.onerror = (error) => {
        const ptclError = new PTCLError();
        ptclError.message = JSON.stringify(error);
        this.invoke(this, ptclError);

        // 如果連線中,代表尚未成功返回promise
        if (tryConnect) {
          resolve(false);
        }

        // 如果已經連線狀態,回傳disconnect事件
        if (isConnected) {
          isConnected = false;
          const ptclDisconnected = new PTCLDisconnected();
          this.invoke(this, ptclDisconnected);
        }

        this.eventSource?.close();
        this.eventSource = undefined;
      };
    });
  }

  public disconnect(reason: PTCLDisconnectReason): boolean {
    if (this.eventSource === undefined) {
      return false;
    }

    this.eventSource.close();
    this.eventSource = undefined;

    const ptclDisconnected = new PTCLDisconnected();
    ptclDisconnected.reason = reason;
    this.invoke(this, ptclDisconnected);
    return true;
  }

  public isConnected(): boolean {
    if (this.eventSource != null) {
      return this.eventSource.readyState === EventSource.OPEN;
    } else {
      return false;
    }
  }

  public async send(ptcl: Protocol): Promise<boolean> {
    try {
      const response = await this.postProtocol(ptcl);
    } catch (error) {
      if (typeof error === 'string') {
        console.error(error);
      } else if (error instanceof ErrorSystemError) {
        console.error(error.message);
      }
    }
    return true;
  }

  public async rpc(ptcl: Protocol): Promise<Protocol> {
    // 設定rpcId
    ptcl.header.rpcId = RpcId.create();
    // post送出封包

    try {
      const response = await this.postProtocol(ptcl);
      // TODO 檢查 object type
      const rpcPtclRaw = response.data as IProtocol;
      if (rpcPtclRaw == null || rpcPtclRaw.header == null || rpcPtclRaw.header.ptclName == null) {
        const errorMsgParse = `Session.Rpc Can not parse protocol, data = ${JSON.stringify(response.data)}`;
        console.error(errorMsgParse);
        const ptclError = new PTCLError();
        ptclError.message = errorMsgParse;
        return ptclError;
      }

      const rpcPtcl = ProtocolView.generateProtocol(ptcl.header.ptclName, rpcPtclRaw);
      if (rpcPtcl == null) {
        const errorMsgGenerate = `InvalidRPC Protocol ${ptcl.header.ptclName}`;
        console.error(errorMsgGenerate);
        const ptclError = new PTCLError();
        ptclError.message = errorMsgGenerate;
        return ptclError;
      }
      return rpcPtcl;
    } catch (error) {
      // 傳PTCLError出去
      const ptclError = new PTCLError();
      if (typeof error === 'string') {
        ptclError.message = error;
      } else if (error instanceof ErrorSystemError) {
        ptclError.message = error.message;
      }
      return ptclError;
    }
  }

  /** 送PTCL給server
   * @param ptcl Protocol
   */
  private async postProtocol(ptcl: Protocol): Promise<AxiosResponse<any>> {
    // 設定sessionId
    const signString = SessionHelper.getPTCLSignString(ptcl, this.connectionId);
    // md5
    const sessionId = Md5.hashStr(signString);
    // post送出封包
    try {
      return await this.axios.post(this.option.url, ptcl, { headers: { 'Connection-Id': sessionId } });
    } catch (e) {
      throw new ErrorSystemError((e as Error).message);
    }
  }

  public reply(ptcl: Protocol): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

class SessionSSEClientProvider extends SessionProvider {
  public static readonly instance = new SessionSSEClientProvider();
  constructor() {
    super();
  }

  public createClientSession(option: ISessionConnectOption): Session {
    const session = new SessionSSEClient(option);
    return session;
  }
}

export function getSessionProvider() {
  return SessionSSEClientProvider.instance;
}
