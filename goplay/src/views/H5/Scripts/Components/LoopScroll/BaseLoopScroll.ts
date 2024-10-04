import { Scene } from 'phaser';
import Object2D from '../Object2D';
import { CellRange, ILoopScroll, LoopScrollDirection } from './ILoopScroll';
import { LoopCell } from './LoopCell';

export type Vector2 = Phaser.Math.Vector2;

/** 無限循環清單 */
export abstract class BaseLoopScroll<T> extends Object2D {
  //#region data
  /** 無限循環的參數 */
  protected iLoopScroll: ILoopScroll;

  /** cell物件池 */
  private cellPool!: Phaser.GameObjects.Group;

  /** 已生成的cell陣列 */
  private _loopCellList: Array<LoopCell<T>> = [];
  public get loopCellList(): Array<LoopCell<T>> {
    return this._loopCellList;
  }

  /** 刷新清單的原始資料(靜態表及db資料) */
  private originDataList: T[] = [];

  /** 捲動清單的方向，要捲動時必需指定 */
  protected scrollDir: LoopScrollDirection = LoopScrollDirection.None;

  /** 滑鼠在上個frame的位置, 計算移動量用 */
  protected mousePreviousPos?: Vector2;

  /** 禁止拖曳捲軸 */
  public isForbidDrag: boolean = false;

  /** 捲軸拖曳中 */
  private _isDragging: boolean = false;
  public get isDragging(): boolean {
    return this._isDragging;
  }

  /** 已生成的cell數量 */
  private get loopCellCount(): number {
    return this._loopCellList.length;
  }

  /** 原始資料總數: 由原始資料提供 */
  private get dataCount(): number {
    return this.originDataList.length;
  }

  /** 已捲到第一筆資料的cell */
  private get isReachFrontData(): boolean {
    return this.firstCell.dataIndex === 0;
  }

  /** 已捲到最後一筆資料cell */
  private get isReachBackData(): boolean {
    return this.lastCell.dataIndex === this.dataCount - 1;
  }

  /** 取得第一個cell */
  private get firstCell(): LoopCell<T> {
    // 有資料
    return this._loopCellList[0];
  }

  /** 取得最後一個cell */
  private get lastCell(): LoopCell<T> {
    // 物件池數 > 資料數，回傳池中最後一個
    if (this.loopCellCount > this.dataCount) {
      return this._loopCellList[this.dataCount - 1];
    }

    // 有資料
    return this._loopCellList[this.loopCellCount - 1];
  }

  /** 取得格子前端(左上)座標
   * @param cell 格子
   */
  protected abstract cellFront(cell: LoopCell<T>): number;

  /** 取得格子後端(右下)座標
   * @param cell 格子
   */
  protected abstract cellBack(cell: LoopCell<T>): number;

  /** 依捲動方向，取得預定的格子大小
   * @param cellRange 格子大小
   */
  protected abstract getCellRange(cellRange: CellRange): number;

  /** 依捲動方向，設定格子位置
   * @param cell 格子
   */
  protected abstract setCellPosition(cell: LoopCell<T>, position: number): void;

  /** 依捲動方向，偏移格子位置
   * @param cell 格子
   */
  protected abstract moveCellPosition(cell: LoopCell<T>, position: number): void;

  /** 取得容器前端座標  */
  protected abstract get containerFront(): number;

  /** 取得容器後端座標 */
  protected abstract get containerBack(): number;

  /** 取得預定的格子大小
   * @param cell 格子
   */
  protected abstract cellHalf(cell: LoopCell<T>): number;

  /** CELL只顯示一半時的起始座標X */
  protected abstract getShowHalfCellStartX(range: CellRange): number;
  /** CELL只顯示一半時的起始座標Y */
  protected abstract getShowHalfCellStartY(range: CellRange): number;
  //#endregion data

  //#region readonly
  /** 清單左邊界(若要指定其他位置，請確認相關座標) */
  protected readonly leftMargin: number = 0;
  /** 清單上邊界(若要指定其他位置，請確認相關座標) */
  protected readonly topMargin: number = 0;

  /** 觸控時必須移動幾pixel，才觸發拖曳樓層。未超過時不拖曳，以避免拆缷傢俱時發生問題 */
  private readonly touchMoveThreshold = 15;
  //#endregion readonly

