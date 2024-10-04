import {
  DeliveryStudyTaskDto,
  GetStudentCompleteStatusListDataDto,
  GetStudentCompleteStatusPagedResultDto,
  GiveUpExpiredTaskDto,
  GiveUpExpiredTaskResultDto,
  StudyGetRunningTaskListResultDto,
  StudyTaskCompleteDto,
  StudyTaskCompleteResultDto,
} from '@/hero-api/dto/study-task.dto';
import { fetchV2, postV2 } from './http-server';
import { TeacherDeliveryAward } from '@/hero-api/dto/teacher-award-inventory.dto';
import { GetStudyTaskCountInfoResultDto } from '@/hero-api/dto/teacher-admin-resource.dto';

// 取得教師派任務資料
export class HeroApiStudyTaskAPI {
  /**
   * 教師派任務。
   * @param studentUidList 包含在發送中的學生UID數組。
   * @param teacherDeliveryAwardList 分配給教師的獎勵列表中選擇的獎品。
   * @param multiDataTaskDataIds 多重指定條件 任務id清單(限制只有3個條件)。
   * @param taskName 任務名稱。
   * @param taskDescription 任務描述。
   * @param effectiveDate 任務生效日期。
   * @param expiryDate 任務到期日期。
   */
  public static postStudyTask(
    studentUidList: number[],
    teacherDeliveryAwardList: TeacherDeliveryAward[],
    multiDataTaskDataIds: number[],
    taskName: string,
    taskDescription: string,
    effectiveDate: Date,
    expiryDate: Date,
  ): Promise<DeliveryStudyTaskDto> {
    const dto = new DeliveryStudyTaskDto();

    dto.studentUidList = studentUidList;
    dto.teacherDeliveryAwardList = teacherDeliveryAwardList;
    dto.conditionType1 = 0;
    dto.conditionType2 = 0;
    dto.conditionType3 = 0;
    dto.requiredConditionValue1 = 0;
    dto.requiredConditionValue2 = 0;
    dto.requiredConditionValue3 = 0;
    dto.multiDataTaskDataIds = multiDataTaskDataIds;
    dto.multiDataTaskConditionType = 1;
    dto.multiDataTaskValues = new Array(multiDataTaskDataIds.length).fill(1);
    dto.taskName = taskName;
    dto.taskDescription = taskDescription;
    dto.effectiveDate = effectiveDate;
    dto.expiryDate = expiryDate;

    return postV2<DeliveryStudyTaskDto>('/v2/study-task/delivery-task', dto, new DeliveryStudyTaskDto());
  }

  /**
   * 獲取已使用的學習任務次數
   */
  public static listStudentsCompleteStatus(
    dto: GetStudentCompleteStatusListDataDto,
  ): Promise<GetStudentCompleteStatusPagedResultDto> {
    return fetchV2<GetStudentCompleteStatusPagedResultDto>(
      '/v2/study-task/list-students-complete-status',
      dto,
      new GetStudentCompleteStatusPagedResultDto({ page: 0, pageSize: 100, total: 0, entities: [] }),
    );
  }

  /**
   * 獲取已使用的學習任務次數
   */
  public static getStudyTaskCountInfo(): Promise<GetStudyTaskCountInfoResultDto> {
    return fetchV2<GetStudyTaskCountInfoResultDto>(
      '/v2/teacher-admin-resource/study-task-count',
      {},
      new GetStudyTaskCountInfoResultDto(0, 0),
    );
  }

  /**
   * 取得進行中任務清單
   * @returns Promise<StudyGetRunningTaskListResultDto>
   */
  public static getRunningTaskList(): Promise<StudyGetRunningTaskListResultDto> {
    return fetchV2<StudyGetRunningTaskListResultDto>(
      '/v2/study-task/running-task-list',
      {},
      new StudyGetRunningTaskListResultDto(),
    );
  }

  /**
   * 完成任務
   * @param runningTaskUid 任務的唯一標識符
   * @returns Promise<StudyTaskCompleteResultDto>
   */
  public static completeTask(runningTaskUid: number): Promise<StudyTaskCompleteResultDto> {
    const dto = new StudyTaskCompleteDto();
    dto.runningTaskUid = runningTaskUid;

    return postV2<StudyTaskCompleteResultDto>('/v2/study-task/complete-task', dto, new StudyTaskCompleteResultDto([]));
  }

  /**
   * 放棄逾期的任務
   * @param runningTaskUid 任務的唯一標識符
   * @returns Promise<GiveUpExpiredTaskResultDto>
   */
  public static giveUpExpiredTask(runningTaskUid: number): Promise<GiveUpExpiredTaskResultDto> {
    const dto = new GiveUpExpiredTaskDto();
    dto.runningTaskUid = runningTaskUid;

    return postV2<GiveUpExpiredTaskResultDto>(
      '/v2/study-task/give-up-expired-task',
      dto,
      new GiveUpExpiredTaskResultDto(),
    );
  }
}
