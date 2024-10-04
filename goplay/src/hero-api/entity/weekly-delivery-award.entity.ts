import { ContestAwardItemTypeEnum } from '../dto/award.dto';

export class WeeklyDeliveryAward {
  id: number;

  index: number;

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
