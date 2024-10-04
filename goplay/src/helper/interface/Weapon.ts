import { PriceData } from '@/manager/TableManager';
import { AttributeType } from '@/views/H5/Helper/AttributeHelper';

/** 生物兵器靜態表 */
export interface WeaponTableData extends PriceData {
  /** 生物兵器ID */
  id: number;
  /** 生物兵器名稱多國key */
  nameKey: string;
  /** 生物兵器說明多國key */
  contentKey: string;
  /** 生物兵器等級 */
  level: number;
  /** 生物兵器屬性 */
  attribute: AttributeType;
  /** 攻擊力 */
  attack: number;
  /** 射程範圍 */
  attackRange: number;
  /** 射速 */
  attackSpeed: number;
  /** 快閃店兌換能量 */
  energy: number;
  /** 魔力消耗 */
  magic: number;
  /** 砲管流水號 */
  barrelId: number;
  /** 砲彈流水號 */
  bombId: number;
  /** 圖片路徑 */
  url: string;
  /** 是否用在星球大戰 */
  isPlanetWar: number;
  /** 解鎖條件: 需要先解鎖的生物兵器ID */
  unlockId: number;
  /** 對應英雄 */
  heroId: number;
}
