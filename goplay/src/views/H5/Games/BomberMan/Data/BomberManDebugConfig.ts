/** 測試指令相關開關 */
export default class DebugConfig {
  public static readonly versionContent = '開發版本';

  //#region log
  /** 啟用log */
  public static readonly isLog = false;
  /** 啟用右方資訊欄log */
  public static readonly isLogInfo = false;
  /** 啟用玩家英雄log */
  public static readonly isLogHero = false;
  /** 啟用敵人log */
  public static readonly isLogEnemy = false;
  /** 啟用地圖物件log */
  public static readonly isLogMapObj = false;
  /** 啟用炸彈log */
  public static readonly isLogBomb = false;
  /** 啟用炸彈爆風log */
  public static readonly isLogBlast = false;
  /** 啟用道具log */
  public static readonly isLogItem = false;
  /** 啟用移動log */
  public static readonly isLogMove = false;
  //#endregion log
}