  /** 建構子-並指定無限循環的參數
   * @param scene 場景
   * @param x 位置x
   * @param y 位置x
   * @param iLoopScroll 無限循環的參數
   */
  constructor(scene: Scene, x: number, y: number, iLoopScroll: ILoopScroll) {
    super(scene, x, y);

    // 記錄參數
    this.iLoopScroll = iLoopScroll;

    // 檢查物件池數量，足以顯示每一個捲動位置的cell
    if (this.checkCellSize() === false) {
      return;
    }

    // 初始化儲存格
    this.createLoopCell();
  }

  /** 檢查物件池數量，足以顯示每一個捲動位置的cell */
  private checkCellSize(): boolean {
    // 起始索引: 從 0 到 data數-物件池大小 (ex: 0 ~ 10-3)
    const maxStartIndex = this.iLoopScroll.cellRangeList.length - this.iLoopScroll.poolSize;
    for (let startIndex = 0; startIndex <= maxStartIndex; startIndex++) {
      let sumRange = 0;
      // 累加次數 = 物件池大小 (ex: 3)
      for (let times = 0; times < this.iLoopScroll.poolSize; times++) {
        // 累加間隔
        if (times > 0) {
          sumRange += this.iLoopScroll.cellSpace;
        }
        // 檢查索引 = 起始索引 + 次數 (ex: 1+0~3)
        const checkIndex = startIndex + times;
        // 累加cell大小
        const cellRange = this.iLoopScroll.cellRangeList[checkIndex];
        sumRange += this.getCellRange(cellRange);
      }

      // 若未超過容器的大小，就報錯，excel有誤
      if (sumRange < this.containerBack) {
        console.error(`checkCellSize: cell range no enough. startIndex=${startIndex}`);
        return false;
      }
    }

    return true;
  }

  /** 初始化儲存格 */
  private createLoopCell(): void {
    // 建立cell物件池
    this.cellPool = this.scene.add.group(this.iLoopScroll.scrollConfig);

    // 防呆
    if (this.iLoopScroll.poolSize === 0) {
      console.error(`initCellData: poolSize = 0`);
      return;
    }

    // 建立物件池數量的cell
    for (let i = 0; i < this.iLoopScroll.poolSize; i++) {
      // 若是未建立的cell，新增cell
      const cell = this.cellPool.get(0, 0);
      if (cell == null) {
        console.error(`initCellData: cell == null`);
        return;
      }

      this._loopCellList.push(cell);
    }
  }

  /** 重新設定列表
   * @param dataList 原始資料
   */
  public resetList(dataList: T[]): void {
    // 重新設定資料
    this.originDataList = dataList;

    // 建立第一頁的cell，並設置資料
    this.initLoopCellData();
  }

  /** 刷新資料 */
  public refreshList(): void {
    this._loopCellList.forEach((cell) => {
      cell.refresh();
    });
  }

  /** 捲動到最前方時，調整cell位置，並設置資料 */
  private initLoopCellData(): void {
    // 建立物件池數量的cell
    for (let cellIndex = 0; cellIndex < this._loopCellList.length; cellIndex++) {
      const currCell = this._loopCellList[cellIndex];
      // 無資料，中止loop
      if (cellIndex >= this.originDataList.length) {
        break;
      }

      const currCellRange = this.iLoopScroll.cellRangeList[cellIndex];
      // 第一個cell對齊容器左/上方，cell置中於容器
      if (cellIndex === 0) {
        currCell.x = this.leftMargin + currCellRange.cellWidth / 2;
        currCell.y = this.topMargin + currCellRange.cellHeight / 2;
      }
      // 其他的cell跟隨前一個cell
      else {
        const prevIndex = cellIndex - 1;
        const prevCell = this._loopCellList[prevIndex];
        const prevCellRange = this.iLoopScroll.cellRangeList[prevIndex];
        if (prevCellRange == null) {
          console.error(`initCellData: prevCellRange == null. prevIndex=${prevIndex}`);
          return;
        }
        // 正向排列cell
        this.initLoopCellPosition(currCell, currCellRange, prevCell, prevCellRange, false);
      }

      // 刷新cell的資料
      this.refreshCellData(currCell, cellIndex);
    }
  }

