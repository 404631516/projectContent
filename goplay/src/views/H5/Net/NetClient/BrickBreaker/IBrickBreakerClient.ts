import IBaseClient from '../BaseClient/IBaseClient';
import { PTCLBrickBreakerRankData } from '../../NetProtocol/BrickBreakerProtocol';
import {
  BrickBreakerAvatarData,
  BrickBreakerAvatarUpdateData,
  BrickBreakerBossData,
  BrickBreakerGrid,
} from '../../NetProtocol/BrickBreakerStructure';

export default interface IBrickBreakerClient extends IBaseClient {
  /** 玩家資料更新 */
  onAvatarUpdate(updateData: BrickBreakerAvatarUpdateData, avatarData: BrickBreakerAvatarData): void;
  /** 地圖資料更新 */
  onGridUpdate(grid: BrickBreakerGrid): void;
  /** 魔王資料更新 */
  onBossUpdate(bossData: BrickBreakerBossData): void;
  /** 斷線重連通知 */
  onReconnect(): void;
  /** 收到結算資料 */
  onRankData(ptclRankData: PTCLBrickBreakerRankData): void;
}
