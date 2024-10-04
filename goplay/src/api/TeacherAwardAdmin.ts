import { fetchV2, postV2 } from './http-server';
import {
  AdminAwardSettingsResultDto,
  AdminGetAwardDto,
  AdminSetAwardDto,
} from '@/hero-api/dto/admin-award-settings.dto';
import { AdminAwardSettings } from '@/hero-api/entity/admin-award-settings.entity';

/** 管理者取得周次教師獎勵資料 */
export class AdminWeekDeliveryAwardAPI {
  /** 管理者取得周次教師獎勵資料 */
  public static getWeekDeliveryAward(dto: AdminGetAwardDto): Promise<AdminAwardSettingsResultDto> {
    return fetchV2<AdminAwardSettingsResultDto>(
      '/v2/admin-award-settings/get',
      dto,
      new AdminAwardSettingsResultDto(new AdminAwardSettings()),
    );
  }

  /**
   * 管理者更新周次教師獎勵資料
   * @param awardList
   * @returns
   */
  public static postWeekDeliveryAward(dto: AdminSetAwardDto): Promise<AdminAwardSettingsResultDto> {
    return postV2<AdminAwardSettingsResultDto>(
      '/v2/admin-award-settings/set',
      dto,
      new AdminAwardSettingsResultDto(new AdminAwardSettings()),
    );
  }
}
