
import { Helper } from '../core/helper';
import { ErrorId } from './error-id';


/**
 * 工具類別。
 */
export class StringHelper {
  /**
   * 將字串的第一個字母轉換為大寫。
   * @param {string} str - 輸入字串。
   * @returns {string} 將輸入字串的第一個字母轉換為大寫後的字串。
   */
  public static upperCaseFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 將字串的第一個字母轉換為大寫，其餘字母轉換為小寫。
   * @param {string} str - 輸入字串。
   * @returns {string} 將輸入字串的第一個字母轉換為大寫，其餘字母轉換為小寫後的字串。
   */
  public static capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLocaleLowerCase();
  }

  /**
   * 產生指定長度的隨機字母數字字串。
   * @param {number} length - 字串長度。
   * @returns {string} 隨機字母數字字串。
   */
  public static randomAlphanumericString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  /**
   * 將數字清單轉換為逗號分隔的字串。
   * @param numberList 數字清單。
   * @returns 逗號分隔的字串。
   */
  public static numberArrayToCommaString(numberList: number[]): string {
    return numberList.join(',');
  }

  /**
   * 將逗號分隔的字串轉換為數字清單。
   * @param numberListStr 逗號分隔的字串。
   * @returns 數字清單。
   */
  public static commaStringToNumberArray(numberListStr: string): number[] {
    Helper.ensure(
      numberListStr != null && numberListStr.trim() !== '',
      ErrorId.InvalidArgument,
      'numberListStr cannot be null or empty.',
    );
    return numberListStr.split(',').map((numStr) => {
      const num = parseInt(numStr, 10);
      Helper.ensure(!isNaN(num), ErrorId.InvalidArgument, `Invalid number found in numberListStr: ${numStr}`);
      return num;
    });
  }
}
