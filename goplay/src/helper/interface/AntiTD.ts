/** 逆塔防道具詳細資料 */
export interface AntiTDItemListData {
  /** 英雄HID */
  itemId: number;

  /** 英雄ID */
  heroId: number;
  /** 英雄名稱 */
  name: string;
  /** 英雄頭像URL */
  url: string;
  /** 總經驗 */
  totalExp: number;
  /** 等級 */
  level: number;
  /** 是否解鎖 */
  locked: boolean;
  /** 是否上場 */
  online: boolean;
  /** 英雄屬性 */
  attribute: number;
  /** 裝備道具編號列表 */
  equipItemIds: number[];
}

/** 道具類型資料 */
export interface AntiTDItemTypeData {
  /** 類型名稱 */
  antiTDItemTypeName: string;
  /** 類型URL */
  antiTDItemTypeUrl: string;
}
/** 英雄相關屬性 */
export interface AntiTDInfo {
  /** 英雄名稱 */
  heroName: string;
  /** 英雄屬性名稱 */
  heroAttributeName: string;
  /** 英雄屬性圖片 */
  heroAttributeUrl: string;
  /**可裝備道具種類*/
  antiTDItemTypes: AntiTDItemTypeData[];
  /** 英雄攻擊類型 */
  normalAttackItemName: string;
  /** 英雄攻擊力 */
  heroAntiTDAttack: number;
  /** 英雄冷卻時間 */
  coolDown: number;
  /** 英雄攻擊範圍 */
  attackRange: number;
  /** 英雄血量 */
  heroAntiTDHp: number;
  /** 英雄防禦力 */
  heroAntiTDDefense: number;
  /** 塔防化身 */
  sameWeaponName: string;
}
