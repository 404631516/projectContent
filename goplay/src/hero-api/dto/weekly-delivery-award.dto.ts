// tslint:disable
// @ts-nocheck
import { ApiResOkBaseDto } from './api.dto';
import { WeeklyDeliveryAward } from '../entity/weekly-delivery-award.entity';
import { Award, ContestAwardItemTypeEnum } from './award.dto';

/**
 * 管理員每週獎勵設定/更新。
 */
export class AdminWeeklyDeliveryAwardUpdateDto {
  /**
   * 管理員設定獎物品清單。
   */
  items: Award[];
}

/**
 * 管理員每週獎勵的回傳結果。
 */
export class AdminWeeklyDeliveryAwardResultDto extends ApiResOkBaseDto {
  /**
   * 生效日期。
   */
  effectiveDate: Date;
  /**
   * 失效日期。
   */
  expiryDate: Date;
  /**
   * 獎勵物品清單。
   */
  awardItems: Award[];

  /**
   * 建構子，用於建立一個新的 AdminWeeklyDeliveryAwardResultDto 物件。
   * @param weeklyDeliveryAward 每週派發的獎勵。
   */
  constructor(weeklyDeliveryAward: WeeklyDeliveryAward) {
    super();

    this.effectiveDate = weeklyDeliveryAward.effectiveDate;
    this.expiryDate = weeklyDeliveryAward.expiryDate;
    this.awardItems = new Array<Award>();

    if (weeklyDeliveryAward.coins > 0) {
      this.awardItems.push(new Award(ContestAwardItemTypeEnum.PlanetWarGoldCoin, 0, weeklyDeliveryAward.coins));
    }

    if (weeklyDeliveryAward.crystal > 0) {
      this.awardItems.push(new Award(ContestAwardItemTypeEnum.PlanetWarCrystalCoin, 0, weeklyDeliveryAward.crystal));
    }

    for (let i = 1; i <= 5; i++) {
      const itemType = weeklyDeliveryAward[`itemType${i}`];
      const itemId = weeklyDeliveryAward[`itemId${i}`];
      const itemCount = weeklyDeliveryAward[`itemCount${i}`];

      if (itemType !== ContestAwardItemTypeEnum.None) {
        this.awardItems.push(new Award(itemType, itemId, itemCount));
      }
    }
  }
}
