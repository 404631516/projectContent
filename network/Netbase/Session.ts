import { Protocol, PTCLDisconnectReason } from './Protocol';
import { ProtocolObservable } from './ProtocolObservable';

/**
 * Session 代表一個連線,或者Server
 */
export abstract class Session extends ProtocolObservable {
  /** RPC的Timeout時間 */
  public static get rpcTimeoutTime(): number {
    return 30;
  }

  public static readonly clientSession = 'Client';
  public static readonly serverSession = 'Server';

  private type: string = '';
  private id: number = Protocol.invalidId;
  private data: any;

  /** 驗證封包竄改用, 來自PTCLNotifyConnect的connectionId, 由server產生, 設定在client session */
  private _connectionId: number = -1;
  /** 取得connectionId */
  public get connectionId(): number {
    return this._connectionId;
  }

  /** 取得字串格式的資訊 */
  public getInfo(): string {
    return `[${this.getType()}:${this.getId()}]`;
  }

  /** 取得Sessoin Type */
  public getType(): string {
    return this.type;
  }

  /** 設定Session Type
   * @param type Type
   */
  public setType(type: string): void {
    this.type = type;
  }

  /** 設定connectionId
   * @param connectionId connectionId
   */
  public setConnectionId(connectionId: number): void {
    this._connectionId = connectionId;
  }

  /** 取得User data.必須跟設定同樣的類型 */
  public getData<T>(): T {
    return this.data as T;
  }

  /** 設定User data
   * @param data User data
   */
  public setData(data: any): void {
    this.data = data;
  }

  /** 判斷是否為某個Session type
   * @param type 要判斷的Session type
   */
  public isType(type: string): boolean {
    return this.type.toLowerCase() === type.toLowerCase();
  }

  /** 取得ID. Service則回ServiceId, Client則為UserId */
  public getId(): number {
    return this.id;
  }

  /** 設定ID.
   * @param id ID
   */
  public setId(id: number): void {
    this.id = id;
  }

  /** 啟動Session */
  public abstract start(): Promise<boolean>;

  public abstract send(ptcl: Protocol, target?: number | number[]): Promise<boolean>;
  public abstract reply(ptcl: Protocol): Promise<boolean>;
  public abstract rpc(ptcl: Protocol): Promise<Protocol>;

  public abstract disconnect(reason: PTCLDisconnectReason): boolean;

  public abstract isConnected(): boolean;
}

/** Client Session用參數 */
export interface ISessionConnectOption {
  url: string;
  token: string;
}

/** Sessoin Provider */
export abstract class SessionProvider {
  public abstract createClientSession(option: ISessionConnectOption): Session;
}