  /** 捲動到中間時，調整cell位置，並設置資料
   * @param targetDataIndex 目前資料索引
   */
  private locateLoopCellData(targetDataIndex: number): void {
    // 刷新物件池數量的cell, 從 資料索引-1 開始顯示
    for (let cellIndex = 0; cellIndex < this._loopCellList.length; cellIndex++) {
      const dataIndex = targetDataIndex + cellIndex - 1;
      const currCell = this._loopCellList[cellIndex];
      const currCellRange = this.iLoopScroll.cellRangeList[dataIndex];
      // 第一個cell對齊容器左/上方，cell置中於容器
      if (cellIndex === 0) {
        // 取得水平/垂置的初始位置，會顯示一半的cell，以提示玩家可以捲動
        currCell.x = this.getShowHalfCellStartX(currCellRange);
        currCell.y = this.getShowHalfCellStartY(currCellRange);
      }
      // 其他的cell跟隨前一個cell
      else {
        const prevCellIndex = cellIndex - 1;
        const prevCell = this._loopCellList[prevCellIndex];
        const prevCellRange = this.iLoopScroll.cellRangeList[dataIndex - 1];
        if (prevCellRange == null) {
          console.error(`initCellData: prevCellRange == null. prevIndex=${prevCellIndex}`);
          return;
        }
        // 正向排列cell
        this.initLoopCellPosition(currCell, currCellRange, prevCell, prevCellRange, false);
      }

      // 刷新cell的資料
      this.refreshCellData(currCell, dataIndex);
    }
  }

  /** 捲到最後一筆, 反向建立cell及設置資料 */
  private reverseLoopCellData(): void {
    // 建立物件池數量的cell
    let dataIndex = this.dataCount - 1;
    for (let cellIndex = this.loopCellCount - 1; cellIndex >= 0; cellIndex--) {
      const currCell = this._loopCellList[cellIndex];
      const currCellRange = this.iLoopScroll.cellRangeList[dataIndex];
      // 最後一個cell在容器右/下方，cell置中於容器
      if (cellIndex === this.loopCellCount - 1) {
        currCell.x = this.iLoopScroll.rightMargin - currCellRange.cellWidth / 2;
        currCell.y = this.iLoopScroll.bottomMargin - currCellRange.cellHeight / 2;
      }
      // 其他的cell跟隨前一個cell
      else {
        const prevCellIndex = cellIndex + 1;
        const prevCell = this._loopCellList[prevCellIndex];
        const prevDataIndex = dataIndex + 1;
        const prevCellRange = this.iLoopScroll.cellRangeList[prevDataIndex];
        if (prevCellRange == null) {
          console.error(`reverseLoopCellData: prevCellRange == null. prevCellIndex=${prevCellIndex}`);
          return;
        }
        // 反向排列cell
        this.initLoopCellPosition(currCell, currCellRange, prevCell, prevCellRange, true);
      }

      // 刷新cell的資料
      this.refreshCellData(currCell, dataIndex);

      // 往前處理資料
      dataIndex--;
    }
  }

  /** 排列cell位置
   * @param currCell 目前cell
   * @param currCellRange 目前cell範圍
   * @param prevCell 上一個cell
   * @param prevCellRange 上一個cell範圍
   * @param isReverse 反向排列
   */
  protected abstract initLoopCellPosition(
    currCell: LoopCell<T>,
    currCellRange: CellRange,
    prevCell: LoopCell<T>,
    prevCellRange: CellRange,
    isReverse: boolean
  ): void;

