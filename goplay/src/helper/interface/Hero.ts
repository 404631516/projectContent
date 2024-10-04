/** API傳回來的已解鎖英雄資料 */
export interface HeroNet {
  /** 英雄HID */
  hid: number;
  /** 英雄ID */
  heroId: number;
  /** 總經驗 */
  totalExp: number;
  /** 裝備道具編號列表 */
  equipItemIds: number[];
}

/** API傳回來的隊伍英雄資料 */
export interface HeroTeamNet {
  /** 英雄HID */
  hid: number;
  /** 科目 */
  subjectSeat: number;
}

/** 傳給Server隊伍資訊 */
export interface HeroAntiTDNet {
  /** 英雄Hid */
  hid: number;
  /** 裝備道具清單 */
  equipItemIds: number[];
}

/** 英雄詳細資料 */
export interface HeroListData {
  /** 英雄HID */
  hid: number;
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

/** 英雄屬性類型資料 */
export interface HeroAttributeTypeData {
  /** 類型名稱 */
  heroAttributeName: string;
  /** 類型URL */
  heroAttributeUrl: string;
}
