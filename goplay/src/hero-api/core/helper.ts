// tslint:disable
// @ts-nocheck
import * as fs from 'fs';
import { ApiErrorDto } from '../dto/api.dto';
import { ErrorId } from '../dto/error-id';

/**
 * 工具類別。
 */
export class Helper {
  static assert(arg0: boolean, arg1: string) {
    throw new Error('Method not implemented.');
  }
  /**
   * 確保條件成立，否則拋出一個錯誤。
   * @param condition 條件。
   * @param errorId 錯誤 ID。
   * @param errorMsg 錯誤訊息。
   */
  public static ensure(condition: boolean, errorId: ErrorId, errorMsg: string): void {
    if (!condition) {
      throw new ApiErrorDto(errorId, errorMsg);
    }
  }

  /**
   * 讀取 JSON 檔案。
   * @param {string} filename - 檔案名稱。
   * @returns {any} 解析後的 JSON 物件。
   * @throws {Error} 如果檔案不存在或 JSON 格式錯誤，就拋出一個錯誤。
   */
  public static readJsonFileSync(filename: string): any {
    if (!fs.existsSync(filename)) {
      const errMsg = `File ${filename} not found`;
      throw new Error(errMsg);
    }

    const data = fs.readFileSync(filename, 'utf8');

    try {
      const parsedData = JSON.parse(data);
      return parsedData;
    } catch (err: any) {
      const errMsg = `Error parsing JSON file ${filename}: ${err.message}`;
      throw new Error(errMsg);
    }
  }

  /**
   * 給予一個機率，根據機率計算成功與否。
   * @returns {boolean} 成功與否。
   */
  public static randomByProbability(probability: number): boolean {
    return Math.random() <= probability;
  }

  /**
   * 產生指定範圍內的隨機整數。（包括 min 和 max）
   * @param {number} min - 隨機整數的最小值。
   * @param {number} max - 隨機整數的最大值。
   * @returns {number} - 隨機整數。
   */
  public static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 取得Array隨機元素。
   * @param {T[]} array - 輸入陣列。
   */
  public static randomArrayElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 設置數字的指定位元。
   * @param {number} value - 要設置位元的數字。
   * @param {number} bitIndex - 要設置的位元索引。
   * @param {boolean} option - 設置位元的值。
   * @returns {number} - 設置後的數字。
   */
  public static setBit(value: number, bitIndex: number, option: boolean): number {
    if (bitIndex > 31 || bitIndex < 0) throw new Error(`setBit invalid index: ${bitIndex}`);
    if (option) {
      return value | (1 << bitIndex);
    } else {
      return value & ~(1 << bitIndex);
    }
  }

  /**
   * 獲取數字的指定位元。
   * @param {number} value - 要獲取位元的數字。
   * @param {number} bit - 要獲取的位元索引。
   * @returns {boolean} - 位元的值。
   */
  public static getBit(value: number, bit: number): boolean {
    if (bit > 31 || bit < 0) throw new Error(`getBit invalid index: ${bit}`);
    return (value & (1 << bit)) > 0;
  }

  /**
   * 將數字轉換為位元陣列。
   * @param {number} value - 要轉換的數字。
   * @param {number} length - 位元陣列的長度。
   * @returns {boolean[]} - 位元陣列。
   */
  public static numberToBitBooleanArray(value: number, length: number): boolean[] {
    const result = [];
    for (let i = 0; i < length; i++) {
      result.push(Helper.getBit(value, i));
    }
    return result;
  }

  /**
   * 將數字轉換為位元陣列,根據option選擇取所有為true或false的位元Index。
   * @param {number} value - 要轉換的數字。
   * @param {number} length - 位元陣列的長度。
   * @param {boolean} option - 要轉換的位元值。
   * @returns {number[]} - 位元陣列。
   */
  public static numberToBitNumberArray(value: number, length: number, option: boolean = true): number[] {
    const result = [];
    for (let i = 0; i < length; i++) {
      if (Helper.getBit(value, i) == option) {
        result.push(i);
      }
    }
    return result;
  }

  /**
   * 檢查一個值是否為 null 或 undefined。
   *
   * @param {any} value - 要檢查的值。
   * @returns {boolean} 如果值為 null 或 undefined，則返回 true，否則返回 false。
   */
  public static isNullOrUndefined(value: any): boolean {
    return value === null || value === undefined;
  }

  /**
   * 檢查一個值是否為 null、undefined 或空字串。
   *
   * @param {any} value - 要檢查的值。
   * @returns {boolean} 如果值為 null、undefined 或空字串，則返回 true，否則返回 false。
   */
  public static isNullOrEmpty(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  /**
   * 檢查一個值是否為 null。
   *
   * @param {any} value - 要檢查的值。
   * @returns {boolean} 如果值為 null，則返回 true，否則返回 false。
   */
  public static isNull(value: any): boolean {
    return value === null;
  }

  /**
   * 檢查一個字串是否為 null、undefined 或空字串。
   *
   * @param {string} value - 要檢查的字串。
   * @returns {boolean} 如果字串為 null、undefined 或空字串，則返回 true，否則返回 false。
   */
  public static isNullOrEmptyString(value: string): boolean {
    return value === null || value === undefined || value === '';
  }

  /**
   * 檢查一個陣列是否為空陣列。
   *
   * @param {any[]} value - 要檢查的陣列。此參數不能為 null 或 undefined。
   * @returns {boolean} 如果陣列為空陣列，則返回 true，否則返回 false。
   * @throws {Error} 如果 value 為 null 或 undefined，則拋出錯誤。
   */
  public static isEmptyArray(value: any[]): boolean {
    if (value === null || value === undefined) {
      throw new Error("Invalid argument: 'value' must not be null or undefined.");
    }
    return value.length === 0;
  }

  /**
   * 暫停指定的毫秒數。
   * @param {number} ms - 要暫停的毫秒數。
   * @returns {Promise<void>} 一個 Promise 對象，當指定的時間過去後，這個 Promise 將會解析。
   */
  public static wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
