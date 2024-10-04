import { Message } from '@/helper/class/Common';

export enum ErrorId {
  /** online hero 找不到 */
  OnlineHeroNotFound = 'OnlineHeroNotFound',
  /** 表格找不到 */
  TableNotFound = 'TableNotFound',
  /** 表格內資料找不到 */
  TableDataNotFound = 'TableDataNotFound',
  /** Tilemap解析失敗 */
  TilemapParseFailed = 'TilemapParseFailed',
  /** 因雄宇宙遊戲紀錄讀取失敗 */
  MissingHeroUniverseHistory = 'MissingHeroUniverseHistory',
  /** 任務接取失敗 */
  TaskAcceptFailed = 'TaskAcceptFailed',
  /** 變數未定義 */
  VariableUndefined = 'VariableUndefined',
  /** 無效的數量 */
  InvalidQuantity = 'InvalidQuantity',
  /** 無效的身分 */
  InvalidIdentity = 'InvalidIdentity',
  /** JSON 解析失敗 */
  JsonParseFailed = 'JsonParseFailed',
}

export default class Helper {
  /**
   * 拋出錯誤。
   * @param errorId 錯誤 ID。
   * @param errorMsg 錯誤訊息。
   */
  public static assert(errorId: ErrorId, errorMsg: string): void {
    Message.error(`${errorId}: ${errorMsg}`);
  }

  /**
   * 解析 JSON 字串。
   * @param jsonString JSON 字串。
   * @returns JSON 物件。
   */
  public static jsonParse<T>(jsonString: string): T {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      Helper.assert(ErrorId.JsonParseFailed, `${error}`);
      return {} as T;
    }
  }
}
