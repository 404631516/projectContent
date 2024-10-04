import { ContestGameAward } from '@/helper/interface/Contest';
import { TaskState } from '@/helper/enum/Task';

/** 任務資料 */
export interface TaskData {
  /**任務ID */
  questGroupId: number;
  /**任務名稱 */
  questName: string;
  /**任務敘述 */
  description: string;
  /**任務狀態 */
  flag: TaskState;
  /**目前進度值 */
  userValue: number;
  /**任務要求條件 */
  reqKey: string;
  /**任務要求次數(進度目標值) */
  reqValue: number;
  /**完成期限 */
  expiredDayId: number;
  /**任務禮包編號 */
  giftPack: number;
  /**任務需要前往的網址 */
  webLink: string;
  /**禮包圖示檔名 */
  giftPackIconName: string;
  /**獎勵資料 */
  itemDatas: ContestGameAward[];
}
