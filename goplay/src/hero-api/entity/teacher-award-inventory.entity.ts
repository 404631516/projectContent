import { UserOwnedUpdateAtEntity } from './base.entity';
import { ContestAwardItemTypeEnum } from '../dto/award.dto';
import { TeacherAwardInventorySourceTypeEnum } from '../dto/teacher-award-inventory.dto';

export class TeacherAwardInventory extends UserOwnedUpdateAtEntity {
  id: number;

  /**
   * (1)週索引：範圍從 index 1 到 index 4；這四個 index 及其對應的欄位內容，
   * 都是根據 [管理員週派獎設定] 中的 index 1 到 index 4 的週獎勵設定來決定的。
   * (2)校園賽事索引：設定值固定為 index 0，其獎勵內容只有金幣、水晶兩項。
   */
  index: number;

  sourceType: TeacherAwardInventorySourceTypeEnum;

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
