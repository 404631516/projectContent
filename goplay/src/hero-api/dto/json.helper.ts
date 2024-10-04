
import { Helper } from '../core/helper';
import { ErrorId } from './error-id';


/**
 * 工具類別-JSON
 */
export class JsonHelper {
  /**
   * 將 JSON 字串解析為物件。
   * @param jsonString JSON 字串。
   * @returns 解析後的物件。
   */
  public static parseFromJson<T>(jsonString: string): T | undefined {
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      // 使用 String(error) 將錯誤轉為字符串，處理非 Error 類型的錯誤。
      const errorMessage = error instanceof Error ? error.message : String(error);
      Helper.ensure(false, ErrorId.InvalidJson, `Failed to parse JSON string: ${jsonString} - Error: ${errorMessage}`);
    }
  }

  /**
   * 將物件序列化為 JSON 字串。
   * @param object 要序列化的物件。
   * @returns JSON 字串。
   */
  public static stringifyToJson<T>(object: T): string {
    return JSON.stringify(object);
  }
}