  /** 移動cell效果
   * @param touchDelta 觸碰拖曳偏移量(x或y)
   */
  protected moveLoopCell(touchDelta: number): void {
    // 無資料不需捲動
    if (this.dataCount === 0 || this._loopCellList.length === 0) {
      return;
    }

    // 拖拉到兩端時，是否要中止捲動
    touchDelta = this.adjustScrollByMargin(touchDelta);
    if (touchDelta === 0) {
      return;
    }

    // 依據touch，移動cell
    this._loopCellList.forEach((cell) => {
      this.moveCellPosition(cell, touchDelta);
    });

    const prevFirstCell = this.firstCell;
    const prevLastCell = this.lastCell;

    switch (this.scrollDir) {
      // 內容向前捲動
      case LoopScrollDirection.Front:
        // 若第一個cell後端，超出list前端
        if (this.cellBack(prevFirstCell) < this.containerFront) {
          // 如果已經拉到底部, 不做替換
          if (this.isReachBackData) {
            return;
          }

          // 將POOL中，first cell移到最後一個
          this._loopCellList.shift();
          this._loopCellList.push(prevFirstCell);

          // 最後的cell，資料對應到下一頁，並循環
          const newDataIdx = prevLastCell.dataIndex + 1;
          // 設定 顯示最後一筆資料
          prevFirstCell.setCellData(this.originDataList[newDataIdx], newDataIdx);

          // 之前的first cell的位置 = 上次的last後緣 + 空隔 + 之前first cell大小一半
          this.setCellPosition(
            prevFirstCell,
            this.cellBack(prevLastCell) + this.iLoopScroll.cellSpace + this.cellHalf(prevFirstCell)
          );
        }
        break;

      // 內容向後捲動
      case LoopScrollDirection.Back:
        // 若最後cell前緣，超出list後緣
        if (this.cellFront(prevLastCell) > this.containerBack) {
          // 如果已經拉到頂部, 不做替換
          if (this.isReachFrontData) {
            return;
          }

          // 將list中，end cell移到第一個
          this._loopCellList.pop();
          this._loopCellList.unshift(prevLastCell);

          // 第一個cell，資料對應到上一頁，並循環
          const newDataIdx = prevFirstCell.dataIndex - 1;
          // 設定 顯示最後一筆資料
          prevLastCell.setCellData(this.originDataList[newDataIdx], newDataIdx);

          // 之前的last cell的位置 = 上次的first前緣 - 空隔 - 之前last cell大小一半
          this.setCellPosition(
            prevLastCell,
            this.cellFront(prevFirstCell) - this.iLoopScroll.cellSpace - this.cellHalf(prevLastCell)
          );
        }
        break;

      default:
        break;
    }
  }

  /** 拖拉到兩端時，調整捲動量，使cell停在邊界
   * @returns 回傳0:中止捲動; 其他值: 繼續捲動
   */
  private adjustScrollByMargin(touchDelta: number): number {
    // 最後一個cell的後緣 < list後緣，取消滑動
    if (this.cellBack(this.lastCell) < this.containerBack) {
      return 0;
    }

    // 拖拉到兩端時
    switch (this.scrollDir) {
      // 內容向後捲動
      case LoopScrollDirection.Back:
        if (this.isReachFrontData) {
          // 第一個cell前緣捲進list前緣內, 會停在list前緣
          if (this.cellFront(this.firstCell) + touchDelta > this.containerFront) {
            // 校正過的drag量
            return this.containerFront - this.cellFront(this.firstCell);
          }
        }
        break;
      // 內容向前捲動
      case LoopScrollDirection.Front:
        if (this.isReachBackData) {
          // 最後cell後緣捲進list後緣內, 會停在list後緣
          if (this.cellBack(this.lastCell) + touchDelta < this.containerBack) {
            // 校正過的drag量
            return this.containerBack - this.cellBack(this.lastCell);
          }
        }
        break;
    }

    return touchDelta;
  }

  /** 其他系統，設定捲動位置
   * @param targetDataIndex 目標資料索引
   */
  public scrollToDataIndex(targetDataIndex: number): void {
    // 防呆
    if (targetDataIndex < 0 || targetDataIndex >= this.dataCount) {
      console.error(`setScrollIndex: out of range. dataIndex=${targetDataIndex}`);
      return;
    }

    // 指定第一筆資料 或 資料數量<物件池數量
    if (targetDataIndex === 0 || this.dataCount < this.iLoopScroll.poolSize) {
      // 建立第一頁的cell，並設置資料
      this.initLoopCellData();
      return;
    }
    // 若是指定最後一筆資料
    if (targetDataIndex === this.dataCount - 1) {
      // 捲到最後一筆, 反向建立cell及設置資料
      this.reverseLoopCellData();
      return;
    }

    // 檢查指定的資料是可以捲動到的區域
    let isScrollable = false;
    let sumRange = 0;
    for (let dataIndex = targetDataIndex; dataIndex < this.dataCount; dataIndex++) {
      // 累加cell間隔
      sumRange += this.iLoopScroll.cellSpace;
      // 累加cell大小
      const cellRange = this.iLoopScroll.cellRangeList[dataIndex];
      sumRange += this.getCellRange(cellRange);
      // 若累加大小, 到達容器大小時，就是可捲到的區域
      if (sumRange >= this.containerBack) {
        isScrollable = true;
        break;
      }
    }

    // 中間的位置-若是指定的資料是可以捲動到的區域
    if (isScrollable) {
      // 捲動到中間時，調整cell位置，並設置資料
      this.locateLoopCellData(targetDataIndex);
    }
    // 中間的位置-若是指定的資料是不能捲動到的區域
    else {
      // 捲到最後一筆, 反向建立cell及設置資料
      this.reverseLoopCellData();
    }
  }

