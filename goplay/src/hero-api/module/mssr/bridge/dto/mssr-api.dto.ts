import { Award } from '@/hero-api/dto/award.dto';

/**
 * mssr api response通用格式
 * mssr api response格式不固定，有的是result + data，有的是result + resMessage，有的是result + resMessage + data
 * 若呼叫的mssr api回傳值不包含result，則需在mssr端補上result
 */
export class MssrApiResDto {
  result: string;
  resMessage?: string;
  data?: string;
}

// TODO 移入bridge-award.dto.ts, 並改名為BridgeAwardResDto
/** mssr api response格式 */
export class AwardResDto extends MssrApiResDto {
  /** 派送成功的獎勵物品 */
  awardItems: Award[];
  /** 派送失敗的獎勵物品 */
  failAwards: Award[];
}
