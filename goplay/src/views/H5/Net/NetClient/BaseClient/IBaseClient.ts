import { PTCLDisconnectReason } from '../../Netbase/Protocol';

export default interface IBaseClient {
  /** 斷線 */
  onDisconnected(reason: PTCLDisconnectReason): void;
  /** 遊戲開始 */
  onGameStart(): void;
  /** 遊戲結束 */
  onGameEnd(): void;
}
