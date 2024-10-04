import { TableLoader } from './table-loader';

/**
 * 表示一個 JSON 表格項。
 */
export class TableItem {
  /**
   * 創建一個 JSON 表格項。
   * @param {any} data 表示要從中創建表格項的數據。
   */
  constructor(data: any) {
    Object.assign(this, data);
  }

  /**
   * 表示表格項的鍵。
   * @type {number}
   * @private
   */
  private _key: number;

  /**
   * 獲取表格項的鍵。
   * @returns {number} 返回表格項的鍵。
   */
  public getKey(): number {
    return this._key;
  }

  /**
   * 設置表格項的鍵。
   * @param {number} key 表示要設置的鍵值。
   */
  public setKey(key: number) {
    this._key = key;
  }
}

/**
 * 表示一個 JSON 表格。
 * @template T 表示表格項的類型。
 */
export class JsonTable<T extends TableItem> {
  private itemCtor: new (object: object) => T;

  /**
   * 創建一個 JSON 表格。
   * @param ctor 表示表格項的類型。
   */
  constructor(ctor: new (object: object) => T) {
    this.itemCtor = ctor;
  }

  /**
   * 表示表格項的 Map 集合。
   */
  protected itemMap: Map<number, T> = new Map<number, T>();

  /**
   * 表示表格項的數組。
   */
  protected itemArray: T[] = [];

  /**
   * 當向表格中添加表格項時調用的回調函數。
   * @param item 表示要添加的表格項。
   */
  protected onAppend(item: T) {
    /** */
  }

  /**
   * 當表格加載完成時調用的回調函數。
   */
  protected onFinish() {
    /** */
  }

  /**
   * 向表格中添加表格項。
   * @param item 表示要添加的表格項。
   * @param key 表示要添加的表格項的鍵。
   */
  public append(item: T, key: number) {
    // 檢查 key 是否已存在
    if (this.itemMap.get(key) !== undefined) {
      const errorMsg = `append key ${key} 已存在`;
      throw new Error(errorMsg);
    }

    item.setKey(key);
    this.itemMap.set(key, item);
    this.itemArray.push(item);
    this.onAppend(item);
  }

  /**
   * 清空表格。
   */
  public clear(): JsonTable<T> {
    this.itemMap.clear();
    this.itemArray.length = 0;
    return this;
  }

  /**
   * 從表格加載數據。
   * @param tableLoader 表示用於加載數據的表格加載器。
   * @param key 表示用於作為表格項鍵的屬性名。
   */
  public load(tableLoader: TableLoader, key: keyof T) {
    this.clear();
    const items = tableLoader.load().map((object) => this.createItem(this.itemCtor, object));
    this.loadFromArray(items, key);
    this.onFinish();
  }

  /**
   * 創建表格項。
   * @param type 表示要創建的表格項的類型。
   * @param object 表示要從中創建表格項的數據。
   * @returns 返回創建的表格項。
   */
  protected createItem(type: new (object: object) => T, object: object): T {
    return new type(object);
  }

  /**
   * 從表格加載數據，並使用自增長的數字作為表格項鍵。
   * @param tableLoader 表示用於加載數據的表格加載器。
   */
  public loadWithAutoKey(tableLoader: TableLoader) {
    this.clear();
    const items = tableLoader.load().map((object) => this.createItem(this.itemCtor, object));
    this.loadFromArrayWithAutoKey(items);
  }

  /**
   * 從數組中加載數據到表格中。
   * @param items 表示要加載的數據數組。
   * @param key 表示用於作為表格項鍵的屬性名。
   */
  protected loadFromArray(items: T[], key: keyof T) {
    for (const item of items) {
      // 檢查 item[key] 是否為數字
      const keyValue = item[key];
      if (typeof keyValue !== 'number') {
        const errorMsg = `loadFromArray, item[${keyValue}] 不是數字`;
        throw new Error(errorMsg);
      } else {
        this.append(item, keyValue);
      }
    }
  }

  /**
   * 從數組中加載數據到表格中，並使用自增長的數字作為表格項鍵。
   * @param items 表示要加載的數據數組。
   */
  protected loadFromArrayWithAutoKey(items: T[]) {
    let key = 0;
    for (const item of items) {
      this.append(item, key);
      key++;
    }
  }

  /**
   * 獲取指定鍵的表格項。
   * @param key 表示要獲取的表格項的鍵。
   * @returns 返回指定鍵的表格項，如果不存在則返回 undefined。
   */
  public getItem(key: number): T | undefined {
    return this.itemMap.get(key);
  }

  /**
   * 獲取表格項的數組。
   * @returns {T[]} 返回表格項的數組。
   */
  public getDataArray(): T[] {
    return this.itemArray;
  }
}
