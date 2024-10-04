import { ContestAwardItemTypeEnum } from '../dto/award.dto';
import { AwardTypeEnum } from '../dto/admin-award-settings.dto';

export class AdminAwardSettings {
  id: number;

  /**
   * (1)週索引：範圍從 index 0 到 index 4；其中 index 0 代表是管理員設定的下週開始的週獎勵，
   * index 1 到 index 4 則是根據 index 0 逐週往後推移的週獎勵。
   * (2)校園賽事索引：設定值固定為 index 0，其獎勵內容只有金幣、水晶兩項。
   */
  index: number;

  awardType: AwardTypeEnum;

  effectiveDate: Date;

  expiryDate: Date;

  coins: number;

  crystal: number;

  itemType1: ContestAwardItemTypeEnum;

  itemId1: number;

  itemCount1: number;

  itemType2: ContestAwardItemTypeEnum;

  itemId2: number;

  itemCount2: number;

  itemType3: ContestAwardItemTypeEnum;

  itemId3: number;

  itemCount3: number;

  itemType4: ContestAwardItemTypeEnum;

  itemId4: number;

  itemCount4: number;

  itemType5: ContestAwardItemTypeEnum;

  itemId5: number;

  itemCount5: number;
}
