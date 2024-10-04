import { AdornmentPosition } from '@/helper/interface/Adornment';
import { AdornmentItemData, AdornmentRoomData } from '@/manager/TableManager';
import AdornmentComponent from '../Components/AdornmentComponent';

/** 房間佈置的樓層無限捲軸資料 */
export interface AdornmentFloorCellData {
  /** 房間佈置的房間無限捲軸資料 */
  roomCellDataList: AdornmentRoomCellData[];
  /** 最下層 */
  isBottom: boolean;
}

/** 房間佈置的房間無限捲軸資料 */
export interface AdornmentRoomCellData {
  /** 房間靜態表 */
  roomData: AdornmentRoomData;
  /** 已放置裝飾物
   * 1.解鎖房間時，要連結已放置裝飾物陣列到無限循環的資料中，之後就會自動刷新無限循環
   * 2.遊戲啟始時，已解鎖的房間的已放置裝飾物陣列，會參照到無限循環的資料中，當放置新裝飾物時就會自動刷新無限循環
   */
  putAdornmentList: AdornmentPosition[];
  /** 此房間的英雄 */
  heroList: number[];
}

/** 擁有的裝飾物 */
export interface AdornmentItem {
  /** 裝飾物-靜態表 */
  itemData: AdornmentItemData;
  /** 擁有數 */
  count: number;
}

/** 拖放裝飾物資料 */
export interface DropAdornmentData {
  /** 裝飾物 */
  adornmentComponent: AdornmentComponent;
  /** 可放置區提示圖 */
  dropZoneImage: Phaser.GameObjects.Image;
  /** 拖放提示圖 */
  dropHintImage: Phaser.GameObjects.Image;
}
