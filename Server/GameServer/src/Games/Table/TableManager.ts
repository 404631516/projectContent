import TableData from './TableData';
//#region 匯入json
import BrickBreakerGridTableJson from './BrickBreakerGridData.json';
import BrickBreakerEventTableJson from './BrickBreakerEventData.json';
import BrickBreakerItemTableJson from './BrickBreakerItemData.json';
import { GridDestroyType } from '../../NetProtocol/BrickBreakerStructure';

/** 靜態表Manager */
export default class TableManager {
  /** BrickBreaker地圖格子 */
  public static brickBreakerGrid: Readonly<TableData<BrickBreakerGridData>> = new TableData(BrickBreakerGridTableJson);
  /** BrickBreaker格子觸發事件 */
  public static brickBreakerEvent: Readonly<TableData<BrickBreakerEventData>> = new TableData(
    BrickBreakerEventTableJson
  );
  /** BrickBreaker寶物類型 */
  public static brickBreakerItem: Readonly<TableData<BrickBreakerItemData>> = new TableData(BrickBreakerItemTableJson);
}

/** BrickBreaker地圖格子資料 */
export interface BrickBreakerGridData {
  /** 流水號 */
  id: number;
  /** enum對應英文 */
  nameKey: string;
  /** 中文說明 */
  name: string;
  /** 格子破壞類型 */
  gridDestroyType: GridDestroyType;
  /** 格子重生秒數 */
  regenerateTime: number;
}

/** BrickBreaker格子觸發事件資料 */
export interface BrickBreakerEventData {
  /** 流水號 */
  id: number;
  /** enum對應英文 */
  nameKey: string;
  /** 紅磚觸發此事件的機率 */
  brickTriggerChance: number;
  /** 寶物觸發此事件的機率 */
  treasureTriggerChance: number;
  /** 寶箱觸發此事件的機率 */
  answerTreasureTriggerChance: number;
  /** 本事件是否需要答題 */
  isAnswer: boolean;
}

export interface BrickBreakerItemData {
  /** 流水號 */
  id: number;
  /** enum對應英文 */
  nameKey: string;
  /** 道具持有數量上限 */
  numberMax: number;
}
