import { Scene } from 'phaser';
import { BaseLoopScroll } from './BaseLoopScroll';
import { CellRange, ILoopScroll, LoopScrollDirection } from './ILoopScroll';
import { LoopCell } from './LoopCell';

export type Vector2 = Phaser.Math.Vector2;

/** 水平無限循環清單 */
export default class HorizontalLoopScroll<T> extends BaseLoopScroll<T> {
  //#region data
  /** 依捲動方向，取得格子位置數值
   * @param cell 格子
   */
  protected cellFront(cell: LoopCell<T>): number {
    return cell.x - this.cellHalf(cell);
  }
  /** 取得格子後端(右下)座標
   * @param cell 格子
   */
  protected cellBack(cell: LoopCell<T>): number {
    return cell.x + this.cellHalf(cell);
  }

  /** 取得格子大小的一半
   * @param cell
   */
  protected cellHalf(cell: LoopCell<T>): number {
    const cellRange = this.iLoopScroll.cellRangeList[cell.dataIndex];
    return cellRange.cellWidth / 2;
  }

  /** 依捲動方向，設定格子位置
   * @param cell 格子
   */
  protected setCellPosition(cell: LoopCell<T>, position: number): void {
    cell.x = position;
  }
  /** 依捲動方向，移動格子位置
   * @param cell 格子
   */
  protected moveCellPosition(cell: LoopCell<T>, position: number): void {
    cell.x += position;
  }
  /** 取得容器前端(左上)座標  */
  protected get containerFront(): number {
    return this.leftMargin;
  }
  /** 取得容器後端(右下)座標 */
  protected get containerBack(): number {
    return this.iLoopScroll.rightMargin;
  }

  /** 依捲動方向，取得預定的格子大小
   * @param cellRange 格子大小
   */
  protected getCellRange(cellRange: CellRange): number {
    // iLoopScroll.cellRangeList
    return cellRange.cellWidth;
  }

  /** CELL只顯示一半時的起始座標X */
  protected getShowHalfCellStartX(range: CellRange): number {
    // cell中心點會在容器前緣，提示玩家前面可以捲動
    return this.leftMargin;
  }
  /** CELL只顯示一半時的起始座標Y */
  protected getShowHalfCellStartY(range: CellRange): number {
    // cell前緣會對齊容器前緣
    return this.topMargin + range.cellHeight / 2;
  }

  //#endregion data

  /** 建構子-並指定無限循環的參數
   * @param scene 場景
   * @param x 位置x
   * @param y 位置x
   * @param iLoopScroll 無限循環的參數
   */
  constructor(scene: Scene, x: number, y: number, iLoopScroll: ILoopScroll) {
    super(scene, x, y, iLoopScroll);
  }

  /** 初始化清單cell(排列位置)
   * @param currCell 目前cell
   * @param currCellRange 目前cell範圍
   * @param prevCell 上一個cell
   * @param prevCellRange 上一個cell範圍
   * @param isReverse 反向排列
   */
  protected initLoopCellPosition(
    currCell: LoopCell<T>,
    currCellRange: CellRange,
    prevCell: LoopCell<T>,
    prevCellRange: CellRange,
    isReverse: boolean
  ): void {
    // 跟隨 上一個cell的位置
    currCell.x = prevCell.x;
    currCell.y = prevCell.y;

    // 累加 上一個寬度/2 + 間隔 + 目前寬度/2
    let distance = prevCellRange.cellWidth / 2 + this.iLoopScroll.cellSpace + currCellRange.cellWidth / 2;
    // 反向要乘-1
    if (isReverse) {
      distance *= -1;
    }
    currCell.x += distance;
  }

  /** 觸碰螢幕拖拉 事件
   * @param deltaVector 移動差值
   */
  public onDrag(deltaVector: Vector2): void {
    // 判斷移動方向(左右)
    this.scrollDir = deltaVector.x > 0 ? LoopScrollDirection.Back : LoopScrollDirection.Front;
    // 觸碰時，就移動cell
    this.moveLoopCell(deltaVector.x);
  }
}
