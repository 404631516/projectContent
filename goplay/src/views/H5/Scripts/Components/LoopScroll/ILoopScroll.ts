export interface CellRange {
  cellHeight: number;
  cellWidth: number;
}

/** 無限循環的參數 */
export interface ILoopScroll {
  /** 清單右邊界 */
  rightMargin: number;
  /** 清單下邊界 */
  bottomMargin: number;

  /** 物件池大小 */
  poolSize: number;
  /** cell的間隔 */
  cellSpace: number;
  /** cell範圍清單 */
  cellRangeList: CellRange[];
  /** cell物件池定義 */
  scrollConfig: Phaser.Types.GameObjects.Group.GroupConfig;
}

/** 無限捲軸清單-捲動方向 */
export enum LoopScrollDirection {
  None,
  Up,
  Down,
  Right,
  Left,
  /** 通用方向-前(左上) */
  Front,
  /** 通用方向-後(右下) */
  Back,
}
