import { fetchV2, postV2 } from '../api/http-server';
import {
  GetTeacherAwardInventoryResultDto,
  TeacherAwardDeliveryDto,
  TeacherAwardDeliveryResultDto,
  TeacherDeliveryAward,
} from '@/hero-api/dto/teacher-award-inventory.dto';

// 取得周次教師獎勵資料
export class TeacherWeekDeliveryAwardAPI {
  /**
   * 取得教師獎勵清單。
   */
  public static getTeacherAwardInventory(): Promise<GetTeacherAwardInventoryResultDto> {
    return fetchV2<GetTeacherAwardInventoryResultDto>(
      '/v2/teacher-award-inventory/get-list',
      {},
      new GetTeacherAwardInventoryResultDto([]),
    );
  }

  /**
   * 根據提供的學生和獎勵列表發送獎勵。
   * @param studentUidList 包含在發送中的學生UID數組。
   * @param teacherDeliveryAwardList 分配給教師的獎勵列表中選擇的獎品。
   */
  public static postTeacherAwardDelivery(
    studentUidList: number[],
    teacherDeliveryAwardList: TeacherDeliveryAward[],
  ): Promise<TeacherAwardDeliveryResultDto> {
    const dto = new TeacherAwardDeliveryDto();
    dto.studentUidList = studentUidList;
    dto.teacherDeliveryAwardList = teacherDeliveryAwardList;

    return postV2<TeacherAwardDeliveryResultDto>(
      '/v2/teacher-award-inventory/delivery',
      dto,
      new TeacherAwardDeliveryResultDto([], []),
    );
  }
}
