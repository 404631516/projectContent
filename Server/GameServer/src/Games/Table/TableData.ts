export interface TableDataConfig {
  id: number;
}

/** 列表資料 */
export default class TableData<T extends TableDataConfig> {
  /** 資料查表 */
  private dataMap: Map<number, Readonly<T>> = new Map();

  /** 建構式
   * @param key 可命名鍵值並放入資料 (可選)
   */
  constructor(fileJson: any) {
    for (const key in fileJson) {
      if (fileJson.hasOwnProperty(key)) {
        const value = fileJson[key] as T;
        // 將key轉成數字
        const id = parseInt(key, 10);
        if (isNaN(id)) {
          throw new Error('TableData<T>::importJson() key parseInt fail, key=' + key);
        }
        // 將作為key的id填回value.id中, 因為轉出來的json檔會把作為key的id欄位去掉
        value.id = id;
        // 存入map
        this.dataMap.set(id, value);
      }
    }
  }

  /**搜尋資訊來自編號
   * @param id 編號
   */
  public findOne(id: number): Readonly<T> | undefined {
    if (!this.dataMap.has(id)) {
      return undefined;
    }

    return this.dataMap.get(id);
  }

  /** 取得全部資料 */
  public getAll(): Array<Readonly<T>> {
    return Array.from(this.dataMap.values());
  }

  /** 篩選出符合的全部資料 */
  public where(
    predicate: (value: Readonly<T>, index: number, array: Array<Readonly<T>>) => boolean
  ): Array<Readonly<T>> {
    return this.getAll().filter(predicate);
  }

  /** 篩選出符合的第一筆資料 */
  public first(
    predicate: (value: Readonly<T>, index: number, array: Array<Readonly<T>>) => boolean
  ): Readonly<T> | undefined {
    const res = this.getAll().filter(predicate);
    return res.length > 0 ? res[0] : undefined;
  }
}
