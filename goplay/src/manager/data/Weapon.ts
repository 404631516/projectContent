import { DefenseWeaponData, DefenseBarrelData, DefenseBombData } from '../TableManager';
import TableManager from '../TableManager';

/** 生物兵器資料 */
export class Weapon {
    /** 生物兵器靜態資料 */
    public data: Readonly<DefenseWeaponData>;
    /** 生物兵器的砲管靜態資料 */
    public barrelData?: Readonly<DefenseBarrelData>;
    /** 生物兵器的砲彈靜態資料 */
    public bombData?: Readonly<DefenseBombData>;

    /** 砲台圖片索引 */
    public get key(): string {
      return this.data.nameKey;
    }

    /** 砲管圖片索引 */
    public get barrelKey(): string {
      if (this.barrelData) {
        return this.barrelData.nameKey;
      }
      return '';
    }

    /** 砲彈圖片索引 */
    public get bombKey(): string {
      if (this.bombData) {
        return this.bombData.nameKey;
      }
      return '';
    }

    constructor(data: DefenseWeaponData) {
      this.data = data;
      this.barrelData = TableManager.defenseBarrel.findOne(data.barrelId);
      this.bombData = TableManager.defenseBomb.findOne(data.bombId);
    }
}
