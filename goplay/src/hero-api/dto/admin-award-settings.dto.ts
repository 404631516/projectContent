import { AdminAwardSettings } from '../entity/admin-award-settings.entity';
import { ApiResOkBaseDto } from './api.dto';
import { Award, ContestAwardItemTypeEnum } from './award.dto';

/**
 * 獎勵的類型。
 */
export enum AwardTypeEnum {
  /** 週獎勵 */
  Week = 1,

  /** 校園賽事舉辦成功獎勵 */
  RoomContest = 2,
}

/**
 * 根據獎勵類型取得獎勵。
 */
export class AdminGetAwardDto {
  /** 獎勵類型 */
  awardType: AwardTypeEnum;
}

/**
 * 管理員要設定的獎勵。
 */
export class AdminSetAwardDto {
  /** 獎勵類型 */
  awardType: AwardTypeEnum;

  /** 獎勵物品清單 */
  items: Award[];
}

/**
 * 管理員獎勵設定的回傳結果。
 */
export class AdminAwardSettingsResultDto extends ApiResOkBaseDto {
  /** 生效日期 */
  effectiveDate: Date;

  /** 失效日期 */
  expiryDate: Date;

  /** 獎勵物品清單 */
  awardItems: Award[];

  /**
   * 建構子，用於建立一個新的 AdminAwardSettingsResultDto 物件。
   * @param adminAwardSettings 管理員獎勵設定。
   */
  constructor(adminAwardSettings: AdminAwardSettings) {
    super();

    this.effectiveDate = adminAwardSettings.effectiveDate;
    this.expiryDate = adminAwardSettings.expiryDate;
    this.awardItems = new Array<Award>();

    if (adminAwardSettings.coins > 0) {
      this.awardItems.push(new Award(ContestAwardItemTypeEnum.PlanetWarGoldCoin, 0, adminAwardSettings.coins));
    }

    if (adminAwardSettings.crystal > 0) {
      this.awardItems.push(new Award(ContestAwardItemTypeEnum.PlanetWarCrystalCoin, 0, adminAwardSettings.crystal));
    }

    this.addDynamicAwards(adminAwardSettings);
  }

  /**
   * 添加動態獎勵到獎勵項目列表。
   * @param adminAwardSettings 管理員獎勵設定。
   */
  private addDynamicAwards(adminAwardSettings: AdminAwardSettings): void {
    for (let i = 1; i <= 5; i++) {
      const itemType = adminAwardSettings[`itemType${i}` as keyof AdminAwardSettings] as ContestAwardItemTypeEnum;
      const itemId = adminAwardSettings[`itemId${i}` as keyof AdminAwardSettings] as number;
      const itemCount = adminAwardSettings[`itemCount${i}` as keyof AdminAwardSettings] as number;

      if (itemType && itemType !== ContestAwardItemTypeEnum.None) {
        this.awardItems.push(new Award(itemType, itemId, itemCount));
      }
    }
  }
}
