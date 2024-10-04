import { AntiTDItemType } from '@/helper/enum/AntiTD';
import { AntiTDInfo } from '@/helper/interface/AntiTD';
import { HeroListData } from '@/helper/interface/Hero';
import AntiTDManager from '@/manager/AntiTDManager';
import HeroManager from '@/manager/HeroManager';
import TableManager, { CombatItemData, HeroData } from '@/manager/TableManager';
import WeaponManager from '@/manager/WeaponManager';
import PlanetWarHelper from '@/views/H5/Helper/PlanetWarHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';

export default class AntiTDHelper {
  /** 獲取角色對應星球大戰等級的道具資料，找不到資料則持續降等檢查，直到找到可用的
   * @param unitData 角色資料
   * @param planetWarLevel 星球大戰等級
   * @returns 道具資料
   */
  public static getBattleUnitItemData(unitData: HeroData, planetWarLevel: number): CombatItemData | undefined {
    // 若找不到資料則持續降等檢查，直到找到可用的
    let item: Readonly<CombatItemData> | undefined;
    for (let index = planetWarLevel; index > 0; index--) {
      // 找不到該等級道具資料
      item = TableManager.antiTDItem.findOne(unitData.antiTDItemId + planetWarLevel - 1);
      if (item === undefined) {
        console.error(`can not find itemId ${unitData.antiTDItemId}'s level ${planetWarLevel} itemData.`);
        continue;
      }

      // 找到的道具資料與等級不相符
      if (item.itemLevel !== planetWarLevel) {
        console.error(`itemId ${unitData.antiTDItemId}'s level ${planetWarLevel} itemData is level ${item.itemLevel}.`);
        item = undefined;
        continue;
      }

      // 已找到資料
      break;
    }

    return item;
  }

  /**取得英雄屬性相關
   * @param heroListData
   */
  public static getAntiTDInfo(heroListData: HeroListData): AntiTDInfo | undefined {
    // 找到英雄靜態表
    const hero = HeroManager.getHeroData(heroListData.heroId);
    if (hero === undefined) {
      console.error(`找不到英雄 ${heroListData.heroId}`);
      return;
    }
    // 換算星球大戰等級
    const planetWarLevel = PlanetWarHelper.getHeroPlanetWarLevel(heroListData.level);

    // 依對應ID撈出逆塔防道具資料
    const normalAttackItem = this.getBattleUnitItemData(hero, planetWarLevel);
    if (normalAttackItem === undefined) {
      console.error(`找不到裡宇宙道具 ${hero.antiTDItemId}`);
      return;
    }

    // 取得塔防道具資料
    const defenseWeaponData = HeroManager.getHeroWeaponData(hero, heroListData.level);
    if (defenseWeaponData === undefined) {
      console.error(`找不到塔防道具 heroId=${hero}`);
      return;
    }

    // 英雄屬性
    const heroAttribute = HeroManager.getHeroAttributeTypeData(heroListData);

    return {
      heroName: Localization.getText(LocalKeyType.Common, hero.nameKey),
      heroAttributeName: heroAttribute.heroAttributeName,
      heroAttributeUrl: heroAttribute.heroAttributeUrl,
      antiTDItemTypes: JSON.parse(hero.antiTDItemTypes).map((antiTDItemType: AntiTDItemType) =>
        AntiTDManager.getAntiTDItemTypeData(antiTDItemType)
      ),
      normalAttackItemName: Localization.getText(LocalKeyType.Common, normalAttackItem.nameKey),
      heroAntiTDAttack: this.getHeroAttack(normalAttackItem),
      coolDown: normalAttackItem.cooldown,
      attackRange: normalAttackItem.range,
      heroAntiTDHp: PlanetWarHelper.getHpByPlanetWarLevel(hero.antiTDHp, planetWarLevel),
      heroAntiTDDefense: PlanetWarHelper.getDefenseByPlanetWarLevel(hero.antiTDDefense, planetWarLevel),
      sameWeaponName: WeaponManager.getWeaponName(defenseWeaponData),
    };
  }

  /** 計算英雄攻擊力 *
   * @param normalAttackItem
   */
  public static getHeroAttack(normalAttackItem: CombatItemData): number {
    const spawnAttackItem = TableManager.antiTDItem.findOne(normalAttackItem.spawnOnHitItemId);
    // 有擊中衍生物
    if (spawnAttackItem !== undefined) {
      return Math.abs(normalAttackItem.interactionValue) + Math.abs(spawnAttackItem.interactionValue);
    }

    // 無擊中衍生物
    return Math.abs(normalAttackItem.interactionValue);
  }
}
