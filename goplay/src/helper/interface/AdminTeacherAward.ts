import { ContestAwardItemTypeEnum } from '@/hero-api/dto/award.dto';
import { RewardItemKeyName } from '../enum/AnswerGame';
import { SelectOption } from './Common';

/** 教師派獎管理 */

/** 獎勵設定 */
export interface TeacherRewardOptionData {
  /** 獎勵類別 */
  itemType: ContestAwardItemTypeEnum;
  /** 獎勵類別名稱 */
  itemTypeName: RewardItemKeyName;
  /** 是否有ItemId */
  hasItemId: boolean;
  /** 可重複 */
  isMultiple: boolean;
  /** 數量固定 */
  isFixedCount: boolean;
  /** 獎勵選項 */
  rewardItemOptionList: SelectOption[];
}
