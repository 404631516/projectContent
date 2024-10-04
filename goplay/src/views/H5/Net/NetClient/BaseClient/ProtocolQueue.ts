import { Protocol } from '../../Netbase/Protocol';
import { ProtocolObservable } from '../../Netbase/ProtocolObservable';
import { Session } from '../../Netbase/Session';

/** 封包接收暫停器 */
export class ProtocolQueue {
  /** 暫停期間收到的Protocol */
  private ptclQueue: Array<{ sn: Session; ptcl: Protocol }> = [];

  /** constructor
   * @param protocolObservable 要取代CustomProtocolHandler的目標
   * @param queueCondition 判斷該protocol是否需要queue起來的判斷式
   */
  constructor(private protocolObservable: ProtocolObservable) {}

  /** 將符合條件的PTCL存起來, 等到resume()後再處理
   * @param queueCondition 要queue的條件
   */
  public pause(queueCondition: (ptcl: Protocol) => boolean): void {
    // setCustomHandler, 將符合條件的PTCL存起來, 沒符合條件的就不管它
    this.protocolObservable.setQueueHandler((sn, ptcl) => {
      const isProtocolQueue = queueCondition(ptcl);
      if (isProtocolQueue) {
        this.ptclQueue.push({ sn, ptcl });
      }
      // 若符合queue條件就回傳false, 等resume()時再處理
      return isProtocolQueue === false;
    });
  }

  /** 開始處理queue起來的PTCL, 並重新開始接收PTCL */
  public resume(): void {
    // 清空queueHandler
    this.protocolObservable.clearQueueHandler();
    // 把queue起來的封包丟給session invoke
    for (const sessionAndProtocol of this.ptclQueue) {
      this.protocolObservable.invoke(sessionAndProtocol.sn, sessionAndProtocol.ptcl, false);
    }
    // 資料清空
    this.ptclQueue = [];
  }
}
