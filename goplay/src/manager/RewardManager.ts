import imgPath from '@/config/imgPath/imgPath';
import { RewardItemKey, RewardItemKeyName } from '@/helper/enum/AnswerGame';
import { RewardOptionData, SelectOption } from '@/helper/interface/BackEndManagement';
import { ContestGameAward } from '@/helper/interface/Contest';
import { WeaponTableData } from '@/helper/interface/Weapon';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import AntiTDManager from './AntiTDManager';
import TableManager, { AdornmentItemData, AntiTDItemData } from './TableManager';
import WeaponManager from './WeaponManager';
import { Award, ContestAwardItemTypeEnum } from '@/hero-api/dto/award.dto';
import { TeacherRewardOptionData } from '@/helper/interface/AdminTeacherAward';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';

export default class RewardManager {
  /** 生物兵器選項 */
  private static get weaponOptions(): SelectOption[] {
    const weaponDataList = TableManager.defenseWeapon.getAll();

    // 找到所有只能解鎖的生物兵器
    const unlockOnlyWeaponList = weaponDataList.filter((weapon) => WeaponManager.isWeaponBuyable(weapon) === false);

    // 轉化成選單格式
    return unlockOnlyWeaponList.map<SelectOption>((weapon) => {
      return {
        label: `${WeaponManager.getWeaponName(weapon)}`,
        value: weapon.id,
      };
    });
  }

  /** 裡宇宙道具選項 */
  private static get antiTDItemOptions(): SelectOption[] {
    // 找到非普攻的裡宇宙道具
    const antiTDItemList = TableManager.antiTDItem.where((antiTDItem: AntiTDItemData) => antiTDItem.heroItemType !== 0);

    // 找到所有只能解鎖的裡宇宙道具
    const unlockOnlyAntiTDItemList = antiTDItemList.filter(
      (antiTDItem: AntiTDItemData) => AntiTDManager.isAntiTDItemBuyable(antiTDItem) === false,
    );

    // 轉化成選單格式
    return unlockOnlyAntiTDItemList.map<SelectOption>((antiTDItem: AntiTDItemData) => {
      return {
        label: `${Localization.getText(LocalKeyType.Common, antiTDItem.nameKey)} Lv${antiTDItem.itemLevel}`,
        value: antiTDItem.id,
      };
    });
  }

  /** 裝飾物選項 */
  private static get adornmentItemOptions(): SelectOption[] {
    const adornmentItemList = TableManager.adornmentItem.getAll();

    // 轉化成選單格式
    return adornmentItemList.map<SelectOption>((adornmentItem: AdornmentItemData) => {
      return {
        label: `${Localization.getText(LocalKeyType.Common, adornmentItem.nameKey)}`,
        value: adornmentItem.id,
      };
    });
  }

  /** 獎勵種類屬性 */
  public static readonly rewardOptionList: RewardOptionData[] = [
    {
      itemType: RewardItemKey.Weapon,
      itemTypeName: RewardItemKeyName.Weapon,
      hasItemId: true,
      isMultiple: true,
      isFixedCount: true,
      rewardItemOptionList: RewardManager.weaponOptions,
    },
    {
      itemType: RewardItemKey.PlanetGold,
      itemTypeName: RewardItemKeyName.PlanetGold,
      hasItemId: false,
      isMultiple: false,
      isFixedCount: false,
      rewardItemOptionList: [],
    },
    {
      itemType: RewardItemKey.PlanetCrystal,
      itemTypeName: RewardItemKeyName.PlanetCrystal,
      hasItemId: false,
      isMultiple: false,
      isFixedCount: false,
      rewardItemOptionList: [],
    },
    {
      itemType: RewardItemKey.PlanetAntiTDItem,
      itemTypeName: RewardItemKeyName.PlanetAntiTDItem,
      hasItemId: true,
      isMultiple: true,
      isFixedCount: true,
      rewardItemOptionList: RewardManager.antiTDItemOptions,
    },
    {
      itemType: RewardItemKey.AdornmentItem,
      itemTypeName: RewardItemKeyName.AdornmentItem,
      hasItemId: true,
      isMultiple: true,
      isFixedCount: false,
      rewardItemOptionList: RewardManager.adornmentItemOptions,
    },
  ];

