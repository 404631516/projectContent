import { Protocol } from './Protocol';
import { ProtocolView } from './ProtocolView';
import { Session } from './Session';

/** ProtocolHandler */
export type ProtocolHandler<T extends Protocol> = (sn: Session, ptcl: T) => void;

/** 過濾protocol
 * @return 回傳true表示繼續invoke流程
 */
export type CustomProtocolHandler = (sn: Session, ptcl: Protocol) => boolean;

/** redirect給別的ProtocolObservable處理 */
export type RedirectProtocolHandler = (sn: Session, ptcl: Protocol) => ProtocolObservable | undefined;

export class ProtocolObservable {
  /** 封包handler map, key: 要處理的PTCL名稱, value: 對應ProtocolHandler */
  private handlerMap = new Map<string, ProtocolHandler<any>>();

  /** rpc封包map, key: rpcId, value: rpc callback */
  private rpcMap = new Map<number, (rpc: Protocol) => void>();

  /** QueueHandler, queue指定封包 */
  private queueHandler?: CustomProtocolHandler;

  /** CustomHandler, 客製化過濾封包 */
  private customHandler?: CustomProtocolHandler;

  /** redirect給另一個ProtocolObservable處理 */
  private redirectProtocolHandler?: RedirectProtocolHandler;

  /** 對某個sessoin觸發protocol
   * @param sn 要觸發session
   * @param ptcl 發生的protocol
   */
  public invoke(sn: Session, ptcl: Protocol, rpc: boolean = false): boolean {
    if (ptcl == null || sn == null) {
      return false;
    }

    // 非系統Protocol
    if (ptcl.isSystemProtocol() === false) {
      // QueueHandler, queue指定封包
      if (this.queueHandler !== undefined) {
        // 判斷是否繼續
        if (this.queueHandler(sn, ptcl) === false) {
          return true;
        }
      }

      // CustomHandler, 客製化過濾封包
      if (this.customHandler !== undefined) {
        // 判斷是否繼續
        if (this.customHandler(sn, ptcl) === false) {
          return true;
        }
      }
    }

    // 是否要redirect給另一個ProtocolObservable處理
    if (this.redirectProtocolHandler != null) {
      const redirectProtocolObservable = this.redirectProtocolHandler(sn, ptcl);
      if (redirectProtocolObservable !== undefined) {
        return redirectProtocolObservable.invoke(sn, ptcl, rpc);
      }
    }

    // 處理RPC相關
    if (rpc && ptcl.header.rpcId != null) {
      const rpcHandler = this.rpcMap.get(ptcl.header.rpcId);
      if (rpcHandler != null) {
        rpcHandler(ptcl);
        this.rpcMap.delete(ptcl.header.rpcId);
      } else {
        console.error(`ProtocolObservable.Invoke ${ptcl.header.ptclName} rpc callback not found!`);
      }
    }

    const handler = this.handlerMap.get(ptcl.getName());
    if (handler == null) {
      const ptclName = ptcl.getName();
      console.debug(`ProtocolObservable.Invoke ${ptclName} callback not found!`);
      return false;
    }

    handler(sn, ptcl);
    return true;
  }

  /** 設定handler
   * @param type 要監聽的protocol type
   * @param handler handler
   */
  public setHandler<T extends Protocol>(ptclName: string, handler: ProtocolHandler<T>): void {
    if (this.handlerMap.get(ptclName) != null) {
      console.warn(`ProtocolObservable.SetHandler protocol ${ptclName} already set, replace old one!`);
    }
    this.handlerMap.set(ptclName, handler);
  }

  /** 取得Handler
   * @param name 要取得handler的名稱
   */
  public getHandler(name: string): ProtocolHandler<any> | undefined {
    return this.handlerMap.get(name);
  }

  /** 取得全部的Protocol名稱
   * @param ignoreSystemProtocol 忽略系統Protocol
   */
  public getAllProtocolNames(ignoreSystemProtocol: boolean = true): string[] {
    const result = new Array<string>();
    // tslint:disable-next-line: forin
    for (const k in this.handlerMap.keys()) {
      result.push(k);
    }
    return result.filter((ptclName) => {
      const protocol = ProtocolView.generateProtocol(ptclName);
      return (ignoreSystemProtocol && protocol && protocol.isSystemProtocol()) === false;
    });
  }

  /** 複製handler到目標
   * @param observable 要複製的目標
   */
  public copyTo(observable: ProtocolObservable): void {
    this.handlerMap.forEach((handler: ProtocolHandler<any>, key: string) => {
      observable.handlerMap.set(key, handler);
    });
  }

  /** 設定全部Protocol都會呼叫的handler
   * @param handler handler
   */
  public setQueueHandler(handler: CustomProtocolHandler): void {
    // queueHandler不可重複設定
    if (this.queueHandler !== undefined) {
      console.error(`ProtocolObservable.setQueueHandler() error, queueHandler already set!`);
      return;
    }
    this.queueHandler = handler;
  }

  /** 清空queueHandler */
  public clearQueueHandler(): void {
    this.queueHandler = undefined;
  }

  /** 設定全部Protocol都會呼叫的handler
   * @param handler handler
   */
  public setCustomHandler(handler: CustomProtocolHandler): void {
    if (this.customHandler !== undefined) {
      console.error(`ProtocolObservable.setCustomHandler() error, customHandler already set!`);
      return;
    }
    this.customHandler = handler;
  }

  /** 設定redirectProtocolHandler
   * @param handler handler
   */
  public setRedirectProtocolHandler(handler: RedirectProtocolHandler): void {
    if (this.redirectProtocolHandler !== undefined) {
      console.error(`ProtocolObservable.setRedirectProtocolHandler() error, redirectProtocolHandler already set!`);
      return;
    }
    this.redirectProtocolHandler = handler;
  }

  /** 建立一個rpc呼叫
   * @param rpcId rpc編號
   * @param handler 回呼函式
   */
  public createRpcRequest(rpcId: number, handler: (rpc: Protocol) => void): void {
    this.rpcMap.set(rpcId, handler);
  }
}
