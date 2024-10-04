import { AdornmentItemData, AdornmentLevelData } from '@/manager/TableManager';

/** 裝飾物位置 */
export interface AdornmentPosition {
  /** 裝飾物位置UID */
  farmMapUnitUid: number;
  /** 使用者UID */
  uid: number;
  /** 基地頁面UID */
  farmMapUid: number;
  /** 基地頁面ID */
  farmMapId: number;
  /** 裝飾物在頁面上的位置 */
  mapIndex: number;
  /** 方向 */
  directionType: number;
  /** 道具ID */
  itemId: number;
}

/** 基地頁面 */
export interface PersonalBase {
  /** 頁面UID */
  farmMapUid: number;
  /** 頁面ID */
  farmMapId: number;
  /** 頁面經驗 */
  operationPoint: number;
  /** 佈置分數 */
  adornmentScore: number;
}

/** 所有房間和裝飾物API回傳資料格式 */
export interface MapData {
  /** 基地頁面 */
  mapData: PersonalBase;
  /** 裝飾物列表 */
  units: AdornmentPosition[];
}

/**裝飾物列表內容*/
export interface AdornmentListData extends AdornmentItemData {
  /**背包數量 */
  backpackNum: number;
  /**交易標記 */
  itemUid: number;
}

/** 同學資料 */
export interface ClassmateData {
  /** 使用者UID */
  uid: number;
  /** 名字 */
  name: string;
  /** 代表英雄 */
  heroId: number;
}

/** 房間狀態 */
export interface RoomStatus {
  /** 房間列表 */
  roomList: PersonalBase[];
  /** 等級資料 */
  levelData: AdornmentLevelData;
}