  /** 教師獎勵種類屬性 */
  public static readonly teacherRewardOptionList: TeacherRewardOptionData[] = [
    {
      itemType: ContestAwardItemTypeEnum.PlanetWarWeapon,
      itemTypeName: RewardItemKeyName.Weapon,
      hasItemId: true,
      isMultiple: true,
      isFixedCount: false,
      rewardItemOptionList: RewardManager.weaponOptions,
    },
    {
      itemType: ContestAwardItemTypeEnum.PlanetWarGoldCoin,
      itemTypeName: RewardItemKeyName.PlanetGold,
      hasItemId: false,
      isMultiple: false,
      isFixedCount: false,
      rewardItemOptionList: [],
    },
    {
      itemType: ContestAwardItemTypeEnum.PlanetWarCrystalCoin,
      itemTypeName: RewardItemKeyName.PlanetCrystal,
      hasItemId: false,
      isMultiple: false,
      isFixedCount: false,
      rewardItemOptionList: [],
    },
    {
      itemType: ContestAwardItemTypeEnum.PlanetAntiTDItem,
      itemTypeName: RewardItemKeyName.PlanetAntiTDItem,
      hasItemId: true,
      isMultiple: true,
      isFixedCount: false,
      rewardItemOptionList: RewardManager.antiTDItemOptions,
    },
    {
      itemType: ContestAwardItemTypeEnum.AdornmentItem,
      itemTypeName: RewardItemKeyName.AdornmentItem,
      hasItemId: true,
      isMultiple: true,
      isFixedCount: false,
      rewardItemOptionList: RewardManager.adornmentItemOptions,
    },
  ];

  /** 取得獎勵道具圖片
   * @param rewardItem 獎勵資料
   */
  public static getRewardItemImg(rewardItem: ContestGameAward): string {
    switch (rewardItem.itemType) {
      // 金幣
      case RewardItemKey.PlanetGold:
        return imgPath.goldBaseUrl;
      // 水晶
      case RewardItemKey.PlanetCrystal:
        return imgPath.crystalBaseUrl;
      // 生物兵器
      case RewardItemKey.Weapon:
        return imgPath.weaponBaseUrl + this.getDefenseWeapon(rewardItem.itemId).url;
      // 逆塔防道具
      case RewardItemKey.PlanetAntiTDItem:
        return `${imgPath.antiTDItemBaseUrl}/${this.getAntiTDItem(rewardItem.itemId).url}`;
      // 裝飾物
      case RewardItemKey.AdornmentItem:
        return `${imgPath.adornmentItemBaseUrl}/${this.getAdornmentItem(rewardItem.itemId).url}.png`;
      default:
        console.error(`getRewardItemImg: undefine itemType=${rewardItem.itemType}`);
        return '';
    }
  }

  /** 取得獎勵道具名稱
   * @param rewardItem 獎勵資料
   */
  public static getRewardItemName(rewardItem: ContestGameAward): string {
    switch (rewardItem.itemType) {
      // 金幣
      case RewardItemKey.PlanetGold:
        return '金幣';
      // 晶球
      case RewardItemKey.PlanetCrystal:
        return '晶球';
      // 生物兵器
      case RewardItemKey.Weapon:
        const weaponData = this.getDefenseWeapon(rewardItem.itemId);
        return WeaponManager.getWeaponName(weaponData);
      // 逆塔防道具
      case RewardItemKey.PlanetAntiTDItem:
        const antiTDItemData = this.getAntiTDItem(rewardItem.itemId);
        return Localization.getText(LocalKeyType.Common, antiTDItemData.nameKey) + ' Lv' + antiTDItemData.itemLevel;
      // 裝飾物
      case RewardItemKey.AdornmentItem:
        return Localization.getText(LocalKeyType.Common, this.getAdornmentItem(rewardItem.itemId).nameKey);
      default:
        console.error(`getRewardItemName: undefine itemType=${rewardItem.itemType}`);
        return '';
    }
  }

  /** 取得教師獎勵道具名稱
   * @param rewardItem 獎勵資料
   */
  public static getTeacherAwardItemName(rewardItem: Award): string {
    switch (rewardItem.itemType) {
      case ContestAwardItemTypeEnum.None:
        return '';
      // 金幣
      case ContestAwardItemTypeEnum.PlanetWarGoldCoin:
        return '金幣';
      // 晶球
      case ContestAwardItemTypeEnum.PlanetWarCrystalCoin:
        return '晶球';
      // 生物兵器
      case ContestAwardItemTypeEnum.PlanetWarWeapon:
        const weaponData = this.getDefenseWeapon(rewardItem.itemId);
        return WeaponManager.getWeaponName(weaponData);
      // 逆塔防道具
      case ContestAwardItemTypeEnum.PlanetAntiTDItem:
        const antiTDItemData = this.getAntiTDItem(rewardItem.itemId);
        return Localization.getText(LocalKeyType.Common, antiTDItemData.nameKey) + ' Lv' + antiTDItemData.itemLevel;
      // 裝飾物
      case ContestAwardItemTypeEnum.AdornmentItem:
        return Localization.getText(LocalKeyType.Common, this.getAdornmentItem(rewardItem.itemId).nameKey);
      default:
        Helper.assert(ErrorId.VariableUndefined, `getTeacherRewardItemName: undefine itemType=${rewardItem.itemType}`);
        return '';
    }
  }

  /**
   * 合併教師獎勵物品名稱和數量
   * @param rewardList 獎勵清單
   * @returns 合併後的教師獎勵物品名稱字串
   */
  public static combineTeacherAwardName(rewardList: Award[]): string {
    // 使用 `map` 和 `join` 來提高程式效率和簡潔性
    return rewardList.map((reward) => `${RewardManager.getTeacherAwardItemName(reward)} x ${reward.count}`).join('、');
  }

