import { ApiResOkBaseDto } from './api.dto';
import { Award, ContestAwardItemTypeEnum } from './award.dto';

import { TeacherAwardInventory } from '../entity/teacher-award-inventory.entity';

/**
 * 教師獎勵庫存的來源類型。
 */
export enum TeacherAwardInventorySourceTypeEnum {
  /** 週獎勵 */
  Week = 1,

  /** 校園賽事舉辦成功獎勵 */
  RoomContest = 2,
}

/**
 * 教師獎勵庫存查詢結果。
 */
export class GetTeacherAwardInventoryResultDto extends ApiResOkBaseDto {
  /**
   * 該教師所有的獎勵庫存資料
   */
  awardInventoryList: AwardInventory[];

  /**
   * 建構子，用於建立一個新的 GetTeacherAwardInventoryResultDto 物件。
   * @param teacherAwardInventoryList 教師獎勵庫存列表。
   */
  constructor(teacherAwardInventoryList: TeacherAwardInventory[]) {
    super();
    this.awardInventoryList = teacherAwardInventoryList.map(this.createAwardInventory.bind(this));
  }

  /**
   * 從 TeacherAwardInventory 建立 AwardInventory。
   * @param teacherAwardInventory 教師獎勵庫存。
   * @returns 建立的 AwardInventory。
   */
  private createAwardInventory(teacherAwardInventory: TeacherAwardInventory): AwardInventory {
    const awardInventory = new AwardInventory();
    awardInventory.awardItems = [];
    awardInventory.index = teacherAwardInventory.index;
    awardInventory.sourceType = teacherAwardInventory.sourceType;
    awardInventory.effectiveDate = teacherAwardInventory.effectiveDate;
    awardInventory.expiryDate = teacherAwardInventory.expiryDate;

    this.addDefaultAwards(awardInventory, teacherAwardInventory);
    this.addDynamicAwards(awardInventory, teacherAwardInventory);

    return awardInventory;
  }

  /**
   * 添加預設獎勵（硬幣）到 AwardInventory。
   * @param awardInventory 獎勵庫存。
   * @param teacherAwardInventory 教師獎勵庫存。
   */
  private addDefaultAwards(awardInventory: AwardInventory, teacherAwardInventory: TeacherAwardInventory): void {
    this.addAward(awardInventory, ContestAwardItemTypeEnum.PlanetWarGoldCoin, 0, teacherAwardInventory.coins);
    this.addAward(awardInventory, ContestAwardItemTypeEnum.PlanetWarCrystalCoin, 0, teacherAwardInventory.crystal);
  }

  /**
   * 添加動態獎勵到 AwardInventory。
   * @param awardInventory 獎勵庫存。
   * @param teacherAwardInventory 教師獎勵庫存。
   */
  private addDynamicAwards(awardInventory: AwardInventory, teacherAwardInventory: TeacherAwardInventory): void {
    for (let i = 1; i <= 5; i++) {
      const itemType = teacherAwardInventory[`itemType${i}` as keyof TeacherAwardInventory] as ContestAwardItemTypeEnum;
      const itemId = teacherAwardInventory[`itemId${i}` as keyof TeacherAwardInventory] as number;
      const itemCount = teacherAwardInventory[`itemCount${i}` as keyof TeacherAwardInventory] as number;
      this.addAward(awardInventory, itemType, itemId, itemCount);
    }
  }

  /**
   * 添加獎勵物品。
   * @param awardInventory 獎勵庫存。
   * @param itemType 獎勵物品類型。
   * @param itemId 獎勵物品ID。
   * @param itemCount 獎勵物品數量。
   */
  private addAward(
    awardInventory: AwardInventory,
    itemType: ContestAwardItemTypeEnum,
    itemId: number,
    itemCount: number,
  ) {
    if (itemType !== ContestAwardItemTypeEnum.None && itemCount !== 0) {
      awardInventory.awardItems.push(new Award(itemType, itemId, itemCount));
    }
  }
}

/**
 * 單筆教師獎勵庫存內容。
 */
export class AwardInventory {
  /** 索引 */
  index: number;

  /** 獎勵來源類型 */
  sourceType: TeacherAwardInventorySourceTypeEnum;

  /** 生效日期 */
  effectiveDate: Date;

  /** 失效日期 */
  expiryDate: Date;

  /**  獎勵物品 */
  awardItems: Award[];
}

/**
 * 教師獎勵發放資訊，包含學生uid清單和教師派送獎勵清單。
 */
export class TeacherAwardDeliveryDto {
  /**
   * 派送獎勵的學生uid清單。
   */
  studentUidList: number[];

  /**
   * 教師要派送的獎勵清單。(學生uid清單中的每一位學生都會收到這些獎勵。)
   */
  teacherDeliveryAwardList: TeacherDeliveryAward[];
}

/**
 * 單筆派送獎勵內容。
 */
export class TeacherDeliveryAward {
  /** 索引 */
  index: number;

  /** 獎勵來源類型 */
  sourceType: TeacherAwardInventorySourceTypeEnum;

  /** 教師派獎物品清單 */
  items: Award[];
}

/**
 * 教師發放獎勵的結果。
 */
export class TeacherAwardDeliveryResultDto extends ApiResOkBaseDto {
  /**
   * 派送獎勵的學生uid清單。
   */
  studentUidList: number[];

  /**
   * 派送的獎勵清單。(學生uid清單中的每一位學生都會收到這些獎勵。)
   */
  teacherDeliveryAwardList: TeacherDeliveryAward[];

  /**
   * 建構子，用於創建一個新的 TeacherAwardDeliveryResultDto 實例。
   * @param studentUidList 派送獎勵的學生uid清單。
   * @param teacherDeliveryAwardList 教師在四週中所選的派送獎勵清單。
   */
  constructor(studentUidList: number[], teacherDeliveryAwardList: TeacherDeliveryAward[]) {
    super();
    this.studentUidList = studentUidList;
    this.teacherDeliveryAwardList = teacherDeliveryAwardList;
  }
}
