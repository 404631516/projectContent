import TableManager, { DefenseWeaponData } from './TableManager';
import { WeaponTableData } from '@/helper/interface/Weapon';
import { WeaponLockState } from '@/helper/enum/Weapon';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import AttributeHelper from '@/views/H5/Helper/AttributeHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { isBuyable } from '@/helper/fnc/common';

export default class WeaponManager {
  /** 能裝備的生物兵器上限 */
  public static readonly weaponItemMax: number = 8;

  /** 取得所有防禦塔資料 */
  public static getTowerTableList(): WeaponTableData[] {
    return this.getDefenseWeaponTableData(false);
  }

  /** 取得指定防禦塔資料
   * @param itemId
   */
  public static getTowerTableData(itemId: number): WeaponTableData | undefined {
    return this.getTowerTableList().find((item) => item.id === itemId);
  }

  /** 取得所有生物兵器資料 */
  public static getWeaponTableList(): WeaponTableData[] {
    return this.getDefenseWeaponTableData(true);
  }

  /** 取得指定生物兵器資料
   * @param weaponId
   */
  public static getWeaponTableData(weaponId: number): WeaponTableData | undefined {
    return this.getWeaponTableList().find((weapon) => weapon.id === weaponId);
  }

  /** 取得裝備中的生物兵器
   * @param weaponIdList
   */
  public static getEquipWeaponList(equipWeaponIdList: number[]): WeaponTableData[] {
    // 防呆
    if (equipWeaponIdList.length === 0) {
      return [];
    }

    return this.getWeaponTableList().filter((weapon) => {
      return equipWeaponIdList.includes(weapon.id);
    });
  }

  /** 生物兵器是否能用購買解鎖
   * @param weaponData
   */
  public static isWeaponBuyable(weaponData: WeaponTableData): boolean {
    return isBuyable(weaponData);
  }

  /** 取得生物兵器名稱
   * @param weaponData
   */
  public static getWeaponName(weaponData: WeaponTableData | DefenseWeaponData): string {
    const name = Localization.getText(LocalKeyType.Common, weaponData.nameKey);
    return `${name} Lv${weaponData.level}`;
  }

  /** 取得塔防靜態資料
   * @param isPlanetWar
   */
  private static getDefenseWeaponTableData(isPlanetWar: boolean): WeaponTableData[] {
    const isPlanetWarIndex = isPlanetWar ? 1 : 0;
    return TableManager.defenseWeapon.getAll().filter((weapon) => {
      return weapon.isPlanetWar === isPlanetWarIndex;
    });
  }
}