  /** 獎勵物品名字+數量
   *  @param rewardList 獎勵清單
   */
  public static combineRewardName(rewardList: ContestGameAward[]): string {
    let name = '';
    for (const rewardData of rewardList) {
      name = name + RewardManager.getRewardItemName(rewardData) + 'x' + rewardData.count + '、';
    }
    return name.slice(0, -1);
  }

  /** 取得生物兵器
   *  @param weaponId 生物兵器id
   */
  private static getDefenseWeapon(weaponId: number): WeaponTableData {
    const weaponData = WeaponManager.getWeaponTableData(weaponId);
    if (weaponData == null) {
      console.error(`getDefenseWeapon Error: cannot find weaponId ${weaponId}`);
      return {} as WeaponTableData;
    }
    return weaponData;
  }

  /** 取得逆塔防道具
   *  @param itemId 道具ID
   */
  private static getAntiTDItem(itemId: number): AntiTDItemData {
    // 取得靜態資料
    const data = TableManager.antiTDItem.findOne(itemId);
    if (data === undefined) {
      console.error(`getAntiTDItem Error: cannot find itemId ${itemId}`);
      return {} as AntiTDItemData;
    }
    return data;
  }

  /** 取得裝飾物道具
   *  @param itemId 道具ID
   */
  private static getAdornmentItem(itemId: number): AdornmentItemData {
    // 取得靜態資料
    const data = TableManager.adornmentItem.findOne(itemId);
    if (data === undefined) {
      console.error(`getAdornmentItem Error: cannot find itemId ${itemId}`);
      return {} as AdornmentItemData;
    }
    return data;
  }

  /** 取得獎勵種類屬性
   *  @param reward
   */
  public static getRewardOptionData(reward: ContestGameAward): RewardOptionData {
    const rewardOption = RewardManager.rewardOptionList.find(
      (rewardOptionData: RewardOptionData) => rewardOptionData.itemType === reward.itemType,
    );
    if (rewardOption == null) {
      console.error(`unknown itemType, itemType = ${reward.itemType}`);
    }
    return rewardOption ?? ({} as RewardOptionData);
  }

  /** 取得教師獎勵種類屬性
   *  @param award 獎勵物品
   */
  public static getTeacherAwardOptionData(award: Award): TeacherRewardOptionData {
    const rewardOption = RewardManager.teacherRewardOptionList.find(
      (rewardOptionData: TeacherRewardOptionData) => rewardOptionData.itemType === award.itemType,
    );
    if (rewardOption == null) {
      console.error(`unknown itemType, itemType = ${award.itemType}`);
    }
    return rewardOption ?? ({} as TeacherRewardOptionData);
  }

  /** 獎勵驗證
   * @param groupText
   * @param rewardList
   */
  public static isContestGameAwardValid(groupText: string, rewardList: ContestGameAward[]): string {
    let errorMessage: string = '';
    for (let index = 0; index < rewardList.length; index++) {
      // 獎勵
      const reward = rewardList[index];
      // 獎勵選項設定
      const rewardOptionData = RewardManager.getRewardOptionData(reward);
      // 獎勵名稱
      const rewardTypeName = rewardOptionData.itemTypeName;

      // itemID 未設定
      if (rewardOptionData.hasItemId && reward.itemId === -1) {
        errorMessage += `${groupText}: 請選擇獎品${index + 1}的${rewardTypeName}種類` + '<br/>';
      }

      // 數量不可為0
      if (rewardOptionData.isFixedCount === false && reward.count <= 0) {
        errorMessage += `${groupText}: 獎品${index + 1}設定錯誤, ${rewardTypeName}數量不可低於1` + '<br/>';
      }
    }
    return errorMessage;
  }

  /**
   * 教師獎勵驗證
   * @param groupText 文字訊息
   * @param awardList 獎品清單
   * @param planetCrystalMax 晶球上限
   */
  public static isTeacherAwardValid(groupText: string, awardList: Award[], planetCrystalMax: number): string {
    let errorMessage: string = '';

    for (let index = 0; index < awardList.length; index++) {
      // 獎勵
      const award = awardList[index];
      // 獎勵選項設定
      const rewardOptionData = RewardManager.getTeacherAwardOptionData(award);
      // 獎勵名稱
      const rewardTypeName = rewardOptionData.itemTypeName;

      // itemID 未設定
      if (rewardOptionData.hasItemId && award.itemId === -1) {
        errorMessage += `${groupText}: 請選擇獎品${index + 1}的${rewardTypeName}種類` + '<br/>';
      }

      // 數量不可為0
      if (rewardOptionData.isFixedCount === false && award.count <= 0) {
        errorMessage += `${groupText}: 獎品${index + 1}設定錯誤, ${rewardTypeName}數量不可低於1` + '<br/>';
      }
    }

    return errorMessage;
  }
}
