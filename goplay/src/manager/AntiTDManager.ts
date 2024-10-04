import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import TableManager, { CombatItemData } from './TableManager';
import { AntiTDItemTypeData } from '@/helper/interface/AntiTD';
import ImgPath from '@/config/imgPath/imgPath';
import { HeroListData, HeroNet } from '@/helper/interface/Hero';
import HeroManager from './HeroManager';
import { isBuyable } from '@/helper/fnc/common';
import { AntiTDItemType } from '@/helper/enum/AntiTD';

/** 逆塔防管理 */
export default class AntiTDManager {
  /** 道具格解鎖等級 */
  public static readonly equipLimitLevel: number = 20;

  /** 取得 逆塔防道具類型URL
   * @param antiTDItemType 道具類型
   */
  public static getAntiTDItemTypeImageUrl(antiTDItemType: AntiTDItemType): string {
    switch (antiTDItemType) {
      // 物理類
      case AntiTDItemType.Physics:
        return ImgPath.physicsIcon;
      // 詛咒類
      case AntiTDItemType.Curse:
        return ImgPath.curseIcon;
      // 強化類
      case AntiTDItemType.Buff:
        return ImgPath.buffIcon;
      // 元素類
      case AntiTDItemType.Element:
        return ImgPath.elementIcon;
      // 奇蹟類
      case AntiTDItemType.Miracle:
        return ImgPath.miracleIcon;
      // 治療類
      case AntiTDItemType.Healing:
        return ImgPath.healingIcon;
      // 召喚類
      case AntiTDItemType.Summon:
        return ImgPath.summonIcon;
      // 投射類
      case AntiTDItemType.Projectile:
        return ImgPath.projectileIcon;
    }
    // 無
    return '';
  }

  /** 取得 逆塔防道具類型資料
   * @param antiTDItemType 道具類型
   */
  public static getAntiTDItemTypeData(antiTDItemType: AntiTDItemType): AntiTDItemTypeData {
    // 初始化資料
    return {
      antiTDItemTypeName: Localization.getText(LocalKeyType.Common, 'antiTDItemType_' + antiTDItemType),
      antiTDItemTypeUrl: this.getAntiTDItemTypeImageUrl(antiTDItemType),
    };
  }

  /** 逆塔防道具是否能用購買解鎖
   * @param antiTDItemData 道具資料
   */
  public static isAntiTDItemBuyable(antiTDItemData: CombatItemData): boolean {
    return isBuyable(antiTDItemData);
  }

  /** 判斷並修正API回傳英雄裝備道具資料類型錯誤(卸下錯誤道具)
   *  @param heroNetList
   */
  public static fixHeroItemType(heroNetList: HeroNet[]): HeroNet[] {
    heroNetList.forEach((heroNet: HeroNet) => {
      // 如果沒裝備任何道具則不用判斷
      if (heroNet.equipItemIds.length === 0) {
        return;
      }
      // 取得英雄道具類型
      const newHeroData = HeroManager.getHeroData(heroNet.heroId);
      // 找不到英雄資料
      if (newHeroData == null) {
        return;
      }
      const availableItemTypes: AntiTDItemType[] = JSON.parse(newHeroData.antiTDItemTypes);
      for (let index = 0; index < heroNet.equipItemIds.length; index++) {
        // 取得裝備道具類型
        const itemData = TableManager.antiTDItem.findOne(heroNet.equipItemIds[index]);
        // 找不到道具資料
        if (itemData == null) {
          continue;
        }

        // 若符合類型
        if (availableItemTypes.includes(itemData.heroItemType)) {
          continue;
        }
        heroNet.equipItemIds[index] = 0;
      }
    });
    return heroNetList;
  }

  /** 道具格是否鎖住
   *  @param hero
   */
  public static isEquipLocked(hero: HeroListData): boolean[] {
    if (hero == null) {
      return [false, false];
    }
    return [false, hero.level < this.equipLimitLevel];
  }
}