  /** 刷新cell的資料
   * @param cell 儲存格
   * @param dataIndex 資料索引
   */
  private refreshCellData(cell: LoopCell<T>, dataIndex: number) {
    // 設定資料 (靜態表/動態表資料結構)
    if (dataIndex < this.dataCount) {
      cell.setCellData(this.originDataList[dataIndex], dataIndex);
    }
    // 無資料
    else {
      cell.clearCellData();
    }
  }

  //#region touch
  /** 開始觸碰螢幕 事件
   * @param pointer 點擊座標
   */
  public onTouchStart(pointer: Vector2): void {
    // 鎖定拖曳
    if (this.isForbidDrag) {
      return;
    }
    // 記錄上次座標
    this.mousePreviousPos = pointer;
  }

  /** 觸碰螢幕拖拉 事件
   * @param pointer 點擊座標
   */
  public onTouchMove(pointer: Vector2): void {
    // 禁止拖曳捲軸
    if (this.isForbidDrag) {
      return;
    }

    // 若未拖曳時，skip
    if (this.mousePreviousPos == null) {
      return;
    }

    // 若未點擊螢幕，就取消flag，skip執行
    if (false === this.scene.input.activePointer.isDown) {
      this._isDragging = false;
      return;
    }

    // 計算差值
    const deltaVector = pointer.clone().subtract(this.mousePreviousPos);

    // 尚未拖曳
    if (this._isDragging === false) {
      // 若是移動範圍在容許值以內，才視為click; 超過時，視為move
      if (Math.abs(deltaVector.x) > this.touchMoveThreshold || Math.abs(deltaVector.y) > this.touchMoveThreshold) {
        // 捲軸拖曳中
        this._isDragging = true;
        // 修正拖曳開始座標 為 目前座標
        this.mousePreviousPos = pointer;
      }
    }
    // 捲軸拖曳中
    else {
      // 若有移動，進行拖曳
      if (false === deltaVector.equals(Phaser.Math.Vector2.ZERO)) {
        // 觸碰螢幕拖拉
        this.onDrag(deltaVector);

        // 記錄開始座標
        this.mousePreviousPos = pointer;
      }
    }
  }

  /** 滑鼠滾輪 事件
   * @param pointer 滑鼠座標
   * @param gameObjects 滑鼠位置重疊到的所有互動物件
   * @param deltaX x偏移量
   * @param deltaY y偏移量
   * @param deltaZ z偏移量
   */
  public onMouseWheel(
    pointer: Vector2,
    gameObjects: Phaser.GameObjects.GameObject[],
    deltaX: number,
    deltaY: number,
    deltaZ: number
  ): void {
    // 進行裝飾物拆缷時，不可捲動樓層
    if (this.isForbidDrag) {
      return;
    }

    // 滾輪移動y軸時，拖拉無限捲軸 (手指向前滾時，內容向前捲動)
    const deltaVector = new Phaser.Math.Vector2(0, deltaY * -1);
    this.onDrag(deltaVector);
  }

  /** 結束觸碰螢幕 事件
   * @param pointer 點擊座標
   */
  public onTouchEnd(pointer: Vector2): void {
    // 捲軸拖曳結束
    this._isDragging = false;
    // 清除記錄的位置
    this.mousePreviousPos = undefined;
  }

  /** 觸碰螢幕拖拉 事件
   * @param deltaVector 移動差值
   */
  public abstract onDrag(deltaVector: Vector2): void;

  //#endregion touch

  /** 取得指定資料index的cell
   * @param dataIndex 資料index
   */
  public getCellByDataIndex(dataIndex: number): LoopCell<T> | undefined {
    return this._loopCellList.find((cell) => dataIndex === cell.dataIndex);
  }
}
