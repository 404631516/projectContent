export interface TableDataConfig {
  id: number;
}

/** 靜態表資料管理器
 * T 必需要ID的資料屬性
 * T 的property必須為public
 */
export default class TableData<T extends TableDataConfig> {
  /** 資料查表(索引: ID) */
  private dataMap: Map<number, Readonly<T>> = new Map();

  constructor(datas: T[] | Map<number, T>) {
    if (Array.isArray(datas)) {
      for (const data of datas) {
        this.dataMap.set(data.id, data);
      }
    } else {
      this.dataMap = datas;
    }
  }

  /**搜尋資訊來自編號
   * @param id 編號
   */
  public findOne(id: number): Readonly<T> | undefined {
    return this.dataMap.get(id);
  }

  /** 取得全部資料 */
  public getAll(): Array<Readonly<T>> {
    return Array.from(this.dataMap.values());
  }

  /** 篩選出符合的全部資料 */
  public where(
    predicate: (
      value: Readonly<T>,
      index: number,
      array: Array<Readonly<T>>
    ) => boolean
  ): Array<Readonly<T>> {
    return this.getAll().filter(predicate);
  }

  /** 篩選出符合的第一筆資料 */
  public first(
    predicate: (
      value: Readonly<T>,
      index: number,
      array: Array<Readonly<T>>
    ) => boolean
  ): Readonly<T> | undefined {
    const res = this.getAll().filter(predicate);
    return res.length > 0 ? res[0] : undefined;
  }
}
