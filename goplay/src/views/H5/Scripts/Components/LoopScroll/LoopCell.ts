import { Scene } from 'phaser';
import Object2D from '../Object2D';

/** 無限循環 的 儲存格 */
export abstract class LoopCell<T> extends Object2D {
  /** 資料索引: 有10筆資料，索引為0~2，4~6等  */
  private _dataIndex: number = 0;
  public get dataIndex(): number {
    return this._dataIndex;
  }

  /** 資料: 傳入靜態表/動態表資料結構 */
  private _data?: T;
  public getData(): T | undefined {
    return this._data;
  }

  constructor(scene: Scene, x?: number, y?: number) {
    super(scene, x, y);
  }

  /** 設定資料 */
  public setCellData(cellData: T, dataIndex: number): void {
    this._data = cellData;
    this._dataIndex = dataIndex;

    this.setInfo(cellData);
    this.alpha = 1;
  }

  /** 清除資料 */
  public clearCellData(): void {
    this._data = undefined;
    this._dataIndex = -1;

    this.clearData();
    this.alpha = 0;
  }

  /** 清除資料 */
  public abstract clearData(): void;

  /** 設定詳細資訊
   * @param cellData 資料
   */
  public abstract setInfo(cellData: T): void;

  /** 刷新資料 */
  public abstract refresh(): void;
}
